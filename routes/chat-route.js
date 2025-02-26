const router = require("express").Router();

const ChatController = require("../controllers/chat-controller");
const { ChatSchema } = require("../utils/schema");
// const { AllSchema, UserSchema } = require("../utils/schema");
const {
  validateToken,
  validateParam,
  validateBody,
} = require("../utils/validator");

router
  .route("/")
  .post(
    validateToken(),
    validateBody(ChatSchema.createOrAccessChat),
    ChatController.createOrAccessChat
  )
  .get(validateToken(), ChatController.fetchChat);

router
  .route("/group/create")
  .post(
    validateToken(),
    validateBody(ChatSchema.createGroup),
    ChatController.createGroup
  );
router
  .route("/group/rename")
  .patch(
    validateToken(),
    validateBody(ChatSchema.renameGroup),
    ChatController.renameGroup
  );
router
  .route("/group/add")
  .patch(
    validateToken(),
    validateBody(ChatSchema.addUserToGroup),
    ChatController.addUserToGroup
  );
router
  .route("/group/remove")
  .patch(
    validateToken(),
    validateBody(ChatSchema.removeUserFromGroup),
    ChatController.removeUserFromGroup
  );
// router.route("/removeFromGroup").put(validateToken(), removeFromGroup);

const chatRoute = router;

module.exports = {
  chatRoute,
};
