const tj = require('togeojson');
const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;
const geolib = require("geolib");

const Graph = require("./Graph");
const Node = require("./Node");
const Edge = require("./Edge");


const nodeObj = {}

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
        const edge0 = new Edge({from: node0_id, to: node1_id, length: length});
        node0.appendEdge(edge0);
      }
      if (node0.edges().length > 2) {
        node0.setJunction();
      }
      if (!node1.hasEdge(node0_id)) {
        const edge1 = new Edge({from: node1_id, to: node0_id, length: length});
        node1.appendEdge(edge1);
      }
      if (node1.edges().length > 2) {
        node1.setJunction();
      }
    }
  });

}
const getNodeKey = (point) => {
  const key = Node.getUniqKey(point.location.x, point.location.y);
  if (!nodeObj[key]) {
    const obj = new Node(point);
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
    // if (min_length > 50) {
    // console.log(min_length);
    // }
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

const parse_from_file = (file) => {
  const kml = new DOMParser().parseFromString(fs.readFileSync(file, 'utf8'));
  const elements = kml.getElementsByTagName("Folder");

  let points = [];
  const lines = [];
  let index = 0;

  for(let i = 0; i  < elements.length; i++) {
    const converted = tj.kml(elements[i]);

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
        
        // reset data
        index = index + 1;
      }
    });
    search_point_on_line(lines[index - 1], points)
    points = [];
  }

  const nodes = []
  lines_to_graph(lines, nodes)

  const graph = new Graph();
  graph.setNodes(nodes);
  if(!graph.checkAllpath()) {
    console.log("not all path");
  }

  return graph;
}


module.exports = {
  parse_from_file,
};
