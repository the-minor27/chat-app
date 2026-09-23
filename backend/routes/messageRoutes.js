
const express = require("express");
const messageController = require("../controllers/messageController");
const authorize = require('../middleware/authorize')

const router = express.Router();

router.post("/", authorize, messageController.sendMessage);
router.get("/:conversationId", authorize, messageController.getMessages);
router.patch("/:conversationId/read", authorize, messageController.markMessagesAsRead);

module.exports = router;
