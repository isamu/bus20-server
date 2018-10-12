const geolib = require("geolib");

class Node {
  constructor(data) {
    this.data = data;
    this.mark = false;
  }
  edges() {
    return this.data.edges;
  }
  getData() {
    return this.data;
  }
  distance(to) {
    console.log(this.data.type);
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
  removeEdge(id) {
    this.data.edges = this.data.edges.filter((edge) => {
      return (edge.to_id() !== id);
    });
  }
  to_data(){
    const data = {
      location: {
        x: this.data.location.x,
        y: this.data.location.y,
      },
      edges: this.data.edges.map((edge) => edge.to_data()),
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
  
}

module.exports = Node;
