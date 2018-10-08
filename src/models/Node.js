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

  to_data(){
    const data = {
      locations: {
        x: this.data.location.x,
        y: this.data.location.y,
      },
      edges: this.data.edges.map((edge) => edge.to_data()),
    };
    return data;
  }
  
}

module.exports = Node;
