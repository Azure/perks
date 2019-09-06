interface AnyObject {
  [key: string]: any;
  [key: number]: any;
}

export interface Leaf {
  index: string | number;
  parent: AnyObject;
  instance: any;
}

function* _visitor(instance: AnyObject, visited: WeakSet<object>): Iterable<Leaf> {
  if (instance === null || instance === undefined || visited.has(instance)) {
    return;
  }
  visited.add(instance);

  if (instance instanceof Set || Array.isArray(instance)) {
    let ndx = 0;
    for (const each of instance) {
      if (typeof each === 'object') {
        yield* _visitor(each, visited);
      }
      // yield the member after visiting children
      yield {
        index: ndx++,
        parent: instance,
        instance: each
      };
    }
    return;
  }

  if (instance instanceof Map) {
    // walk thru map members.
    for (const [key, value] of instance.entries()) {
      if (typeof value === 'object') {
        yield* _visitor(value, visited);
      }
      // yield the member after visiting children
      yield {
        index: key,
        parent: instance,
        instance: value
      };
    }
    return;
  }

  // objects 
  for (const key of Object.keys(instance)) {
    const value = instance[key];
    if (typeof value === 'object') {
      yield* _visitor(value, visited);
    }
    // yield the member after visiting children
    yield {
      index: key,
      parent: instance,
      instance: value
    };
  }
}

export function visitor(instance: AnyObject): Iterable<Leaf> {
  return _visitor(instance, new WeakSet<object>());
}
