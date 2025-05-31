import User from "../models/user-model.js";
import jwt from "jsonwebtoken";

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res) => {
  const { fullname, username, password, gender } = req.body;

  const exists = await User.findOne({ username });
  if (exists)
    return res.status(400).json({ message: "Username already exists" });

  const avatar =
    gender === "male"
      ? "https://avatar.iran.liara.run/public/boy"
      : gender === "female"
      ? "https://avatar.iran.liara.run/public/girl"
      : "";

  const newUser = await User.create({
    fullname,
    username,
    password,
    gender,
    avatar,
  });

  const token = createToken(newUser._id);

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json({
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        gender: newUser.gender,
        avatar: newUser.avatar,
      },
      token,
    });
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user)
    return res.status(400).json({ message: "Invalid username or password" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.status(400).json({ message: "Invalid username or password" });

  const token = createToken(user._id);

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        gender: user.gender,
        avatar: user.avatar,
      },
      token,
    });
};

export const getOtherUsers = async (req, res) => {
  const currentUserId = req.user._id;

  const users = await User.find({ _id: { $ne: currentUserId } }).select(
    "_id fullname username avatar gender"
  );

  res.status(200).json(users);
};

export const logout = (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .status(200)
    .json({ message: "Logged out successfully" });
};
