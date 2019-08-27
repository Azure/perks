import { VirtualProperties } from "./code-model/schema";
import { VirtualParameters, VirtualParameter } from "./code-model/command-operation";
import { selectName } from "@azure/codegen";

export function resolvePropertyNames(reservedNames: Iterable<string>, virtualProperties: VirtualProperties) {
  const usedNames = new Set(reservedNames);

  const allProps = [...virtualProperties.owned, ...virtualProperties.inherited, ...virtualProperties.inlined];

  for (const prop of allProps) {
    if (usedNames.has(prop.name)) {
      prop.name = selectName(prop.nameOptions, usedNames);
    } else {
      usedNames.add(prop.name);
    }
  }

}

export function resolveParameterNames(reservedNames: Iterable<string>, virtualParameters: VirtualParameters) {
  const usedNames = new Set(reservedNames);
  const collisions = new Set<VirtualParameter>();

  // we need to make sure we avoid name collisions. operation parameters get first crack.
  for (const each of virtualParameters.operation) {
    if (usedNames.has(each.name)) {
      collisions.add(each);
    } else {
      usedNames.add(each.name);
    }
  }

  // handle operation parameters
  for (const each of collisions) {
    each.name = selectName(each.nameOptions, usedNames);
  }
  collisions.clear();

  // now do body parameters.
  for (const each of virtualParameters.body) {
    if (usedNames.has(each.name)) {
      collisions.add(each);
    } else {
      usedNames.add(each.name);
    }
  }

  for (const each of collisions) {
    each.name = selectName(each.nameOptions, usedNames);
  }
}

export function allVirtualProperties(virtualProperties?: VirtualProperties) {
  return virtualProperties ? [...virtualProperties.owned, ...virtualProperties.inherited, ...virtualProperties.inlined] : []
}

export function allVirtualParameters(virtualParameters?: VirtualParameters) {
  return virtualParameters ? [...virtualParameters.operation, ...virtualParameters.body] : [];
}