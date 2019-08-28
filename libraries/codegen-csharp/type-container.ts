import { Class } from './class';
import { Interface } from './interface';
import { Property } from './property';
import { TypeDeclaration } from './type-declaration';

export interface TypeContainer {
  addClass(c: Class): Class;

  addInterface(c: Interface): Interface;
  fullName: string;
}

export interface IInterface extends TypeDeclaration {
  allProperties: Array<Property>;
}