const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // move to next middleware or route
};

module.exports = logger;
