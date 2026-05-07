module.exports = (err, req, res, next) => {
  //error in development
  if (process.env.NODE_ENV !== "production") {
    console.error("ERROR:", err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  //mongoose CastError
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  //mongoose ValidationError
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(". ");
  }

  //mongoDB Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} is already taken`;
  }

  //JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your token has expired. Please log in again.";
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message,

    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
};