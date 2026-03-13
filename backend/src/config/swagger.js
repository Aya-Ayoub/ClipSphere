const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
definition:{
openapi:"3.0.0",
info:{
title:"ClipSphere API",
version:"1.0.0"
}
},
apis:["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = (app)=>{

app.use(
"/api-docs",
swaggerUi.serve,
swaggerUi.setup(swaggerSpec)
);

};