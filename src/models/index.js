const Graph = require("./Graph");
const Node = require("./Node");
const Edge = require("./Edge");

const parser = require("./parser");
const kml_parser = require("./kml_parser.js");

const models = {
  Graph,
  Node,
  Edge,
  parser,
  kml_parser,
}

module.exports = models;
