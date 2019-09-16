/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { EOL } from '@azure-tools/codegen';
import { length } from '@azure-tools/linq';


export function xmlize(element: string, text: string): string {
  if (text) {
    if (length(text) < 80 && text.indexOf(EOL) === -1) {
      return `<${element}>${text.trim()}</${element}>`;
    }
    return `
<${element}>
${text}
</${element}>`.trim();
  }
  return text;
}

export const summary = (text: string): string => xmlize('summary', text);
