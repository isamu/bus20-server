class Edge {
  constructor(data) {
    this.data = data;
  }
  from() {
    return this.data.from;
  }
  from_id() {
    return this.data.from_id;
  }
  to() {
    return this.data.to;
  }
  to_id() {
    return this.data.to_id;
  }
  conv_id_to_index(obj) {
    this.data.from = obj[this.data.from_id];
    this.data.to = obj[this.data.to_id];
  }
  setLength(distance) {
    this.data.length = distance;
  }
  getData() {
    return this.data;
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
