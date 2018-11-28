/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AnyObject, Data, DataHandle, DataSink, DataSource, Mapping, Node, Processor, ProxyObject, QuickDataSource, visit, } from '@microsoft.azure/datastore';
import { Dictionary, items, values } from '@microsoft.azure/linq';
import { areSimilar } from '@microsoft.azure/object-comparison';
import * as compareVersions from 'compare-versions';

type componentType = 'schemas' | 'responses' | 'parameters' | 'examples' | 'requestBodies' | 'headers' | 'securitySchemes' | 'links' | 'callbacks';

export class Deduplicator {
  private hasRun = false;

  // table:
  // prevPointers -> newPointers
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
    this.setInitialRefsTable(this.target);

    // deduplicate components
    if (this.target.components) {
      this.deduplicateComponents();
    }

    // TODO: deduplicate paths

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
          const { 'x-ms-metadata': metadataCurrent, ...filteredReferencedComponent } = component;

          // iterate over all the components of the same type of the component
          for (const { key: anotherComponentUid, value: anotherComponent } of visit(this.target.components[type])) {

            // ignore merge with itself
            if (componentUid !== anotherComponentUid) {

              // extract the another component's properties excluding metadata
              const { xMsMetadata: metadataSchema, ...filteredSchema } = anotherComponent;

              // TODO: Add more keys to ignore.
              const keysToIgnore: Array<string> = ['description'];

              // they should have the same name to be merged and they should be similar
              if (areSimilar(filteredSchema, filteredReferencedComponent, ...keysToIgnore) && anotherComponent[xMsMetadata].name === component[xMsMetadata].name) {

                // merge metadata
                apiVersions = apiVersions.concat(anotherComponent[xMsMetadata].apiVersions);
                filename = filename.concat(anotherComponent[xMsMetadata].filename);
                originalLocations = originalLocations.concat(anotherComponent[xMsMetadata].originalLocations);


                let uidComponentToDelete = anotherComponentUid;
                // the discriminator to take contents is the api version
                if (anotherComponent[xMsMetadata].apiVersions &&
                  !component[xMsMetadata].apiVersions &&
                  compareVersions(component[xMsMetadata].apiVersions, anotherComponent[xMsMetadata].apiVersions) === -1) {
                  // swap ids to prioritize the one with the latest version
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

          this.target.component[type][componentUid][xMsMetadata] = {
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

  private crawlComponent(uid: string, type: componentType) {
    if (this.visitedComponents[type]) {
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
  }

  private crawlObject(obj: any) {
    for (const { key, value } of visit(obj)) {
      if (key === '$ref') {
        const refParts = value.split('/');
        const componentUid = refParts.pop();
        const type = refParts.pop();
        this.deduplicateComponent(componentUid, type);
      } else if (Array.isArray(key) || typeof (value) === 'object') {
        this.crawlObject(value);
      }
    }
  }

  private setInitialRefsTable(obj: any) {
    for (const { value, key } of visit(obj)) {
      if (key === '$ref') {
        this.refs[value] = value;
      } else if (typeof value === 'object') {
        this.setInitialRefsTable(value);
      }
    }
  }

  private updateRefs(obj: any) {
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

  private updateMappings(oldPointer: string, newPointer: string) {
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
