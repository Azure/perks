import { Extensions } from './extensions';
import { uri } from './uri';
import { Initializer } from '@azure-tools/codegen';

export interface ExternalDocumentation extends Extensions {
  description?: string;
  url: uri; // uriref
}

export class ExternalDocumentation extends Initializer implements ExternalDocumentation {
  constructor(public url: uri, initializer?: Partial<ExternalDocumentation>) {
    super();
    this.apply(initializer);
  }
}
