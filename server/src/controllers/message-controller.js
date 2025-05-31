import Conversation from "../models/conversation-model.js";
import Message from "../models/message-model.js";

export const sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Message cannot be empty" });
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      messages: [],
    });
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  if (conversation) {
    conversation.messages.push(newMessage._id);
  }
  await conversation.save();

  res.status(200).json({
    success: true,
    message: "Message sent successfully",
    data: newMessage,
  });
};

export const getMessages = async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  })
    .populate("messages")
    .lean();

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }
  res.status(200).json({
    success: true,
    messages: conversation.messages,
  });
};
