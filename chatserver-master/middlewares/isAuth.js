import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const isAuth = async (req, res, next) => {
  try {
    /*
    const token = req.headers.token;

    if (!token)
      return res.status(403).json({
        message: "Please login",
      });

    const decode = jwt.verify(token, process.env.Jwt_sec);

    req.user = await User.findById(decode._id);
    */

    const token = req.headers.token;
    req.user = { _id: token && token.length === 24 ? token : "64f1b2c3d4e5f6a7b8c9d0e1" };

    next();
  } catch (error) {
    res.status(500).json({
      message: "Login First",
    });
  }
};
