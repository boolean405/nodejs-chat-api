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
  param: Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
};

const ChatSchema = {
  createOrAccessChat: Joi.object({
    receiverId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
  createGroup: Joi.object({
    users: Joi.string().required(),
    groupName: Joi.string().min(4).required(),
  }),
  renameGroup: Joi.object({
    chatId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    groupName: Joi.string().min(4).required(),
  }),
  addUserToGroup: Joi.object({
    userId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    chatId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
  removeUserFromGroup: Joi.object({
    userId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    chatId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
  }),
};

module.exports = {
  UserSchema,
  AllSchema,
  ChatSchema,
};
