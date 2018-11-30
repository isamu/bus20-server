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
      const node0_index = node0.getIndex();
      const node1_index = node1.getIndex();
      
      const length = node0.distance(node1);
      if (node0_index !== node1_index) {
        if (!node0.hasEdgeByIndex(node1_index)) {
          const edge0 = new Edge({from: node0_index, to: node1_index, length: length});
          node0.appendEdge(edge0);
        }
        if (node0.edges().length > 2) {
          node0.setJunction();
        }
        if (!node1.hasEdgeByIndex(node0_index)) {
          const edge1 = new Edge({from: node1_index, to: node0_index, length: length});
          node1.appendEdge(edge1);
        }
        if (node1.edges().length > 2) {
          node1.setJunction();
        }
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

const check_cross = (line1, line2) => {
  const line2_keys = line2.map((node) => {
    return node.getUniqKey();
  });
  for(let i = 0; i < line1.length; i ++ ) {
    const node1 = line1[i];
    for(let j = 0; j < line2.length; j ++ ) {
      const node2 = line2[j];
      const len = node1.distance(node2);
      if (len < 10 &&(node1.getUniqKey() != node2.getUniqKey()) && !line2_keys.includes(node1.getUniqKey())) {
        // it's ok if nodeobj have node that no related others
        // replace node
        
        if (node1.getUniqKey() != node2.getUniqKey()) {
          line2[j] = node1;
        }
        // no edge data here 
        // const prev_node2 = line2[j-1];
        // const next_node2 = line2[j+1];

        
        // j == 0 case there is no prev node.
        // if (j > 0) { 
          // can remove ??

          // prev_node2.removeEdge(node2);
          // node2.removeEdge(prev_node2);

        // }
        // if (j < line2.length - 2) {
          //if (next_node2.countEdges() <=  (( j + 1 == line2.length  ) ? 1 : 2)) {
            // next_node2.removeEdge(node2);
            // node2.removeEdge(next_node2);
          // }
          // next_node2.addEdge(node1);
        // }
        // node1.addEdge(prev_node2);
        // node1.addEdge(next_node2);

      }
    }
  }
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
    // search_point_on_line(lines[index - 1], points)
    points = [];
  }

  for(let i = 0; i < lines.length -1 ; i ++ ) {
    for(let j = i + 1; j < lines.length ; j ++ ) {
      check_cross(lines[i], lines[j]);
    }
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
