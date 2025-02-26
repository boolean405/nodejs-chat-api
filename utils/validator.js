const { Token } = require("./core");
const { Redis } = require("./redis");

const validateToken = () => {
  return async (req, res, next) => {
    // let authHeader = await req.headers.authorization;
    // if (!authHeader) {
    //   next(new Error("Need Authorization"));
    //   return;
    // }
    // let token = authHeader.split(" ")[1];
    // let decoded = Token.verifyToken(token);
    // if (
    //   decoded === "invalid token" ||
    //   decoded === "invalid signature" ||
    //   decoded === "jwt malformed"
    // ) {
    //   next(new Error("Invalid authorization token"));
    //   return;
    // }
    // if (decoded === "jwt expired") {
    //   next(new Error("Authorization token expired"));
    //   return;
    // }
    // req.userId = decoded.id;
    // req.user = await Redis.get(decoded.id);
    // next();

    try {
      let authHeader = await req.headers.authorization;
      if (!authHeader) {
        throw new Error("Need Authorization");
      }
      let token = authHeader.split(" ")[1];
      let decoded = Token.verifyToken(token);
      req.userId = decoded.id;
      req.user = await Redis.get(decoded.id);
      next();
    } catch (err) {
      const error = new Error(err.message);
      error.status = 401;
      return next(error);
    }
  };
};

const validateParam = (schema, param) => {
  return (req, res, next) => {
    let obj = {};
    obj[`${param}`] = req.params[`${param}`];
    let result = schema.validate(obj);
    if (result.error) {
      const error = new Error(result.error.message);
      error.status = 400;
      return next(error);
    }
    next();
  };
};

const validateBody = (schema) => {
  return (req, res, next) => {
    let result = schema.validate(req.body);
    if (result.error) {
      const error = new Error(result.error.message);
      error.status = 400;
      return next(error);
    }
    next();
  };
};

module.exports = {
  validateToken,
  validateParam,
  validateBody,
};
