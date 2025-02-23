const router = require("express").Router();

const controller = require("../controllers/user");
const { AllSchema, UserSchema } = require("../utils/schema");
const {
  validateToken,
  validateParam,
  validateBody,
} = require("../utils/validator");

router.post("/register", [
  validateBody(UserSchema.register),
  controller.register,
]);

router.post("/login", [validateBody(UserSchema.login), controller.login]);
router.get("/paginate/:page", controller.all);
router.get("/profile", [validateToken(), controller.profile]);

router.delete("/:id", [
  validateToken(),
  validateParam(AllSchema.id, "id"),
  controller.removeUser,
]);

module.exports = router;
