const express = require("express");
const router = express.Router();
const { getMessages, sendMessage, deleteMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/:projectId", getMessages);
router.post("/:projectId", sendMessage);
router.delete("/:messageId", deleteMessage);

module.exports = router;