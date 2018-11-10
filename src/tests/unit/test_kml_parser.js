'use strict';

const models = require('../../models/index.js');

const chai = require('chai');
const expect = chai.expect;

const fs = require('fs');

describe('Tests index', function () {
  before(function(){
  });

  it('verifies successful parse model', async () => {
    const file = __dirname + '/../../data/sukoyaka.kml';

    const graph = models.kml_parser.parse_from_file(file);
    fs.writeFileSync("bus_stop.json" , graph.to_json())

  }).timeout(1000000);
});
