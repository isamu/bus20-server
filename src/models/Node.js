class Node {
  constructor(data) {
    this.data = data;
  }
  edges() {
    return this.data.edges;
  }
  getData() {
    return this.data;
  }
  
  distance(to) {
    const dx = to.getData().location.x - this.data.location.x
    const dy = to.getData().location.y - this.data.location.y
    return Math.sqrt(dx * dx + dy * dy)
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
  
}

module.exports = Node;
