import { Dictionary } from '@azure-tools/linq';

/** A dictionary of open-ended 'x-*' extensions propogated from the original source document. */
export interface Extensions {
  /** additional metadata extensions dictionary
   * 
   * @notes - undefined means that there are no extensions present on the node.
   */
  extensions?: Dictionary<any>;
}
