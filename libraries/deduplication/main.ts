/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AnyObject, Data, DataHandle, DataSink, DataSource, Mapping, Node, Processor, ProxyObject, QuickDataSource, visit, } from '@microsoft.azure/datastore';
import { Dictionary, items, values } from '@microsoft.azure/linq';
import { areSimilar } from '@microsoft.azure/object-comparison';
import * as compareVersions from 'compare-versions';
import { fileURLToPath } from 'url';

type componentType = 'schemas' | 'responses' | 'parameters' | 'examples' | 'requestBodies' | 'headers' | 'securitySchemes' | 'links' | 'callbacks';

export class Deduplicator {
  private hasRun = false;

  // table:
  // prevPointers -> newPointers
  // this will serve to generate a source map externally
  public mappings = new Dictionary<string>();

  // table:
  // oldRefs -> newRefs
  private refs = new Dictionary<string>();

  // sets containing the UIDs of already deduplicated components
  private deduplicatedComponents = {
    schemas: new Set<string>(),
    responses: new Set<string>(),
    parameters: new Set<string>(),
    examples: new Set<string>(),
    requestBodies: new Set<string>(),
    headers: new Set<string>(),
    securitySchemes: new Set<string>(),
    links: new Set<string>(),
    callbacks: new Set<string>()
  };

  // sets containing the UIDs of components already crawled
  private crawledComponents = {
    schemas: new Set<string>(),
    responses: new Set<string>(),
    parameters: new Set<string>(),
    examples: new Set<string>(),
    requestBodies: new Set<string>(),
    headers: new Set<string>(),
    securitySchemes: new Set<string>(),
    links: new Set<string>(),
    callbacks: new Set<string>()
  };

  // sets containing the UIDs of components already visited.
  // This is used to prevent circular references.
  private visitedComponents = {
    schemas: new Set<string>(),
    responses: new Set<string>(),
    parameters: new Set<string>(),
    examples: new Set<string>(),
    requestBodies: new Set<string>(),
    headers: new Set<string>(),
    securitySchemes: new Set<string>(),
    links: new Set<string>(),
    callbacks: new Set<string>()
  };

  // initially the target is the same as the original object
  private target: any;
  constructor(originalFile: any) {
    this.target = originalFile;
  }

  private init() {
    // set initial refs table
    // NOTE: this assumes that only components can be referenced.
    for (const { key: type, children } of visit(this.target.components)) {
      for (const { key: uid } of children) {
        this.refs[`#/components/${type}/${uid}`] = `#/components/${type}/${uid}`;
      }
    }

    // 1. deduplicate components
    if (this.target.components) {
      this.deduplicateComponents();
    }

    // 2. deduplicate paths
    if (this.target.paths) {
      this.deduplicatePaths();
    }

    // 3. deduplicate other fields
    if (this.target.servers) {
      this.deduplicateAdditionalFieldMembers('servers');
    }

    if (this.target.security) {
      this.deduplicateAdditionalFieldMembers('security');
    }

    if (this.target.tags) {
      this.deduplicateAdditionalFieldMembers('tags');
    }
  }

  private deduplicateAdditionalFieldMembers(fieldName: string) {
    const deduplicatedMembers = new Set<string>();

    // TODO: remaining fields are arrays and not maps, so when a member is deleted
    // it leaves an empty item. Figure out what is the best way to handle this. 
    // convert to map and then delete?
    for (const { key: memberUid } of visit(this.target[fieldName])) {
      if (!deduplicatedMembers.has(memberUid)) {
        const member = this.target[fieldName][memberUid];

        // iterate over all the members
        for (const { key: anotherMemberUid, value: anotherMember } of visit(this.target[fieldName])) {

          // ignore merge with itself
          if (memberUid !== anotherMemberUid && areSimilar(member, anotherMember)) {

            // finish up
            delete this.target[fieldName][anotherMemberUid];
            this.updateMappings(`/${fieldName}/${anotherMemberUid}`, `/${fieldName}/${memberUid}`);
            deduplicatedMembers.add(anotherMemberUid);
          }
        }

        deduplicatedMembers.add(memberUid);
      }
    }
  }

  private deduplicatePaths() {
    const deduplicatedPaths = new Set<string>();
    for (let { key: pathUid } of visit(this.target.paths)) {
      if (!deduplicatedPaths.has(pathUid)) {
        const xMsMetadata = 'x-ms-metadata';
        const path = this.target.paths[pathUid];

        // extract metadata to be merged
        let apiVersions = path[xMsMetadata].apiVersions;
        let filename = path[xMsMetadata].filename;
        let originalLocations = path[xMsMetadata].originalLocations;
        const pathFromMetadata = path[xMsMetadata].path;

        // extract path properties excluding metadata
        const { 'x-ms-metadata': metadataCurrent, ...filteredPath } = path;

        // iterate over all the paths
        for (const { key: anotherPathUid, value: anotherPath } of visit(this.target.paths)) {

          // ignore merge with itself
          if (pathUid !== anotherPathUid) {

            // extract the another path's properties excluding metadata
            const { 'x-ms-metadata': metadataSchema, ...filteredAnotherPath } = anotherPath;

            // TODO: Add more keys to ignore.
            const keysToIgnore: Array<string> = ['description'];

            // they should have the same name to be merged and they should be similar
            if (areSimilar(filteredPath, filteredAnotherPath, ...keysToIgnore) && path[xMsMetadata].path === anotherPath[xMsMetadata].path) {

              // merge metadata
              apiVersions = apiVersions.concat(anotherPath[xMsMetadata].apiVersions);
              filename = filename.concat(anotherPath[xMsMetadata].filename);
              originalLocations = originalLocations.concat(anotherPath[xMsMetadata].originalLocations);

              // the discriminator to take contents is the api version
              const maxApiVersionPath = this.getMaxApiVersion(path[xMsMetadata].apiVersions);
              const maxApiVersionAnotherPath = this.getMaxApiVersion(anotherPath[xMsMetadata].apiVersions);
              let uidPathToDelete = anotherPathUid;
              if (compareVersions(maxApiVersionPath, maxApiVersionAnotherPath) === -1) {

                // if the current path max api version is less than the another path, swap ids.
                uidPathToDelete = pathUid;
                pathUid = anotherPathUid;
              }

              // finish up
              delete this.target.paths[uidPathToDelete];
              this.updateMappings(`/paths/${uidPathToDelete}`, `/paths/${pathUid}`);
              deduplicatedPaths.add(uidPathToDelete);
            }
          }
        }

        this.target.paths[pathUid][xMsMetadata] = {
          apiVersions: [...new Set([...apiVersions])],
          filename: [...new Set([...filename])],
          path: pathFromMetadata,
          originalLocations: [...new Set([...originalLocations])]
        };
        deduplicatedPaths.add(pathUid);
      }
    }
  }

  private deduplicateComponents() {
    for (const { key: type, children: componentsMember } of visit(this.target.components)) {
      for (const { key: componentUid } of componentsMember) {
        this.deduplicateComponent(componentUid, type);
      }
    }
  }

  private deduplicateComponent(componentUid: string, type: string) {
    switch (type) {
      case 'schemas':
      case 'responses':
      case 'parameters':
      case 'examples':
      case 'requestBodies':
      case 'headers':
      case 'securitySchemes':
      case 'links':
      case 'callbacks':
        if (!this.deduplicatedComponents[type].has(componentUid)) {
          if (!this.crawledComponents[type].has(componentUid)) {
            this.crawlComponent(componentUid, type);
          }

          // deduplicate crawled component
          const xMsMetadata = 'x-ms-metadata';
          const component = this.target.components[type][componentUid];

          // extract metadata to be merged
          let apiVersions = component[xMsMetadata].apiVersions;
          let filename = component[xMsMetadata].filename;
          let originalLocations = component[xMsMetadata].originalLocations;
          const name = component[xMsMetadata].name;

          // extract component properties excluding metadata
          const { 'x-ms-metadata': metadataCurrent, ...filteredComponent } = component;

          // iterate over all the components of the same type of the component
          for (const { key: anotherComponentUid, value: anotherComponent } of visit(this.target.components[type])) {

            // ignore merge with itself
            if (componentUid !== anotherComponentUid) {

              // extract the another component's properties excluding metadata
              const { 'x-ms-metadata': metadataSchema, ...filteredAnotherComponent } = anotherComponent;

              // TODO: Add more keys to ignore.
              const keysToIgnore: Array<string> = ['description'];

              // they should have the same name to be merged and they should be similar
              if (areSimilar(filteredAnotherComponent, filteredComponent, ...keysToIgnore) && anotherComponent[xMsMetadata].name === component[xMsMetadata].name) {

                // merge metadata
                apiVersions = apiVersions.concat(anotherComponent[xMsMetadata].apiVersions);
                filename = filename.concat(anotherComponent[xMsMetadata].filename);
                originalLocations = originalLocations.concat(anotherComponent[xMsMetadata].originalLocations);

                // the discriminator to take contents is the api version
                const maxApiVersionComponent = this.getMaxApiVersion(component[xMsMetadata].apiVersions);
                const maxApiVersionAnotherComponent = this.getMaxApiVersion(anotherComponent[xMsMetadata].apiVersions);
                let uidComponentToDelete = anotherComponentUid;
                if (compareVersions(maxApiVersionComponent, maxApiVersionAnotherComponent) === -1) {

                  // if the current component max api version is less than the another component, swap ids.
                  uidComponentToDelete = componentUid;
                  componentUid = anotherComponentUid;
                }

                // finish up
                delete this.target.components[type][uidComponentToDelete];
                this.refs[`#/components/${type}/${uidComponentToDelete}`] = `#/components/${type}/${componentUid}`;
                this.updateRefs(this.target);
                this.updateMappings(`/components/${type}/${uidComponentToDelete}`, `/components/${type}/${componentUid}`);
                this.deduplicatedComponents[type].add(uidComponentToDelete);
              }
            }
          }

          this.target.components[type][componentUid][xMsMetadata] = {
            apiVersions: [...new Set([...apiVersions])],
            filename: [...new Set([...filename])],
            name,
            originalLocations: [...new Set([...originalLocations])]
          };
          this.deduplicatedComponents[type].add(componentUid);
        }
        break;
      default:
        throw new Error(`Unknow component type: '${type}'`);
    }
  }

  private getMaxApiVersion(apiVersions: Array<string>): string {
    let result = '0';
    for (const version of apiVersions) {
      if (version && compareVersions(version, result) >= 0) {
        result = version;
      }
    }

    return result;
  }

  private crawlComponent(uid: string, type: componentType): void {
    if (!this.visitedComponents[type].has(uid)) {
      if (this.target.components[type][uid]) {
        this.visitedComponents[type].add(uid);
        this.crawlObject(this.target.components[type][uid]);
      } else {
        throw new Error(`Trying to crawl undefined component with uid '${uid}' and type '${type}'!`);
      }
    }

    this.crawledComponents[type].add(uid);
  }

  private crawlObject(obj: any): void {
    for (const { key, value } of visit(obj)) {
      if (key === '$ref') {
        const refParts = value.split('/');
        const componentUid = refParts.pop();
        const type = refParts.pop();
        this.deduplicateComponent(componentUid, type);
      } else if (value && typeof (value) === 'object') {
        this.crawlObject(value);
      }
    }
  }

  private updateRefs(obj: any): void {
    for (const { value } of visit(obj)) {
      if (typeof value === 'object') {
        const ref = value.$ref;
        if (ref) {
          // see if this object has a $ref
          const newRef = this.refs[ref];
          if (newRef) {
            value.$ref = newRef;
          } else {
            throw new Error(`$ref to original location '${ref}' is not found in the new refs collection`);
          }
        }

        // now, recurse into this object
        this.updateRefs(value);
      }
    }
  }

  private updateMappings(oldPointer: string, newPointer: string): void {
    this.mappings[oldPointer] = newPointer;
    for (const [key, value] of Object.entries(this.mappings)) {
      if (value === oldPointer) {
        this.mappings[key] = newPointer;
      }
    }
  }

  public get output() {
    if (!this.hasRun) {
      this.init();
      this.hasRun = true;
    }
    return this.target;
  }
}
