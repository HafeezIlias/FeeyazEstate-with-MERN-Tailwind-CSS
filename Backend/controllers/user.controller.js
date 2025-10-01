import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import Listing from "../models/listing.model.js";

export const test = (req, res) => {
  //   res.send("Hello World!");
  res.json({ message: "Hello World!" });
}

export const updateUser = async (req, res,next) => {
  if(req.user.id !== req.params.id){
    return next(errorHandler(403,"You can update only your account!"));
  }
  try {
    if(req.body.password){
      req.body.password = bcrypt.hashSync(req.body.password,10); //hash the new password before saving to database
    }
     const updatedUser = await User.findByIdAndUpdate(req.params.id,{
      $set: { //we do it explicitly to avoid overwriting the whole document
        username: req.body.username,
        email: req.body.email,
        password: req.body.password, 
        avatar: req.body.avatar
      },
  },{new:true}); //new:true means we want to return the updated document

   const { password, ...others } = updatedUser._doc; //we do this to exclude the password from the user object that we send to the client side (frontend)

   res.status(200).json(others); //send the updated user object to the client side (frontend) without the password
  }catch (error) {
    next(error); //this will go to the error handling middleware in index.js
  }
}

export const deleteUser = async (req, res,next) => {
  if(req.user.id !== req.params.id){
    return next(errorHandler(403,"You can delete only your account!"));
  }
  try {
     await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token"); //clear the cookie on the client side after deleting the user
    res.status(200).json("User has been deleted.");

  }catch (error) {
    next(error); //this will go to the error handling middleware in index.js
  }
}

export const getUserListings = async (req, res,next) => {

  if(req.user.id === req.params.id){
    try {
    const listing = await Listing.find({userRef: req.params.id});
    res.status(200).json(listing); //send the user object to the client side (frontend) without the password
  }catch (error) {
    next(error); //this will go to the error handling middleware in index.js
  }
  }else{
    return next(errorHandler(403,"You can only get your own listings!"));
  }

  
}