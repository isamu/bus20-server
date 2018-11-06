'use strict';

const models = require('../../models/index.js');
const chai = require('chai');
const expect = chai.expect;

describe('Tests index', function () {
  before(function(){
  });
  
  it('verifies successful parse model', async () => {
    const file = __dirname + '/../../data/map.kochi.xml';
    // const file = __dirname + '/../../data/map.kumamoto.xml';
    const graph = await models.parser.test(file);
    
    // console.log(JSON.stringify(graph.to_data(), undefined, 1));
  }).timeout(1000000);
});
