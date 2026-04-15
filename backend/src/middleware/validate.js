module.exports = (schema) => {
  return (req, res, next) => {

    console.log("🔥 VALIDATE MIDDLEWARE HIT");
    console.log("BODY BEFORE VALIDATION:", req.body);

    try {
      req.body = schema.parse(req.body);

      console.log("✅ VALIDATION SUCCESS");
      console.log("BODY AFTER VALIDATION:", req.body);

      next();
    } catch (err) {

      console.log("❌ VALIDATION FAILED");
      console.log("ERROR:", err.errors);

      return res.status(400).json({
        error: "Validation failed",
        details: err.errors,
      });
    }
  };
};