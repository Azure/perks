import * as assert from 'assert';
import { only, skip, slow, suite, test, timeout } from 'mocha-typescript';
import { shadow, enableSourceTracking, getMappings } from '../source-track';

require('source-map-support').install();
@suite class SourceTrackTests {

  @test async 'one'() {
    const sourceModel = {
      abc: {
        cde: {
          name: 'garrett',
          age: 21,
        }
      },
      array: [
        'A', 'B', 'C', 'D'
      ],
      set: new Set(['able', 'bravo', 'charlie']),
      map: new Map<string, any>([['A', 'B'], ['C', 'D'], ['E', { sample: 100 }]]),
      elephant: true,
    };

    const shadowedModel = shadow(sourceModel, 'myFile.ts');


    // console.log(text2);
    //    assert(text1, text2);

    // let's create a target to fill in.

    // console.log(shadowedModel.abc.cde.name['_#source#_']);

    const target: any = enableSourceTracking({}, true);
    target.name = shadowedModel.abc.cde.name;

    console.log(`TargetName: ${target.name} at ${target.name['_#source#_']}`);
    console.log(JSON.stringify(target));
    console.log(getMappings(target));


  }
}
