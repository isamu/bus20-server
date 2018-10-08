const Graph = require("./Graph");
const Node = require("./Node");
const Edge = require("./Edge");

const osmread = require("osm-read");

const test =  (file) => {
  return new Promise((resolve, reject) => {
    const graph = new Graph();
    let node_index = 0;
    const unit = 1;
    const node_ids = {};

    var parser = osmread.parse({
      filePath: file,
      endDocument: function(){
        graph.updateLength();
        // graph.compact();
        resolve(graph);
      },
      bounds: function(bounds){
        //console.log('bounds: ' + JSON.stringify(bounds));
      },
      node: function(node){
        graph.appendNode(node);
        node_ids[node.id] = node_index;
        node_index ++;
      },
      way: function(way){
        if (way.nodeRefs && way.nodeRefs.length > 1) {
          for(let i = 0; i < way.nodeRefs.length -1; i ++){
            const node0_id = way.nodeRefs[i];
            const node1_id = way.nodeRefs[i + 1];
            const node0_index = node_ids[node0_id];
            const node1_index = node_ids[node1_id];
            
            const edge0 = new Edge({from: node0_index, to: node1_index, length: unit});
            const edge1 = new Edge({from: node1_index, to: node0_index, length: unit});

            const node0 = graph.getNode(node0_index);
            node0.appendEdge(edge0);

            const node1 = graph.getNode(node1_index);
            node1.appendEdge(edge1);
          }
        } else {
          console.log("NG");
        }
      },
      relation: function(relation){
        //console.log('relation: ' + JSON.stringify(relation));
      },
      error: function(msg){
        reject('error: ' + msg);
      }
    });
  });
};

module.exports = {
  test
};
