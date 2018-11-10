const Graph = require("./Graph");
const Node = require("./Node");
const Edge = require("./Edge");

const osm_parser = require("./osm_parser");
const kml_parser = require("./kml_parser.js");

const models = {
  Graph,
  Node,
  Edge,
  osm_parser,
  kml_parser,
}

module.exports = models;
