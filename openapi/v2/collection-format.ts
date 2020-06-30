/**
 *  Determines the format of the array if type array is used 
 * 
 * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameter-object
*/
export enum CollectionFormat {
  /** comma separated values foo, bar. */
  CSV = 'csv',

  /** space separated values foo bar. */
  SSV = 'ssv',

  /** tab separated values foo\tbar. */
  TSV = 'tsv',

  /** pipe separated values foo | bar. */
  Pipes = 'pipes',

  /** corresponds to multiple parameter instances instead of multiple values for a single instance foo = bar & foo=baz.This is valid only for parameters in "query" or "formData".  */
  Multi = 'multi'
}