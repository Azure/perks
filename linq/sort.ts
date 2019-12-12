const first = -1;
const second = 1;
const neither = 0;

function ascendingInvalidLast<T>(input: Array<T>, accessor: (each: T) => number | undefined): Array<T> {
  return input.sort((a, b) => {
    const pA = accessor(a) ?? Number.MAX_VALUE;
    const pB = accessor(b) ?? Number.MAX_VALUE;
    return pA === pB ? neither : pA < pB ? first : second;
  });
}

function descendingInvalidLast<T>(input: Array<T>, accessor: (each: T) => number | undefined): Array<T> {
  return input.sort((a, b) => {
    const pA = accessor(a) ?? -Number.MAX_VALUE;
    const pB = accessor(b) ?? -Number.MAX_VALUE;
    return pA === pB ? neither : pA > pB ? first : second;
  });
}
function ascendingInvalidFirst<T>(input: Array<T>, accessor: (each: T) => number | undefined): Array<T> {
  return input.sort((a, b) => {
    const pA = accessor(a) ?? -Number.MAX_VALUE;
    const pB = accessor(b) ?? -Number.MAX_VALUE;
    return pA === pB ? neither : pA < pB ? first : second;
  });
}

function descendingInvalidFirst<T>(input: Array<T>, accessor: (each: T) => number | undefined): Array<T> {
  return input.sort((a, b) => {
    const pA = accessor(a) ?? Number.MAX_VALUE;
    const pB = accessor(b) ?? Number.MAX_VALUE;
    return pA === pB ? neither : pA > pB ? first : second;
  });
}

function sascendingInvalidLast<T>(input: Array<T>, accessor: (each: T) => string | undefined): Array<T> {
  return input.sort((a, b) => {
    const pA = accessor(a);
    const pB = accessor(b);

    return pA === pB ? 0 : pA !== undefined ? pB !== undefined
      ? pA < pB ? first : second      /* both exist */
      : first         /* a exists, b undefined */
      : pB !== undefined
        ? second        /* b exists, a undefined */
        : neither;      /* neither exists */
  });
}

function sdescendingInvalidLast<T>(input: Array<T>, accessor: (each: T) => string | undefined): Array<T> {
  return input.sort((a, b) => {
    const pA = accessor(a);
    const pB = accessor(b);
    return pA === pB ? 0 : pA !== undefined ? pB !== undefined
      ? pA > pB ? first : second      /* both exist */
      : first         /* a exists, b undefined */
      : pB !== undefined
        ? second        /* b exists, a undefined */
        : neither;      /* neither exists */
  });
}
function sascendingInvalidFirst<T>(input: Array<T>, accessor: (each: T) => string | undefined): Array<T> {
  return input.sort((a, b) => {
    const pA = accessor(a);
    const pB = accessor(b);
    return pA === pB ? 0 : pA !== undefined ? pB !== undefined
      ? pA < pB ? first : second      /* both exist */
      : second         /* a exists, b undefined */
      : pB !== undefined
        ? first        /* b exists, a undefined */
        : neither;      /* neither exists */
  });
}

function sdescendingInvalidFirst<T>(input: Array<T>, accessor: (each: T) => string | undefined): Array<T> {
  return input.sort((a, b) => {
    const pA = accessor(a);
    const pB = accessor(b);
    return pA === pB ? 0 : pA !== undefined ? pB !== undefined
      ? pA > pB ? first : second      /* both exist */
      : second         /* a exists, b undefined */
      : pB !== undefined
        ? first        /* b exists, a undefined */
        : neither;      /* neither exists */
  });
}

/** Sort methods that use an accessor function and uses the accessed value in the compare 
 * 
 * Note: array.sort puts actual undefined values at the end always, regardless of compare code.
*/
export const sort = {
  numericly: {
    ascendingInvalidLast,
    descendingInvalidLast,
    ascendingInvalidFirst,
    descendingInvalidFirst
  },
  textually: {
    ascendingInvalidLast: sascendingInvalidLast,
    descendingInvalidLast: sdescendingInvalidLast,
    ascendingInvalidFirst: sascendingInvalidFirst,
    descendingInvalidFirst: sdescendingInvalidFirst
  }
}