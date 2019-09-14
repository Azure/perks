import { Dictionary } from '@azure-tools/linq';
import { Extensions } from './extensions';
import { Initializer, DeepPartial } from '@azure-tools/codegen';

/** Disciminator for polymorphic class hierarchy */
export interface Discriminator extends Extensions {
  propertyName: string;
  mapping?: Dictionary<string>;
}

export class Discriminator extends Initializer implements Discriminator {
  constructor(public propertyName: string, initializer?: DeepPartial<Discriminator>) {
    super();
    this.apply(initializer);
  }
}
