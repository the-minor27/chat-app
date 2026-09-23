const express = require("express");
const conversationController = require("../controllers/conversationController");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post("/", authorize, conversationController.createConversation);
router.get("/", authorize, conversationController.getConversations);

module.exports = router;