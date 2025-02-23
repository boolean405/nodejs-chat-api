const router = require("express").Router();

const userController = require("../controllers/user-controller");
const { AllSchema, UserSchema } = require("../utils/schema");
const {
  validateToken,
  validateParam,
  validateBody,
} = require("../utils/validator");

router.post("/register", [
  validateBody(UserSchema.register),
  userController.register,
]);

router.post("/login", [validateBody(UserSchema.login), userController.login]);
router.get("/paginate/:page", userController.paginateUser);
router.get("/profile", [validateToken(), userController.profile]);

router.delete("/:id", [
  validateToken(),
  validateParam(AllSchema.id, "id"),
  userController.removeUser,
]);



const userRoute = router;

module.exports = {
  userRoute,
};
