import * as semver from 'semver';

export function toSemver(apiversion: string) {
  let result = '';
  for (const i of apiversion.split('-')) {
    if (!result) {
      result = i;
      continue;
    }
    const n = Number.parseInt(i);
    result = Number.isNaN(n) ? `${result}-${i}` : `${result}.${n}`;
  }
  return result;
}

export function lt(apiVersion1: string, apiVersion2: string) {
  const v1 = toSemver(apiVersion1);
  const v2 = toSemver(apiVersion2);
  return semver.lt(v1, v2);
}

export function gt(apiVersion1: string, apiVersion2: string) {
  const v1 = toSemver(apiVersion1);
  const v2 = toSemver(apiVersion2);
  return semver.gt(v1, v2);
}
export function lowest(apiVersion1: string, apiVersion2: string) {
  return lt(apiVersion1, apiVersion2) ? apiVersion1 : apiVersion2;
}
export function highest(apiVersion1: string, apiVersion2: string) {
  return gt(apiVersion1, apiVersion2) ? apiVersion1 : apiVersion2;
}
export function minimum(apiversions: Array<string>) {
  if (apiversions.length === 0) {
    return '';
  }
  let result = apiversions[0];
  for (const each of apiversions) {
    result = lowest(result, each);
  }
  return result;
}
export function maximum(apiversions: Array<string>) {
  if (apiversions.length === 0) {
    return '';
  }
  let result = apiversions[0];
  for (const each of apiversions) {
    result = highest(result, each);
  }
  return result;
}