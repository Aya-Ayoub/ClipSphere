const authService = require("../services/authService");

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    // Never return password in response
    user.password = undefined;

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Never return password in response
    if (result.user) result.user.password = undefined;

    res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};