const { resolve } = require('path');
const jsyaml = require('js-yaml');
const fs = require('fs').promises;

const g = require('glob');
const TJS = require("typescript-json-schema");
const tsm = require('ts-morph');

const project = new tsm.Project({ tsConfigFilePath: `{__dirname}/../tsconfig.json` });
const x = project.getSourceFiles().map(each => each.getInterfaces());

function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

const interfaces = flatten(x);

const propertyPriority = [
  '$key',
  'name',
  'schemas',
  'name',
  'type',
  'format',
  'schema',
  'operationId',
  'path',
  'method',
  'description',
  'default',
];
const propertyNegativePriority = [
  'callbacks',
  'http',
  'commands',
  'operations',
  'extensions',
  'details',
  'language',
  'protocol'
];
function sortWithPriorty(a, b) {
  if (a == b) {
    return 0;
  }
  const ia = propertyPriority.indexOf(a);
  const ib = propertyPriority.indexOf(b);
  const na = propertyNegativePriority.indexOf(a);
  const nb = propertyNegativePriority.indexOf(b);
  const dota = `${a}`.startsWith('.');
  const dotb = `${b}`.startsWith('.');
  if (dota) {
    if (!dotb) {
      return 1;
    }
  }
  else {
    if (dotb) {
      return -1;
    }
  }
  if (na > -1) {
    if (nb > -1) {
      return na - nb;
    }
    return 1;
  }
  if (nb > -1) {
    return -1;
  }
  if (ia != -1) {
    return ib != -1 ? ia - ib : -1;
  }
  return ib != -1 || a > b ? 1 : a < b ? -1 : 0;
}
function deserialize(text, filename) {
  return js_yaml_1.safeLoad(text, {
    filename,
  });
}

function serialize(model) {
  return jsyaml.dump(model, {
    sortKeys: sortWithPriorty,
    schema: jsyaml.DEFAULT_SAFE_SCHEMA,
    skipInvalid: true,
    lineWidth: 240
  }).
    replace(/\s*\w*: {}/g, '').
    replace(/\s*\w*: \[\]/g, '').
    replace(/(\s*- \$key:)/g, '\n$1')
  // replace(/(\s*)(language:)/g, '\n$1## ----------------------------------------------------------------------$1$2');
  //.replace(/(\s*language:)/g, '\n$1');
}


function fix(txt) {
  return txt
    .replace(/<Schema<AllSchemaTypes>>/g, '')
    .replace(/<Schema<PrimitiveSchemaTypes>>/g, '')
    .replace(/Schema\.TSchemaType_1/g, 'NumericSchemaTypes')
    .replace(/Schema\.TSchemaType_2/g, 'ObjectSchemaTypes')
    .replace(/Schema\.TSchemaType_3/g, 'PrimitiveSchemaTypes')
    .replace(/Schema\.TSchemaType/g, 'AllSchemaTypes')
    .replace(/T_1/g, 'Language')
    .replace(/T_2/g, 'Protocol')
    .replace(/Protocols<Protocol>/g, 'Protocols')
}

function fixmodel(schema) {
  txt = JSON.stringify(schema);
  txt = txt
    .replace(/<Schema<AllSchemaTypes>>/g, '')
    .replace(/Schema<AllSchemaTypes>/g, 'Schema')
    .replace(/<Schema<PrimitiveSchemaTypes>>/g, '')
    .replace(/<\w*Schema>/g, '')
    .replace(/Schema\.TSchemaType_1/g, 'NumericSchemaTypes')
    .replace(/Schema\.TSchemaType_2/g, 'ObjectSchemaTypes')
    .replace(/Schema\.TSchemaType_3/g, 'PrimitiveSchemaTypes')
    .replace(/Schema\.TSchemaType/g, 'AllSchemaTypes')
    .replace(/T_1/g, 'Language')
    .replace(/T_2/g, 'Protocol')
    .replace(/T_3/g, 'Extensions')
    .replace(/Protocols<Protocol>/g, 'Protocols')
    .replace(/Languages<Language>/g, 'Languages')
    .replace(/definitions\/T/g, 'definitions/ApiVersion')
    .replace(/ElementType_1/g, 'Schema')
    .replace(/ElementType/g, 'Schema')
    .replace(/SerializationFormats<SerializationFormat>/g, 'SerializationFormats')

  model = JSON.parse(txt, undefined, 2);
  return model
}

async function main() {
  const settings = {
    required: true,
    defaultProps: true,
    strictNullChecks: true,
    excludePrivate: true,
  };

  const program = TJS.getProgramFromFiles(g.sync(`${__dirname}/../model/**/*.ts`), {}, __dirname);

  // We can either get the schema for one file and one type...
  let schema = TJS.generateSchema(program, "*", settings);

  delete schema.definitions['ValueSchemas'];
  delete schema.definitions['AllSchemas'];
  delete schema.definitions['ArraySchema<Schema>'];
  delete schema.definitions['ConstantSchema<Schema>'];
  delete schema.definitions['DictionarySchema<Schema>'];
  delete schema.definitions['ChoiceSchema<Schema>'];
  delete schema.definitions['Aspect'];
  delete schema.definitions['Schema.TSchemaType'];
  delete schema.definitions['Schema.TSchemaType_2'];
  delete schema.definitions['Languages<Language>'];
  delete schema.definitions['T'];
  delete schema.definitions['ElementType'];
  delete schema.definitions['ElementType_1'];
  delete schema.definitions['ChoiceType_1'];
  delete schema.definitions['SerializationFormats<SerializationFormat>'];

  schema.definitions['Dictionary<string>'].additionalProperties = { type: 'string' }
  schema.definitions['Dictionary<any>'].additionalProperties = true;

  for (let each in schema.definitions['CodeModel']) {
    schema[each] = schema.definitions['CodeModel'][each]
  }
  schema.title = 'CodeModel';
  delete schema.definitions['CodeModel'];

  for (let each in schema.definitions) {
    if (schema.definitions[each].type === 'number') {
      delete schema.definitions[each];
    }
  }

  for (const each of interfaces) {
    const heritage = each.getHeritageClauses();
    if (heritage.length > 0) {
      for (const h of heritage) {
        const parents = h.getText().replace(/.*extends/g, '').split(',').map(i => i.trim()).filter(each => each != 'Extensions' && each != 'Dictionary<any>' && each != 'Dictionary<string>' && each != 'Aspect');
        if (parents.length > 0) {
          const parent = parents[0];
          const child = each.getName();
          if (schema.definitions[child] && schema.definitions[parent]) {
            schema.definitions[child].allOf = [{ $ref: `#/definitions/${parent}` }]
            for (const pp in schema.definitions[parent].properties) {
              schema.definitions[child].properties[pp].deleteMe = true;
            }
          }
        }
      }
    }
  }
  for (const each in schema.definitions) {
    for (const p in schema.definitions[each].properties) {
      if (schema.definitions[each].properties[p].deleteMe) {
        delete schema.definitions[each].properties[p];
      }
    }
  }






  // write out the full all in one model
  await writemodels('code-model', 'all-in-one', schema);

  schema = JSON.parse(JSON.stringify(schema).replace(/#\/definitions(.*?)"/g, './master.json#/definitions$1"'));

  // split them up:
  const all = {
    master: schema,

    enums: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {}
    },

    schemas: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {}
    },

    types: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {}
    },

    http: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: {}
    }
  }

  //move schemas
  for (let each in all.master.definitions) {
    if (each.endsWith('Schema') || each.startsWith('Schema<') || each.indexOf('Schema<') > -1) {
      moveTo(all, each, 'schemas')
    }
  }
  moveTo(all, 'Schemas', 'schemas');
  moveTo(all, 'ChoiceType', 'schemas');
  moveTo(all, 'ChoiceValue', 'schemas');
  moveTo(all, 'ChoiceSchema', 'schemas');
  moveTo(all, 'SealedChoiceSchema', 'schemas');
  moveTo(all, 'ConstantType', 'schemas');
  moveTo(all, 'ConstantValue', 'schemas');


  for (let each in all.master.definitions) {
    if (each.endsWith('Schemas')) {
      moveTo(all, each, 'types')
    }
  }

  // move types
  for (let each in all.master.definitions) {
    if (each.endsWith('Types')) {
      moveTo(all, each, 'types')
    }
  }

  //move enums
  for (let each in all.master.definitions) {
    if (all.master.definitions[each].enum) {
      moveTo(all, each, 'enums')
    }
  }

  for (let each in all.master.definitions) {
    if (['APIKeySecurityScheme',
      'BearerHTTPSecurityScheme',
      'AuthorizationCodeOAuthFlow',
      'HTTPSecurityScheme',
      'ImplicitOAuthFlow',
      'NonBearerHTTPSecurityScheme',
      'OAuth2SecurityScheme',
      'OAuthFlows',
      'OpenIdConnectSecurityScheme',
      'PasswordOAuthFlow',
      'SecurityRequirement',
      'SecurityScheme',
      'ServerVariable',
      'Server',
      'StreamResponse',
      'ClientCredentialsFlow',


    ].indexOf(each) > -1 || each.startsWith('Http')) {
      moveTo(all, each, 'http')
    }
  }

  for (const each in all) {
    await writemodels(each, 'model', all[each]);
  }
}

function moveTo(all, name, target, ) {
  all[target].definitions[name] = all.master.definitions[name];
  delete all.master.definitions[name];

  for (const each in all) {
    all[each] = JSON.parse(JSON.stringify(all[each]).replace(new RegExp(`./master.json(#\/definitions\/${name})`, 'g'), `./${target}.json$1`));
  }
}

async function writemodels(name, folder, schema) {
  schema = fixmodel(schema);

  const yaml = serialize(schema);
  const json = JSON.stringify(schema, undefined, 2);

  await fs.writeFile(`${__dirname}/../.resources/${folder}/yaml/${name}.yaml`, yaml.replace(/\.json/g, '.yaml'));
  await fs.writeFile(`${__dirname}/../.resources/${folder}/json/${name}.json`, json);
}

main();