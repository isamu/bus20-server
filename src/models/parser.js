const Graph = require("./Graph");
const Node = require("./Node");
const Edge = require("./Edge");

const osmread = require("osm-read");

const wayIsRoad = (way) => {
  if (way.tags.leisure === "park") {
    return false;
  }
  if (way.tags.highway) {
    // console.log(way.tags.highway);
    return true;
  }
  if (way.tags.building) {
    return false;
  }
  if (way.tags.parking) {
    return false;
  }
  if (way.tags.amenity) {
    return false;
  }
  if (way.tags.barrier) {
    return false;
  }
  if (way.tags.bench) {
    return false;
  }
  if (way.tags.forest) {
    return false;
  }
  if (way.tags.landuse) {
    return false;
  }
  if (way.tags.railway) {
    return false;
  }
  if (way.tags.waterway) {
    return false;
  }
  if (way.tags.natural) {
    return false;
  }
  if (way.tags.leisure) {
    return false;
  }
  if (way.tags.man_made) {
    return false;
  }
  if (way.tags['demolished:building']) {
    return false;
  }
  if (way.tags.admin_level) {
    return false;
  }
  if (Object.keys(way.tags).length === 0) {
    // empty??
    return true;
  }
  // console.log(way.tags )
  return false;
};

const parse_osm_xml =  (file) => {
  return new Promise((resolve, reject) => {
    const graph = new Graph();
    const unit = 1;

    var parser = osmread.parse({
      filePath: file,
      endDocument: function(){
        //console.log(graph.getData().nodes.length);
        graph.compact();
        graph.updateLength();
        console.log(graph.getData().nodes.length);
        resolve(graph);
      },
      bounds: function(bounds){
        //console.log('bounds: ' + JSON.stringify(bounds));
      },
      node: function(node){
        const node_instance = graph.appendNode(node);
      },
      way: function(way){
        if (wayIsRoad(way) && way.nodeRefs && way.nodeRefs.length > 1) {
          graph.appendWay(way);
          for(let i = 0; i < way.nodeRefs.length -1; i ++){
            const node0_id = way.nodeRefs[i];
            const node1_id = way.nodeRefs[i + 1];
            
            const edge0 = new Edge({from_id: node0_id, to_id: node1_id, length: unit});
            const edge1 = new Edge({from_id: node1_id, to_id: node0_id, length: unit});

            const node0 = graph.getNodeById(node0_id)
            node0.appendEdge(edge0);
            
            const node1 = graph.getNodeById(node1_id);
            node1.appendEdge(edge1);
          }
        } else {
          // console.log("NG");
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
  parse_osm_xml
};
