/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { intersect, DeepPartial } from '@azure-tools/codegen';

import { Expression, ExpressionOrLiteral, LiteralExpression, toExpression, valueOf } from './expression';
import { Namespace } from './namespace';
import { Parameter } from './parameter';
import { Property } from './property';
import { TypeDeclaration } from './type-declaration';
import { Local, Variable } from './variable';
import { Dictionary, length } from '@azure-tools/linq';
import { IInterface } from './type-container';

export class ClassType implements TypeDeclaration {
  get fullName() {
    return this.namespace.fullName ? `${this.namespace.fullName}.${this.name}` : this.name;
  }
  private namespace: Namespace;
  constructor(namespace: Namespace | string, private name: string) {
    this.namespace = typeof (namespace) === 'string' ? new Namespace(namespace) : namespace;
  }

  public get declaration(): string {
    return `${this.fullName}`;
  }

  public toString(): string {
    return this.declaration;
  }

  public new(...parameters: Array<ExpressionOrLiteral>): Expression {
    return toExpression(`new ${this.fullName}(${parameters.joinWith(valueOf)})`);
  }

  public Cast(expression: ExpressionOrLiteral) {
    return toExpression(`(${this.declaration})${expression}`);
  }
}

export class EnumType implements TypeDeclaration {
  constructor(private namespace: Namespace, private name: string) {
  }

  public get declaration(): string {
    return `${this.namespace}.${this.name}`;
  }

  public member(enumMember: string): Expression {
    return new LiteralExpression(`${this.declaration}.${enumMember}`);
  }

  public get definition(): string {
    return '';
  }

  public toString(): string {
    return this.declaration;
  }

  public newProperty(name: string, objectInitializer?: DeepPartial<Property>): Property {
    return new Property(name, this, objectInitializer);
  }
  public newParameter(name: string, objectInitializer?: DeepPartial<Parameter>): Parameter {
    return new Parameter(name, this, objectInitializer);
  }

  public withMembers<T>(): T & EnumType {
    /* eslint-disable */
    const $this = this;
    return <T & EnumType><any>new Proxy($this, {
      get(target, prop, receiver) {
        // return a property if there is one for this.
        if ((<any>target)[prop]) {
          return (<any>target)[prop];
        }
        return $this.member(prop.toString());
      }
    });
    /* eslint-enable */
  }
}

export interface Index<T> {
  [key: number]: T;
}

export const None: Namespace = new Namespace('');
const system: Namespace = new Namespace('global::System');
const threading = new Namespace('Threading', system);
const text = new Namespace('Text', system);
const rx = new Namespace('RegularExpressions', text);

const tasks = new Namespace('Tasks', threading);
const action = new ClassType(system, 'Action');
const collections = new Namespace('Collections', system);
const generic = new Namespace('Generic', collections);
const net = new Namespace('Net', system);
const io = new Namespace('IO', system);
const http = new Namespace('Http', net);
const headers = new Namespace('Headers', http);
const task = new ClassType(tasks, 'Task');
const encoding = new ClassType(text, 'Encoding');
const linq = new Namespace('Linq', system);

const xml = new Namespace('Xml', system);
const xmllinq = new Namespace('Linq', xml);
const stringClass = new ClassType(system, 'String');

export const System = intersect(system, {
  Threading: intersect(threading, {
    CancellationToken: new ClassType(threading, 'CancellationToken'),
    CancellationTokenSource: new ClassType(threading, 'CancellationTokenSource'),

    Tasks: intersect(tasks, {
      Task(taskType?: TypeDeclaration): TypeDeclaration {
        return taskType ? new ClassType(tasks, `Task<${taskType.declaration}>`) : task;
      }
    })
  }),
  Convert: intersect(new ClassType(system, 'Convert'), {
    ToBase64String: (expression: ExpressionOrLiteral) => toExpression(`${System.Convert}.ToBase64String( ${expression})`)
  }),
  Linq: intersect(linq, {
    Enumerable: intersect(new ClassType(linq, 'Enumerable'), {
      ToArray: (source: ExpressionOrLiteral) => toExpression(`${System.Linq.Enumerable}.ToArray(${valueOf(source)})`),
      Select: (source: ExpressionOrLiteral, selector: /* delegate */ string) => toExpression(`${System.Linq.Enumerable}.Select(${valueOf(source)}, ${selector})`),
      Where: (source: ExpressionOrLiteral, predicate: /* delegate */ string) => toExpression(`${System.Linq.Enumerable}.Where(${valueOf(source)}, ${predicate})`),
      ToDictionary: (source: ExpressionOrLiteral, keySelector: /* delegate */ string, valueSelector: /* delegate */ string) => toExpression(`${System.Linq.Enumerable}.ToDictionary(${valueOf(source)}, ${keySelector}, ${valueSelector})`),
      Empty: (type: TypeDeclaration) => toExpression(`${System.Linq.Enumerable}.Empty<${type.declaration}>()`),
    }
    )
  }),
  Object: new ClassType(system, 'Object'),
  String: intersect(stringClass, {
    Empty: new LiteralExpression('global::System.String.Empty'),
    IsNullOrEmpty: (expression: ExpressionOrLiteral) => toExpression(`${System.String}.IsNullOrEmpty(${toExpression(expression)})`),
    IsNullOrWhitespace: (expression: ExpressionOrLiteral) => toExpression(`${System.String}.IsNullOrWhitespace(${toExpression(expression)})`),
    /** @description Binds a Variable to the known instance methods of this type */
    $BindTo: ($instance: Variable) => {
      return intersect($instance, {
        Substring: (start: ExpressionOrLiteral, end?: ExpressionOrLiteral) => {
          return end ? `${$instance}.Substring(${start},${end})` : `${$instance}.Substring(${start})`;
        }
      });
    },
  }),
  StringComparison: new EnumType(system, 'StringComparison'),
  DateTime: new ClassType(system, 'DateTime'),
  DateTimeKind: intersect(new ClassType(system, 'DateTimeKind'), {
    Utc: new LiteralExpression('global::System.DateTimeKind.Utc'),
  }),
  EventArgs: new ClassType(system, 'EventArgs'),
  Exception: new ClassType(system, 'Exception'),
  OperationCanceledException: new ClassType(system, 'OperationCanceledException'),
  AggregateException: new ClassType(system, 'AggregateException'),
  TimeSpan: new ClassType(system, 'TimeSpan'),
  Type: new ClassType(system, 'Type'),
  Uri: new ClassType(system, 'Uri'),
  IFormatProvider: new ClassType(system, 'IFormatProvider'),
  Xml: intersect(xml, {
    Linq: intersect(xmllinq, {
      XElement: new ClassType(xmllinq, 'XElement'),
      XAttribute: new ClassType(xmllinq, 'XAttribute')
    })
  }),
  IO: intersect(io, {
    Stream: new ClassType(io, 'Stream')
  }),
  Text: intersect(text, {
    Encoding: intersect(encoding, {
      UTF8: new LiteralExpression(`${encoding.declaration}.UTF8`)
    }),
    RegularExpressions: intersect(rx, {
      Regex: new ClassType(rx, 'Regex')
    })
  }),
  Net: intersect(net, {
    WebProxy: new ClassType(net, 'WebProxy'),
    Http: intersect(http, {
      HttpRequestMessage: new ClassType(http, 'HttpRequestMessage'),
      HttpClient: new ClassType(http, 'HttpClient'),

      HttpClientHandler: new ClassType(http, 'HttpClientHandler'),
      HttpResponseMessage: new ClassType(http, 'HttpResponseMessage'),
      Headers: intersect(headers, {
        MediaTypeHeaderValue: intersect(
          new ClassType(headers, 'MediaTypeHeaderValue'), {
            Parse: (header: string) => toExpression(`${System.Net.Http.Headers.MediaTypeHeaderValue}.Parse("${header}")`)
          }),
        HttpHeaders: new ClassType(headers, 'HttpHeaders'),
        HttpResponseHeaders: new ClassType(headers, 'HttpResponseHeaders'),
      }),
      StringContent: new ClassType(http, 'StringContent'),
      StreamContent: new ClassType(http, 'StreamContent'),
      MultipartFormDataContent: new ClassType(http, 'MultipartFormDataContent'),
    }),
    /* eslint-disable */
    HttpStatusCode: intersect(new ClassType(net, 'HttpStatusCode'), <Dictionary<LiteralExpression> & Index<LiteralExpression>>{
      default: new LiteralExpression(''),
      100: new LiteralExpression('global::System.Net.HttpStatusCode.Continue'),
      101: new LiteralExpression('global::System.Net.HttpStatusCode.SwitchingProtocols'),
      200: new LiteralExpression('global::System.Net.HttpStatusCode.OK'),
      201: new LiteralExpression('global::System.Net.HttpStatusCode.Created'),
      202: new LiteralExpression('global::System.Net.HttpStatusCode.Accepted'),
      203: new LiteralExpression('global::System.Net.HttpStatusCode.NonAuthoritativeInformation'),
      204: new LiteralExpression('global::System.Net.HttpStatusCode.NoContent'),
      205: new LiteralExpression('global::System.Net.HttpStatusCode.ResetContent'),
      206: new LiteralExpression('global::System.Net.HttpStatusCode.PartialContent'),
      300: new LiteralExpression('global::System.Net.HttpStatusCode.Ambiguous'),
      301: new LiteralExpression('global::System.Net.HttpStatusCode.Moved'),
      302: new LiteralExpression('global::System.Net.HttpStatusCode.Redirect'),
      303: new LiteralExpression('global::System.Net.HttpStatusCode.SeeOther'),
      304: new LiteralExpression('global::System.Net.HttpStatusCode.NotModified'),
      305: new LiteralExpression('global::System.Net.HttpStatusCode.UseProxy'),
      306: new LiteralExpression('global::System.Net.HttpStatusCode.Unused'),
      307: new LiteralExpression('global::System.Net.HttpStatusCode.TemporaryRedirect'),
      400: new LiteralExpression('global::System.Net.HttpStatusCode.BadRequest'),
      401: new LiteralExpression('global::System.Net.HttpStatusCode.Unauthorized'),
      402: new LiteralExpression('global::System.Net.HttpStatusCode.PaymentRequired'),
      403: new LiteralExpression('global::System.Net.HttpStatusCode.Forbidden'),
      404: new LiteralExpression('global::System.Net.HttpStatusCode.NotFound'),
      405: new LiteralExpression('global::System.Net.HttpStatusCode.MethodNotAllowed'),
      406: new LiteralExpression('global::System.Net.HttpStatusCode.NotAcceptable'),
      407: new LiteralExpression('global::System.Net.HttpStatusCode.ProxyAuthenticationRequired'),
      408: new LiteralExpression('global::System.Net.HttpStatusCode.RequestTimeout'),
      409: new LiteralExpression('global::System.Net.HttpStatusCode.Conflict'),
      410: new LiteralExpression('global::System.Net.HttpStatusCode.Gone'),
      411: new LiteralExpression('global::System.Net.HttpStatusCode.LengthRequired'),
      412: new LiteralExpression('global::System.Net.HttpStatusCode.PreconditionFailed'),
      413: new LiteralExpression('global::System.Net.HttpStatusCode.RequestEntityTooLarge'),
      414: new LiteralExpression('global::System.Net.HttpStatusCode.RequestUriTooLong'),
      415: new LiteralExpression('global::System.Net.HttpStatusCode.UnsupportedMediaType'),
      416: new LiteralExpression('global::System.Net.HttpStatusCode.RequestedRangeNotSatisfiable'),
      417: new LiteralExpression('global::System.Net.HttpStatusCode.ExpectationFailed'),
      426: new LiteralExpression('global::System.Net.HttpStatusCode.UpgradeRequired'),
      500: new LiteralExpression('global::System.Net.HttpStatusCode.InternalServerError'),
      501: new LiteralExpression('global::System.Net.HttpStatusCode.NotImplemented'),
      502: new LiteralExpression('global::System.Net.HttpStatusCode.BadGateway'),
      503: new LiteralExpression('global::System.Net.HttpStatusCode.ServiceUnavailable'),
      504: new LiteralExpression('global::System.Net.HttpStatusCode.GatewayTimeout'),
      505: new LiteralExpression('global::System.Net.HttpStatusCode.HttpVersionNotSupported'),
      Continue: new LiteralExpression('global::System.Net.HttpStatusCode.Continue'),
      SwitchingProtocols: new LiteralExpression('global::System.Net.HttpStatusCode.SwitchingProtocols'),
      OK: new LiteralExpression('global::System.Net.HttpStatusCode.OK'),
      Created: new LiteralExpression('global::System.Net.HttpStatusCode.Created'),
      Accepted: new LiteralExpression('global::System.Net.HttpStatusCode.Accepted'),
      NonAuthoritativeInformation: new LiteralExpression('global::System.Net.HttpStatusCode.NonAuthoritativeInformation'),
      NoContent: new LiteralExpression('global::System.Net.HttpStatusCode.NoContent'),
      ResetContent: new LiteralExpression('global::System.Net.HttpStatusCode.ResetContent'),
      PartialContent: new LiteralExpression('global::System.Net.HttpStatusCode.PartialContent'),
      Ambiguous: new LiteralExpression('global::System.Net.HttpStatusCode.Ambiguous'),
      Moved: new LiteralExpression('global::System.Net.HttpStatusCode.Moved'),
      Redirect: new LiteralExpression('global::System.Net.HttpStatusCode.Redirect'),
      SeeOther: new LiteralExpression('global::System.Net.HttpStatusCode.SeeOther'),
      NotModified: new LiteralExpression('global::System.Net.HttpStatusCode.NotModified'),
      UseProxy: new LiteralExpression('global::System.Net.HttpStatusCode.UseProxy'),
      Unused: new LiteralExpression('global::System.Net.HttpStatusCode.Unused'),
      TemporaryRedirect: new LiteralExpression('global::System.Net.HttpStatusCode.TemporaryRedirect'),
      BadRequest: new LiteralExpression('global::System.Net.HttpStatusCode.BadRequest'),
      Unauthorized: new LiteralExpression('global::System.Net.HttpStatusCode.Unauthorized'),
      PaymentRequired: new LiteralExpression('global::System.Net.HttpStatusCode.PaymentRequired'),
      Forbidden: new LiteralExpression('global::System.Net.HttpStatusCode.Forbidden'),
      NotFound: new LiteralExpression('global::System.Net.HttpStatusCode.NotFound'),
      MethodNotAllowed: new LiteralExpression('global::System.Net.HttpStatusCode.MethodNotAllowed'),
      NotAcceptable: new LiteralExpression('global::System.Net.HttpStatusCode.NotAcceptable'),
      ProxyAuthenticationRequired: new LiteralExpression('global::System.Net.HttpStatusCode.ProxyAuthenticationRequired'),
      RequestTimeout: new LiteralExpression('global::System.Net.HttpStatusCode.RequestTimeout'),
      Conflict: new LiteralExpression('global::System.Net.HttpStatusCode.Conflict'),
      Gone: new LiteralExpression('global::System.Net.HttpStatusCode.Gone'),
      LengthRequired: new LiteralExpression('global::System.Net.HttpStatusCode.LengthRequired'),
      PreconditionFailed: new LiteralExpression('global::System.Net.HttpStatusCode.PreconditionFailed'),
      RequestEntityTooLarge: new LiteralExpression('global::System.Net.HttpStatusCode.RequestEntityTooLarge'),
      RequestUriTooLong: new LiteralExpression('global::System.Net.HttpStatusCode.RequestUriTooLong'),
      UnsupportedMediaType: new LiteralExpression('global::System.Net.HttpStatusCode.UnsupportedMediaType'),
      RequestedRangeNotSatisfiable: new LiteralExpression('global::System.Net.HttpStatusCode.RequestedRangeNotSatisfiable'),
      ExpectationFailed: new LiteralExpression('global::System.Net.HttpStatusCode.ExpectationFailed'),
      UpgradeRequired: new LiteralExpression('global::System.Net.HttpStatusCode.UpgradeRequired'),
      InternalServerError: new LiteralExpression('global::System.Net.HttpStatusCode.InternalServerError'),
      NotImplemented: new LiteralExpression('global::System.Net.HttpStatusCode.NotImplemented'),
      BadGateway: new LiteralExpression('global::System.Net.HttpStatusCode.BadGateway'),
      ServiceUnavailable: new LiteralExpression('global::System.Net.HttpStatusCode.ServiceUnavailable'),
      GatewayTimeout: new LiteralExpression('global::System.Net.HttpStatusCode.GatewayTimeout'),
      HttpVersionNotSupported: new LiteralExpression('global::System.Net.HttpStatusCode.HttpVersionNotSupported')
    }),
  }),
  Collections: intersect(collections, {
    Hashtable: new ClassType(collections, 'Hashtable'),
    IDictionary: new ClassType(collections, 'IDictionary'),
    IEnumerator: new ClassType(collections, 'IEnumerator'),

    Generic: intersect(generic, {
      Dictionary(keyType: TypeDeclaration, valueType: TypeDeclaration): ClassType {
        return new ClassType(generic, `Dictionary<${keyType.declaration},${valueType.declaration}>`);
      },
      IDictionary(keyType: TypeDeclaration, valueType: TypeDeclaration): IInterface {
        return {
          declaration: `${generic.fullName}.IDictionary<${keyType.declaration},${valueType.declaration}>`,
          allProperties: []
        };
      },
      KeyValuePair(keyType: TypeDeclaration, valueType: TypeDeclaration): ClassType {
        return new ClassType(generic, `KeyValuePair<${keyType.declaration},${valueType.declaration}>`);
      },
      IEnumerable(type: TypeDeclaration): ClassType {
        return new ClassType(generic, `IEnumerable<${type.declaration}>`);
      },
      HashSet(type: TypeDeclaration): ClassType {
        return new ClassType(generic, `HashSet<${type.declaration}>`);
      },
      IEnumerator(type: TypeDeclaration): ClassType {
        return new ClassType(generic, `IEnumerator<${type.declaration}>`);
      },
      ICollection(type: TypeDeclaration): ClassType {
        return new ClassType(generic, `ICollection<${type.declaration}>`);
      }
    })
  }),
  Action(...actionParameters: Array<TypeDeclaration>): ClassType {
    return length(actionParameters) === 0 ? action : new ClassType(system, `Action<${actionParameters.filter(each => each.declaration).joinWith(each => each.declaration)}>`);
  },

  Func(...funcParameters: Array<TypeDeclaration>): ClassType {
    return new ClassType(system, `Func<${funcParameters.joinWith(each => each.declaration)}>`);
  }
});

export const dotnet = {
  Unknown: new ClassType(None, 'null'),
  ToDo: new ClassType(None, 'null'),
  Void: new ClassType(None, 'void'),
  String: new ClassType(None, 'string'),
  StringArray: new ClassType(None, 'string[]'),
  Int: new ClassType(None, 'int'),
  Long: new ClassType(None, 'long'),
  Double: new ClassType(None, 'double'),
  Float: new ClassType(None, 'float'),
  Binary: new ClassType(None, 'byte[]'),
  Bool: new ClassType(None, 'bool'),
  Object: new ClassType(None, 'object'),
  Dynamic: new ClassType(None, 'dynamic'),
  ThisObject: new ClassType(None, 'this object'),
  Var: new ClassType(None, 'var'),
  True: new LiteralExpression('true'),
  False: new LiteralExpression('false'),
  Null: new LiteralExpression('null'),
  This: new LiteralExpression('this'),
  Array: (type: TypeDeclaration) => ({ declaration: `${type.declaration}[]` })
};

