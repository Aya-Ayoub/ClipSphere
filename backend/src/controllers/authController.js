const authService = require("../services/authService");

exports.register = async (req, res) => {
  try {

    const user = await authService.register(req.body);

    // hide password from response
    user.password = undefined;

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (err) {

    res.status(400).json({
      error: err.message
    });

  }
};

exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // hide password if it exists
    if (result.user) result.user.password = undefined;

    res.status(200).json({
      message: "Login successful",
      ...result
    });

  } catch (err) {

    res.status(401).json({
      error: err.message
    });

  }
};