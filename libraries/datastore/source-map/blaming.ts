/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MappedPosition, Position as sourceMapPosition } from 'source-map';
import { JsonPath } from '../ref/jsonpath';

import { values } from '@microsoft.azure/linq';
import { DataStore } from '../data-store/data-store';
import { EncodeEnhancedPositionInName, TryDecodeEnhancedPositionFromName } from './source-map';

export class BlameTree {
  public static Create(dataStore: DataStore, position: MappedPosition): BlameTree {
    const data = dataStore.ReadStrictSync(position.source);
    const blames = data.Blame(position);

    // propagate smart position
    const enhanced = TryDecodeEnhancedPositionFromName(position.name);
    if (enhanced !== undefined) {
      for (const blame of blames) {
        blame.name = EncodeEnhancedPositionInName(blame.name, { ...enhanced, ...TryDecodeEnhancedPositionFromName(blame.name) });
      }
    }

    return new BlameTree(position, blames.map(pos => BlameTree.Create(dataStore, pos)));
  }

  private constructor(
    public readonly node: MappedPosition & { path?: JsonPath },
    public readonly blaming: Array<BlameTree>) { }

  public BlameLeafs(): Array<MappedPosition> {
    const result: Array<MappedPosition> = [];

    const todos: Array<BlameTree> = [this];
    let todo: BlameTree | undefined;
    while (todo = todos.pop()) {
      // report self
      if (todo.blaming.length === 0) {
        result.push({
          column: todo.node.column,
          line: todo.node.line,
          name: todo.node.name,
          source: todo.node.source
        });
      }
      // recurse
      todos.push(...todo.blaming);
    }
    return values(result).linq.distinct(x => JSON.stringify(x)).linq.toArray();
  }
}
