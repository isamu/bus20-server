const lambdaRouter = require ("lambda-router20");

const testController = require ("controllers/test")

lambdaRouter.setRoutes([
  {method: "GET", path: "test", func: testController.test},
  {method: "GET", path: "kumamoto", func: testController.test2},
  {method: "GET", path: "kochi", func: testController.test3},
]);

lambdaRouter.setResponseHandlers({
  400: testController.errorHandler(400),
  401: testController.errorHandler(401),
  404: testController.errorHandler(404),
})

lambdaRouter.setErrorCallback((event, error) => {
  console.log(error);
}); 

const router = lambdaRouter.router
  
module.exports = {
  router,
}

