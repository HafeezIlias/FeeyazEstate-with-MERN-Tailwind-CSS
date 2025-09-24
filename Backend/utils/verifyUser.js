import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";


export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token; //access the token from the cookie

    if(!token){ return next(errorHandler(401,"You are not authenticated!"))} //if no token found

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if(err) return next(errorHandler(403,"Token is not valid!")); //if token is not valid
        req.user = user; //if token is valid save the user info in the request object
        next(); //next middleware which will go to the user.route updateUser function
    });
};