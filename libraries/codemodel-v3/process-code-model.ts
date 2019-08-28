/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Model } from './code-model/code-model';
import { serialize } from '@azure/codegen';
import { Host } from '@azure/autorest-extension-base';
import { ModelState } from './model-state';

export async function processCodeModel(processExtension: (state: ModelState<Model>) => Promise<Model>, service: Host, callerName?: string) {
  // Get the list of files
  const state = await new ModelState<Model>(service).init();

  // output the model back to the pipeline
  await service.WriteFile(`code-model-v3${callerName ? `-${callerName}` : ''}.yaml`, serialize(await processExtension(state)), undefined, 'code-model-v3');
}
