class Edge {
  constructor(data) {
    this.data = data;
  }
  from() {
    return this.data.from;
  }

  to() {
    return this.data.to;
  }

  setLength(distance) {
    this.data.length = distance;
  }

  to_data() {
    return {
      from: this.data.from,
      to: this.data.to,
      length:  this.data.length,
    };
  }
  
}

module.exports = Edge;
