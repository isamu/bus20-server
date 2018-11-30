const Node = require("./Node");
const Edge = require("./Edge");


const unit = 1;

class Graph {
  constructor(data) {
    this.data = {
      nodes: [],
      nodeObj: {},
      ways: [],
    }
  }

  generateRandom(data = {}) {
    const w = data.w || 10;
    const h = data.h || 10;
    const count = w*h;
    const nodes = [...Array(count)].map((_, index) => {
      
      const y = (index / w) | 0
      const x = index - y * w
      let edges = [
        (x > 0) ? new Edge({from: index, to: index-1, length: unit}) : null,
        (x < w-1) ? new Edge({from: index, to: index+1, length: unit}) : null,
        (y > 0) ? new Edge({from: index, to: index-w, length: unit}) : null,
        (y < h-1) ? new Edge({from: index, to: index+w, length: unit}) : null,
      ]

      return new Node({
        location: {
          x: unit * ((x + 1 + Math.random() * 0.75) - 0.375),
          y: unit * ((y + 1 + Math.random() * 0.75) - 0.375)
        },
        edges: edges.filter((a) => a),
        type: "grid"
      });
    });
    Graph.updateLength(nodes);
    this.data = {
      nodes: nodes,
    }
  }

  to_data() {
    const data = {
      "nodes": this.data.nodes.map((node) => {
        return node.to_data();
      })
    }
    return data;
  }

  to_json() {
    return JSON.stringify(this.to_data(), undefined, 1)
  }

  getData() {
    return this.data;
  }
  getNode(index) {
    return this.data.nodes[index];
  }
  updateLength() {
    Graph.updateLength(this.data.nodes, this.data.type)
  }

  static updateLength(nodes, type) {
    return nodes.map((node) => {
      node.updateLength(nodes);
    });
  }

  checkAllpath(isId=false) {
    const init_node = this.data.nodeObj[Object.keys(this.data.nodeObj)[0]]
    const stack = [];
    stack.push(init_node)
    while(stack.length > 0) {
      const current =  stack.pop()
      current.setMark();
      current.edges().map((edge) => {
        // bug to() and to_id() are ambiguous
        const node = (isId) ? this.data.nodeObj[edge.to_id()] : this.data.nodeObj[edge.to()];
        if (!node.getMark()) {
          stack.push(node);
        }
      });
    }
    let ret = true
    this.data.nodes.forEach((node) => {
      if (!node.getMark()) {
        ret = false;
      }
    });
    return ret;
  }

  
  // for osm 
  appendOsmNode(_node, type = "geo") {
    const node = new Node({
      location: {
        x: _node.lat,
        y: _node.lon
      },
      id: _node.id,
      edges: [],
      type,
    });
    this.data.nodeObj[_node.id] = node;

    return node;
  }
  appendWay(_way) {
    this.data.ways.push(_way);
  }
  compact() {
    this.removeStraightRoad();
    this.deleteUnusedNode();
    this.checkAllpath(true);
    this.deleteUnConnected();
    this.resetNodeEdge();
  }
  removeStraightRoad() {
    this.data.ways.forEach((way) => {
      
      let status = 0; //0 start,
      let start_node = null;
      if (way.nodeRefs.length > 2) {
        for(let i = 0; i < way.nodeRefs.length -1; i ++){
          const node0_id = way.nodeRefs[i];
          const node1_id = way.nodeRefs[i + 1];
          const node0 = this.getNodeById(node0_id)
          const node1 = this.getNodeById(node1_id);

          if (status === 0) {
            if (node0 && node1 && node1.edges().length === 2) {
              // todo remove node1 edge
              node0.removeEdge(node1_id);
              start_node = node0;
              status = 1;
            }
          } else if (status == 1) {
            this.deleteNodeById(node0_id);
            if (node1.edges().length !== 2 || i === way.nodeRefs.length - 2) {
              // end of this
              node1.removeEdge(node0_id);
              
              const from_node_id = start_node.getData()["id"];
              const to_node_id = node1.getData()["id"];
              
              if (from_node_id === to_node_id && start_node.edges().length === 0 && node1.edges().length === 0) {
                // close loop for example leisure is park
                this.deleteNodeById(from_node_id);
                this.deleteNodeById(to_node_id);
              } else {
                const edge0 = new Edge({from_id: from_node_id, to_id: to_node_id, length: unit});
                const edge1 = new Edge({from_id: to_node_id, to_id: from_node_id, length: unit});
                start_node.appendEdge(edge0);
                node1.appendEdge(edge1);
              }
              status = 0;
            }
          }
        }
      }
    });
  }
  deleteUnusedNode() {
    Object.keys(this.data.nodeObj).forEach((key) => {
      if (this.data.nodeObj[key].edges().length === 0) {
        delete this.data.nodeObj[key];
      }
    });
  }
  deleteUnConnected() {
    Object.keys(this.data.nodeObj).map((key) => {
      if (!this.data.nodeObj[key].getMark()) {
        delete this.data.nodeObj[key];
      }
    });
  }
  resetNodeEdge() {
    this.data.nodes = [];
    let i = 0;
    const node_ids = {}
    Object.keys(this.data.nodeObj).forEach((key) => {
      const node = this.data.nodeObj[key];
      this.data.nodes[i] = node;
      node_ids[node.getData().id] = i;
      i ++;
    });
    this.data.nodes.map((node) => {
      node.edges().map((edge) => {
        edge.conv_id_to_index(node_ids)
      });
    });
  }
  getNodeById(id) {
    return this.data.nodeObj[id];
  }
  deleteNodeById(id) {
    delete this.data.nodeObj[id];
  }
  // end osm

  // for kml
  setNodes(nodes) {
    this.data.nodes = nodes;
    this.data.nodeObj = {};
    nodes.forEach((node) => {
      this.data.nodeObj[node.getIndex()] = node;
    })
  }
  // end osm
}

module.exports = Graph;
