const Joi = require("joi");

const UserSchema = {
  register: Joi.object({
    name: Joi.string().min(4).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(8).max(12).required(),
    password: Joi.string().min(8).max(16).required(),
    // re_password: Joi.ref("password"),
  }),
  login: Joi.object({
    phone: Joi.string().min(8).max(12),
    email: Joi.string().min(8),
    password: Joi.string().min(8).max(16).required(),
  }),
};
const AllSchema = {
  id: Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
};

module.exports = {
  UserSchema,
  AllSchema,
};
