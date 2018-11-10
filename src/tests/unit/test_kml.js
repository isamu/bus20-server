'use strict';

const models = require('../../models/index.js');

const chai = require('chai');
const expect = chai.expect;

const tj = require('togeojson');
const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;

const geolib = require("geolib");

const nodeObj = {}

describe('Tests index', function () {
  before(function(){
  });

  const findGeos = (geos, index) => {
    const geo = geos[index];

    geo.forEach((point) => {
      Object.keys(geos).forEach((key) => {
        if (key !== index) {
          geos[key].forEach((_point) => {
            if (point[0] === _point[0] && point[1] === _point[1]) {
              console.log(index, key)
            }
          });
        }
      });
    });
      
  }
  const conv_to_point = (res, coordinates) => {
    coordinates.forEach((coord) => {
      const pos_data = {
        location: {
          x: coord[0],
          y: coord[1],
        },
        name: "",
        edges: [],
        type: "geo",
      }
      let node = nodeObj[getNodeKey(pos_data)]
      res.push(node);
    });
  }

  const lines_to_graph = (lines, nodes) => {
    
    lines.forEach((line) => {
      for(let i = 0; i < line.length - 2; i ++) {
        const node0 = line[i];
        const node1 = line[i + 1];
        if (!node0.getIndex()) {
          node0.setIndex(nodes.length)
          nodes.push(node0);
        }
        if (!node1.getIndex()) {
          node1.setIndex(nodes.length)
          nodes.push(node1);
        }
        const node0_id = node0.getIndex();
        const node1_id = node1.getIndex();
        
        const length = node0.distance(node1);
        if (!node0.hasEdge(node1_id)) {
          const edge0 = new models.Edge({from_id: node0_id, to_id: node1_id, length: length});
          node0.appendEdge(edge0);
        }
        if (node0.edges().length > 2) {
          node0.setJunction();
        }
        if (!node1.hasEdge(node0_id)) {
          const edge1 = new models.Edge({from_id: node1_id, to_id: node0_id, length: length});
          node1.appendEdge(edge1);
        }
        if (node1.edges().length > 2) {
          node1.setJunction();
        }
      }
    });

  }
  const getNodeKey = (point) => {
    const key = models.Node.getUniqKey(point.location.x, point.location.y);
    if (!nodeObj[key]) {
      const obj = new models.Node(point);
      nodeObj[key] = obj;
    }
    return key;
  }
  const search_point_on_line = (line_points, points) => {
    points.forEach((point) => {
      const new_line_point = [];

      let min_index = 0;
      let min_length = 999999999999;
      Object.keys(line_points).forEach((key) => {
        const line_point = line_points[key];
        const dist = point.distance(line_point);
        if (min_length > dist) {
          min_index = Number(key);
          min_length = dist;
        }
      });
      if (min_index == 0) {
        // https://qiita.com/ArcCosine@github/items/12699ecb7ac40b0956c9
        // top
        Array.prototype.splice.apply(line_points, [1, 0].concat([point]));
      } else if (min_index == line_points.length - 1) {
        // bottom
        Array.prototype.splice.apply(line_points, [line_points.length - 2, 0].concat([point]));
      } else {
        // compare
        if (point.distance(line_points[min_index - 1]) > point.distance(line_points[min_index + 1])) {
          Array.prototype.splice.apply(line_points, [min_index - 1, 0].concat([point]));
        } else {
          Array.prototype.splice.apply(line_points, [min_index, 0].concat([point]));
        }
      }
      Array.prototype.splice.apply([1,2,3], [2, 0].concat([5,5,5]))
    });
  }
  
  it('verifies successful parse model', async () => {
    const file = __dirname + '/../../data/sukoyaka.kml';

    var kml = new DOMParser().parseFromString(fs.readFileSync(file, 'utf8'));
    
    var converted = tj.kml(kml);

    let points = [];
    const lines = [];
    let index = 0;

    converted.features.forEach((feat) => {
      if ("Point" === feat.geometry.type) {
        const pos = feat.geometry.coordinates;
        const pos_data = {
          location: {
            x: pos[0],
            y: pos[1],
          },
          name: feat.properties.name,
          edges: [],
          type: "geo",
        };
        const node = nodeObj[getNodeKey(pos_data)];
        points.push(node);
      }

      if ("LineString" === feat.geometry.type) {
        lines[index] = []
        conv_to_point(lines[index], feat.geometry.coordinates);
        search_point_on_line(lines[index], points)

        // reset data
        index = index + 1;
        points = [];
      }
    });

    const nodes = []
    lines_to_graph(lines, nodes)

    const graph = new models.Graph();
    graph.setNodes(nodes);
    if(!graph.checkAllpath()) {
      console.log("not all path");
    }
    
    console.log(graph.to_json());
    //Object.keys(geos).forEach((key) => {
      // findGeos(geos, key);
    //});
    //console.log(JSON.stringify());
    
    //var convertedWithStyles = tj.kml(kml, { styles: true });
    
    // console.log(JSON.stringify(graph.to_data(), undefined, 1));
  }).timeout(1000000);
});
