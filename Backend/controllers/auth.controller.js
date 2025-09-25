import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signout = (req, res,next) => {
  try {
    res.clearCookie("access_token"); //clear the cookie on the client side
    res.status(200).json("User signed out successfully.");
  } catch (error) {
    next(error);

  }
};



export const signup = async (req, res, next) => {
  //we use async because we are using await inside the function

  const { username, email, password } = req.body;
  const HashedPassword = bcrypt.hashSync(password, 10); //hashsync is ansychronous so no need to use await
  const newUser = new User({ username, email, password: HashedPassword });
  try {
    await newUser.save(); //we use await because save() is an asynchronous operation that returns a promise (it might take some time to complete)
    res.status(201).json("User created successfully");
  } catch (error) {
    next(error); //we use next to pass the error to the next middleware function (which is the error handling middleware in index.js or in error.js)
  }
};

export const signin = async (req, res, next) => {
  //we use async because we are using await inside the function
  const { email, password } = req.body;
  try {
    //findone is use for mongodb to find one document that matches the condition
    const validUser = await User.findOne({ email }); //we use await because findOne() is an asynchronous operation that returns a promise (it might take some time to complete)
    if (!validUser) return next(errorHandler(404, "User not found"));
    const validPassword = bcrypt.compareSync(password, validUser.password); //compareSync is synchronous so we can use await
    if (!validPassword) return next(errorHandler(401, "Wrong credentials!"));
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET_KEY); //{ expiresIn: '1d' });//expires in 1 day
    const { password: pass, ...others } = validUser._doc; //we do this to exclude the password from the user object that we send to the client side (frontend)
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200) //httpOnly means the cookie cannot be accessed by the client side (javascript)
      .json(others); //we can send the user data to the client side (frontend) after successful login
  } catch (error) {
    next(error);
  }
};

export const googleSignin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      //if user already exists
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY); //{ expiresIn: '1d' });//expires in 1 day
      const { password, ...others } = user._doc; //we do this to exclude the password from the user object that we send to the client side (frontend)
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200) //httpOnly means the cookie cannot be accessed by the client side (javascript)
        .json(others); //we can send the user data to the client side (frontend) after successful login
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8); //generate a random password for the user
      const hashedPassword = bcrypt.hashSync(generatedPassword, 10); //hashsync is ansychronous so no need to use await
      const newUser = new User({
        username:
          req.body.username.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-3), //remove spaces and convert to lowercase
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY); //{ expiresIn: '1d' });//expires in 1 day
      const { password, ...others } = newUser._doc; //we do this to exclude the password from the user object that we send to the client side (frontend)
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200) //httpOnly means the cookie cannot be accessed by the client side (javascript)
        .json(others); //we can send the user data to the client side (frontend) after successful login
    }
  } catch (error) {
    next(error);
  }
};
