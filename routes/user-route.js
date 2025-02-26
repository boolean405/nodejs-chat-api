const router = require("express").Router();

const UserController = require("../controllers/user-controller");
const { AllSchema, UserSchema } = require("../utils/schema");
const {
  validateToken,
  validateParam,
  validateBody,
} = require("../utils/validator");

router
  .route("/")
  .post(validateBody(UserSchema.register), UserController.register)
  .get(validateToken(), UserController.searchUser);

router.post("/login", [validateBody(UserSchema.login), UserController.login]);
router.get("/paginate/:page", UserController.paginateUser);
router.get("/profile", [validateToken(), UserController.profile]);

router.delete("/:id", [
  validateToken(),
  validateParam(AllSchema.param, "id"),
  UserController.removeUser,
]);

const userRoute = router;

module.exports = {
  userRoute,
};
