import { ConstantSchema, Schema } from './schema';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export enum SchemaType {
  /** a collection of items */
  Array = 'array',

  /** an associative array (ie, dictionary, hashtable, etc) */
  Dictionary = 'dictionary',

  /** a true or false value */
  Boolean = 'boolean',

  /** an integer value */
  Integer = 'integer',

  /** a number value */
  Number = 'number',

  /** an object of some type */
  Object = 'object',

  /** a string  */
  String = 'string',

  /** a choice between one of several  values (ie, 'enum')
   * 
   * @description - this is essentially can be thought of as an 'enum' 
   * that is a choice between one of several strings
   */
  Choice = 'choice',

  /** a constant value */
  Constant = 'constant',

  And = 'and',

  Or = 'or',

  Xor = 'xor',

  Not = 'not',
  /** the type is not known.
   * 
   * @description it's possible that we just may make this an error 
   * in representation.
   */
  Unknown = 'unknown'
}

export type CompoundSchemaTypes =
  SchemaType.And |
  // SchemaType.Or |
  SchemaType.Xor;

export type PrimitiveSchemaTypes =
  SchemaType.Boolean |
  SchemaType.Integer |
  SchemaType.Number |
  SchemaType.String;

export type ValueSchemaTypes =
  PrimitiveSchemaTypes |
  SchemaType.Array |
  SchemaType.Choice;

export type ObjectSchemaTypes =
  SchemaType.And |
  SchemaType.Or |
  SchemaType.Dictionary |
  SchemaType.Object;

export type AllSchemaTypes =
  ValueSchemaTypes | ObjectSchemaTypes | SchemaType.Constant;
