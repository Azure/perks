import * as semver from 'semver';

/*
 Handling:

 yyyy-mm-dd                   n(yyyy).n(mm).n(dd)
 yyyy-mm-dd-preview           n(yyyy).n(mm).n(dd)-preview
 yyyy-mm-dd.x1.x2             (miliseconds since 1970-01-01).x1.x2
 x1.x2.x3.x4                  x1.x2.x3
 x.x                          x.x.0
 vx.x                         x.x.0
 vx.x-preview                 x.x.0-preview
*/
export function toSemver(apiversion: string) {
  let result = '';

  // strip off leading "v" or "=" character
  apiversion = apiversion.replace(/^v|^=/gi, '');

  const versionedDateRegex = new RegExp(/(^\d{4}\-\d{2}\-\d{2})(\.\d+\.\d+$)/gi);
  if (apiversion.match(versionedDateRegex)) {
    // convert yyyy-mm-dd.x1.x2      --->     (miliseconds since 1970-01-01).x1.x2
    const date = apiversion.replace(versionedDateRegex, '$1');
    const miliseconds = new Date(date).getTime();
    const lastNumbers = apiversion.replace(versionedDateRegex, '$2');
    result = `${miliseconds}${lastNumbers}`;
  } else {

    // convert partial version to complete version
    const partialVersionRegex = new RegExp(/^\d+\.\d+$|^\d+\.\d+\-[a-z]+$/gi);
    if (apiversion.match(partialVersionRegex)) {
      const parts = apiversion.split('-');
      if (parts.length > 1) {
        apiversion = `${parts[0]}.0-${parts[1]}`;
      } else {
        apiversion = `${parts[0]}.0`;
      }

    }

    // drop numbers after third number
    const longVersionRegex = new RegExp(/^(\d+\.\d+\.\d+)(\.\d+)$/gi);
    if (apiversion.match(longVersionRegex)) {
      apiversion = apiversion.replace(longVersionRegex, '$1');
    }

    // convert:
    // yyyy-mm-dd                 n(yyyy).n(mm).n(dd)
    // yyyy-mm-dd-tag             n(yyyy).n(mm).n(dd)-tag
    // x.x.x                      x.x.x
    // x.x.x.x                    x.x.x
    for (const i of apiversion.split(/[\.\-]/g)) {
      if (!result) {
        result = i;
        continue;
      }
      const n = Number.parseInt(i);
      result = Number.isNaN(n) ? `${result}-${i}` : `${result}.${Number(n)}`;
    }

  }

  return result === '' ? '0.0.0' : result;
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