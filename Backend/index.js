import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const app = express();

app.use(express.json()); //so that we can parse json data 

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use('/backend/user',userRoutes);
app.use('/backend/auth',authRoutes);

app.use((err, req, res, next) => { //this is a middleware function that will be called whenever an error is thrown in any of the routes
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({ 
    success: false,
    statusCode,
    message,
   });

});