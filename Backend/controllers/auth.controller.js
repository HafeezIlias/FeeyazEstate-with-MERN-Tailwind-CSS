import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';

export const signup = async (req, res,next) => { //we use async because we are using await inside the function

    const { username, email, password } = req.body;
    const HashedPassword =  bcrypt.hashSync(password, 10); //hashsync is ansychronous so no need to use await
    const newUser = new User({ username, email, password: HashedPassword });
    try {
        await newUser.save() //we use await because save() is an asynchronous operation that returns a promise (it might take some time to complete)
        res.status(201).json("User created successfully" );
    } catch (error) {
        next(error); //we use next to pass the error to the next middleware function (which is the error handling middleware in index.js or in error.js)
    }

};