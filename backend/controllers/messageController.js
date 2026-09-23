
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;

        const conversation = await Conversation.findById(
            conversationId
        );

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found",
            });
        }

        const isMember = conversation.members.some(
            (memberId) => memberId.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this conversation",
            });
        }

        const message = await Message.create({
            conversationId,
            senderId: req.user.id,
            content,
        });

        const populatedMessage = await message.populate(
            "senderId",
            "name email"
        );

        res.status(201).json({
            message: populatedMessage,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(
            conversationId
        );

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found",
            });
        }

        const isMember = conversation.members.some(
            (memberId) => memberId.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this conversation",
            });
        }

        const messages = await Message.find({
            conversationId,
        })
            .populate("senderId", "name email")
            .sort({ createdAt: 1 });

        res.json({
            messages,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found",
            });
        }

        const isMember = conversation.members.some(
            (memberId) => memberId.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a member of this conversation",
            });
        }

        await Message.updateMany(
            {
                conversationId,
                senderId: { $ne: req.user.id },
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                },
            }
        );

        res.json({
            message: "Messages marked as read",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    markMessagesAsRead,
};
