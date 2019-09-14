import { Extensions } from './extensions';
import { Initializer } from '@azure-tools/codegen';


export class XML extends Initializer implements XML {
  attribute = false;
  wrapped = false;

  constructor(initializer?: Partial<XML>) {
    super();
    this.apply(initializer);
  }
}
export interface XML extends Extensions {
  name?: string;
  namespace?: string; // url
  prefix?: string;
  attribute: boolean;
  wrapped: boolean;
}
