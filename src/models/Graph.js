const Node = require("./Node");
const Edge = require("./Edge");

class Graph {
  constructor(data) {
    this.data = {
      nodes: [],
    }
  }

  generateRandom(data = {}) {
    const w = data.w || 10;
    const h = data.h || 10;
    const unit = 1;
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
        edges: edges.filter((a) => a)
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

  appendNode(_node) {
    const node = new Node({
      location: {
        x: _node.lat,
        y: _node.lon
      },
      id: _node.id,
      edges: []
    });

    this.data.nodes.push(node)
  }

  compact() {
    this.data.nodes = this.data.nodes.filter((node) => {
      return !!(node.edges && node.getData().edges.length > 0)
    });
  }
  getNode(index) {
    return this.data.nodes[index];
  }
  
  updateLength() {
    Graph.updateLength(this.data.nodes)
  }

  static updateLength(nodes) {
    return nodes.map((node) => {
      return node.edges().map((edge) => {
        const node0 = nodes[edge.from()];
        const node1 = nodes[edge.to()];
        const length = node0.distance(node1);
        edge.setLength(length);
      });
    });
  }

}

module.exports = Graph;
