const models = require('../models/index.js');

const test = (event, context, callback) => {
  const w = Number(event.params.w) || 10
  const h = Number(event.params.h) || 10

  const graph = new models.Graph({w, h});

  const response = {
    'statusCode': 200,
    'body': graph.to_json(),
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
  errorHandler,
}
