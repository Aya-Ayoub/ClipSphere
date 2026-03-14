const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const videoRoutes = require("./routes/videoRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");

const globalErrorHandler = require("./middleware/globalErrorHandler");

/* CREATE APP FIRST */

const app = express();

/* Middleware */

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use((req, res, next) => {
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.params);
  next();
});

/* Swagger */

const options = {
  definition:{
    openapi:"3.0.0",
    info:{
      title:"ClipSphere API",
      version:"1.0.0"
    },

    servers:[
      {
        url:"http://localhost:5000"
      }
    ],

    components:{
      securitySchemes:{
        bearerAuth:{
          type:"http",
          scheme:"bearer",
          bearerFormat:"JWT"
        }
      }
    }

  },
  apis:["./src/routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* Database */

mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err));

/* Routes */

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/videos", reviewRoutes);
app.use("/api/v1/admin", adminRoutes);

/* Health */

app.get("/health",(req,res)=>{
  res.json({status:"API running"});
});

/* Global Error Handler */

app.use(globalErrorHandler);

module.exports = app;