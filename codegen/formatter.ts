import { fixLeadingNumber, isEqual, removeSequentialDuplicates } from './text-manipulation';
import { Dictionary, values } from '@azure-tools/linq';


export type Styler = ((identifier: string | Array<string>, removeDuplicates: boolean | undefined, overrides: Dictionary<string> | undefined) => string);

function deconstruct(identifier: string | Array<string>): Array<string> {
  if (Array.isArray(identifier)) {
    return [...values(identifier).selectMany(deconstruct)];
  }
  return `${identifier}`.
    replace(/([a-z]+)([A-Z])/g, '$1 $2').
    replace(/(\d+)([a-z|A-Z]+)/g, '$1 $2').
    replace(/\b([A-Z]+)([A-Z])([a-z])/g, '$1 $2$3').
    split(/[\W|_]+/).map(each => each.toLowerCase());
}

function wrap(prefix: string, postfix: string, style: Styler): Styler {
  if (postfix || prefix) {
    return (i, r, o) => typeof i === 'string' && typeof (o) === 'object' ? o[i.toLowerCase()] || `${prefix}${style(i, r, o)}${postfix}` : `${prefix}${style(i, r, o)}${postfix}`;
  }
  return style;
}


function applyFormat(normalizedContent: Array<string>, overrides: Dictionary<string> = {}, separator = '', formatter: (s: string, i: number) => string = (s, i) => s) {
  return normalizedContent.map((each, index) => overrides[each.toLowerCase()] || formatter(each, index)).join(separator);
}

function normalize(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): Array<string> {
  if (!identifier || identifier.length === 0) {
    return [''];
  }
  return typeof identifier === 'string' ? normalize(fixLeadingNumber(deconstruct(identifier))) : removeDuplicates ? removeSequentialDuplicates(identifier) : identifier;
}
export class Style {
  static select(style: any, fallback: Styler): Styler {
    if (style) {
      const styles = /^([a-zA-Z0-9_]*?\+?)([a-zA-Z]+)(\+?[a-zA-Z0-9_]*)$/g.exec(style.replace(/\s*/g, ''));
      if (styles) {
        const prefix = styles[1] ? styles[1].substring(0, styles[1].length - 1) : '';
        const postfix = styles[3] ? styles[3].substring(1) : '';

        switch (styles[2]) {
          case 'camelcase':
          case 'camel':

            return wrap(prefix, postfix, Style.camel);
          case 'pascalcase':
          case 'pascal':
            return wrap(prefix, postfix, Style.pascal);
          case 'snakecase':
          case 'snake':
            return wrap(prefix, postfix, Style.snake);
          case 'uppercase':
          case 'upper':
            return wrap(prefix, postfix, Style.upper);
          case 'kebabcase':
          case 'kebab':
            return wrap(prefix, postfix, Style.kebab);
          case 'spacecase':
          case 'space':
            return wrap(prefix, postfix, Style.space);
        }
      }
    }
    return fallback;
  }

  static kebab(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '-');
  }

  static space(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '');
  }

  static snake(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '_');
  }

  static upper(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '_', each => each.toUpperCase());
  }
  static pascal(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '', each => each.capitalize());
  }

  static camel(identifier: string | Array<string>, removeDuplicates = true, overrides: Dictionary<string> = {}): string {
    return overrides[<string>identifier] || applyFormat(normalize(identifier, removeDuplicates), overrides, '', (each, index) => index ? each.capitalize() : each.uncapitalize());
  }
}
