module.exports.validateRequiredProps = (requiredProps) => {
  return function (req, res, next) {
    const missingProps = requiredProps.filter(
      (prop) => !req.body.hasOwnProperty(prop)
    );

    if (missingProps.length > 0) {
      return res.status(400).json({
        code: 400,
        message: "Missing required properties",
        data: missingProps,
      });
    }

    next();
  };
};
