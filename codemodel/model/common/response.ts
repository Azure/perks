import { Language, Protocol } from './metadata';

// response and request share some common features
// 'headers'


export interface Response<L extends Language = Language, P extends Protocol = Protocol> {

}

export interface Exception<L extends Language = Language, P extends Protocol = Protocol> extends Response<L, P> {

}