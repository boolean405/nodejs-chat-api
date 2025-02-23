const { Token } = require("./core");
const { Redis } = require("./redis");

const validateToken = () => {
  return async (req, res, next) => {
    let authHeader = await req.headers.authorization;
    if (!authHeader) {
      next(new Error("Need Authorization"));
      return;
    }
    let token = authHeader.split(" ")[1];
    let decoded = Token.verifyToken(token);
    if (
      decoded === "invalid token" ||
      decoded === "invalid signature" ||
      decoded === "jwt malformed"
    ) {
      next(new Error("Invalid authorization token"));
      return;
    }
    if (decoded === "jwt expired") {
      next(new Error("Authorization token expired"));
      return;
    }
    req.userId = decoded.id;
    req.user = await Redis.get(decoded.id);
    next();
  };
};

const validateParam = (schema, param) => {
  return (req, res, next) => {
    let obj = {};
    obj[`${param}`] = req.params[`${param}`];
    let result = schema.validate(obj);
    if (result.error) {
      next(new Error(result.error.details[0].message));
      return;
    }
    next();
  };
};

const validateBody = (schema) => {
  return (req, res, next) => {
    let result = schema.validate(req.body);
    if (result.error) {
      // result.error.details.forEach(err => next(new Error(err.message)));
      next(new Error(result.error.details[0].message));
      return;
    }
    next();
  };
};

module.exports = {
  validateToken,
  validateParam,
  validateBody,
};
