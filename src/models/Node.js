const geolib = require("geolib");
const crypto = require('crypto')

function md5hex(str /*: string */) {
  const md5 = crypto.createHash('md5')
  return md5.update(str, 'binary').digest('hex')
}

class Node {
  constructor(data) {
    this.data = data;
    this.uniq_key = Node.getUniqKey(this.data.location.x, this.data.location.y);
    this.mark = false;
  }
  static getUniqKey(x, y) {
    return md5hex(String(x) + ":" + String(y));
  }
  edges() {
    return this.data.edges;
  }
  countEdges() {
    return this.data.edges.length;
  }
  getData() {
    return this.data;
  }
  getUniqKey() {
    return this.uniq_key;
  }
  setIndex(index) {
    this.data.index = index
  }
  getIndex() {
    return this.data.index;
  }
  distance(to) {
    if (this.data.type === "geo"){
      const ret = geolib.getDistance(
        {latitude: to.getData().location.x, longitude: to.getData().location.y},
        {latitude: this.data.location.x, longitude: this.data.location.y},
      );
      // Return value is always float and represents the distance in meters.
      return ret;
    } else {
      const dx = to.getData().location.x - this.data.location.x;
      const dy = to.getData().location.y - this.data.location.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
  }
  appendEdge(_edge) {
    this.data.edges.push(_edge);
  }
  removeEdgeById(id) {
    this.data.edges = this.data.edges.filter((edge) => {
      return (edge.to_id() !== id);
    });
  }
  removeEdgeByIndex(index) {
    this.data.edges = this.data.edges.filter((edge) => {
      return (edge.to() !== index);
    });
  }
  hasEdgeById(id) {
    return !!this.data.edges.find((edge) => {
      return edge.to_id() === id;
    });
  }
  hasEdgeByIndex(index) {
    return !!this.data.edges.find((edge) => {
      return edge.to() === index;
    });
  }
  setJunction() {
    this.data.junction = true;
  }
  to_data(){
    const data = {
      location: {
        x: this.data.location.x,
        y: this.data.location.y,
      },
      edges: this.data.edges.map((edge) => edge.to_data()),
      name: this.data.name,
      junction: this.data.junction || false,
      id: this.data.index,
    };
    return data;
  }
  updateLength(nodes) {
    this.data.edges.map((edge) => {
      edge.setLength(this.distance(nodes[edge.to()]));
    });
  }
  setMark() {
    this.mark = true;
  }
  getMark() {
    return this.mark;
  }
  getName() {
    return this.data.name;
  }
}

module.exports = Node;
