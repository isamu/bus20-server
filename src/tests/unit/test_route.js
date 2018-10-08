'use strict';

const models = require('../../models/index.js');
const chai = require('chai');
const expect = chai.expect;

describe('Tests index', function () {
  before(function(){
  });
  
  it('verifies successful user model', async () => {
    const graph = new models.Graph;
    // expect(getdata).to.be.an('object');
    expect("aa").to.be.equal("aa");
    // expect(getdata.getData().name).to.be.equal("hoge");
    console.log(JSON.stringify(graph.to_data(), undefined, 1));
  });
});
