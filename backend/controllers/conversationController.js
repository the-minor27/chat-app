const Message = require("../models/Message");

const Conversation = require("../models/Conversation");
const User = require("../models/User");

const createConversation = async (req, res) => {
    try {
        const { email } = req.body;

        const otherUser = await User.findOne({ email });

        if (!otherUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const existingConversation = await Conversation.findOne({
            members: {
                $all: [req.user.id, otherUser._id],
            },
        });

        if (existingConversation) {
            return res.json({
                message: "Conversation already exists",
                conversation: existingConversation,
            });
        }

        const conversation = await Conversation.create({
            members: [req.user.id, otherUser._id],
        });

        res.status(201).json({
            message: "Conversation created",
            conversation,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: req.user.id,
        }).populate("members", "name email isOnline");

        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conversation) => {
                const unreadCount = await Message.countDocuments({
                    conversationId: conversation._id,
                    senderId: { $ne: req.user.id },
                    isRead: false,
                });

                return {
                    ...conversation.toObject(),
                    unreadCount,
                };
            })
        );

        res.json({
            conversations: conversationsWithUnread,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    createConversation,
    getConversations,
};
