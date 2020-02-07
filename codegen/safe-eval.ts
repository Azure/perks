/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as vm from 'vm';

/* eslint-disable */

const sandbox = vm.createContext({});

export function safeEval<T>(code: string, context?: any, opts?: any): T {
  var resultKey = 'SAFE_EVAL_' + Math.floor(Math.random() * 1000000);
  sandbox[resultKey] = {};
  code = resultKey + '=' + code;

  if (context) {
    const keys = Object.keys(context);
    keys.forEach(function (key) {
      sandbox[key] = context[key];
    })
    vm.runInContext(code, sandbox, opts)
    keys.forEach(function (key) {
      delete sandbox[key];
    })
  } else {
    vm.runInContext(code, sandbox, opts);
  }
  return sandbox[resultKey];
}