import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    next(errorHandler(400, "All fields are required"));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });
  try {
    await newUser.save();
    res.json("User created successfully");
  } catch (error) {
    next(error);
  }
};

export const createStaffAccount = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "All fields are required"));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newStaff = new User({
    username,
    email,
    password: hashedPassword,
    isStaff: true,
  });

  try {
    await newStaff.save();
    res.json("Staff account created successfully");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const isPasswordValid = bcryptjs.compareSync(password, user.password);
    if (!isPasswordValid) {
      return next(errorHandler(400, "Invalid password"));
    }

    // Update lastLogin field
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin, isStaff: user.isStaff },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    const { password: userPassword, ...userWithoutPassword } = user._doc;
    return res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(userWithoutPassword);
  } catch (error) {
    return next(error);
  }
};

export const google = async (req, res, next) => {
  const { name, email, googlePhotoUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      // Update lastLogin field
      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin, isStaff: user.isStaff },
        process.env.JWT_SECRET,
        {
          expiresIn: "12h",
        }
      );

      const { password: userPassword, ...userWithoutPassword } = user._doc;

      return res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(userWithoutPassword);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const newUser = new User({
        username:
          name.toLowerCase().split(" ").join("") +
          Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
        lastLogin: new Date(),
      });
      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin, isStaff: newUser.isStaff },
        process.env.JWT_SECRET,
        {
          expiresIn: "12h",
        }
      );
      const { password: userPassword, ...userWithoutPassword } = newUser._doc;
      return res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .json(userWithoutPassword);
    }
  } catch (error) {
    console.log(error);
    return next(errorHandler(500, "Internal Server Error"));
  }
};
