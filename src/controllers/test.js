const models = require('../models/index.js');

const test = (event, context, callback) => {
  const w = Number(event.params.w) || 10
  const h = Number(event.params.h) || 10

  const graph = new models.Graph();
  graph.generateRandom({w, h})
  const response = {
    'statusCode': 200,
    
    'body': graph.to_json(),
  };
  return callback(null, response)
};


const test2 = async (event, context, callback) => {
  const file = __dirname + '/../data/map.kumamoto.xml';

  const graph = await models.parser.test(file);

  const response = {
    'statusCode': 200,
    'body': graph.to_json(),
    'headers': {
      "Content-Type": "application/json"
    },
  };
  return callback(null, response)
};

const test3 = async (event, context, callback) => {
  const file = __dirname + '/../data/map.kochi.xml';
  
  const graph = await models.parser.test(file);

  const response = {
    'statusCode': 200,
    'body': graph.to_json(),
    'headers': {
      "Content-Type": "application/json"
    },
  };
  return callback(null, response)
};

const errorHandler = (code) => {
  return (event) => {
    return {
      'statusCode': code,
      'body': JSON.stringify({
        message: `${code} error`,
      }),
    }
  };
};

module.exports = {
  test,
  test2,
  test3,
  errorHandler,
}
