import jwt from "jsonwebtoken";
import axios from "axios";
import env from "dotenv";
env.config();
import bcrypt from "bcrypt";
import prisma from "../db/prisma.js";
import { createSecretToken } from "../utils/jwt.js";

const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };
  
  const postUser = async (req, res) => {
    try {
        console.log(req.body,'ddddd');
      const { username, email, password } = req.body;
    
      if (!username || !email || !password) {
        return res.status(400).json("All fields are required");
      }
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email address" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      const exist = await prisma.user.findUnique({
        where: { email: email },
      });
  
      if (exist) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          userName:username,
          email,
          password: hashedPassword,
        },
      });
  
      return res.status(200).json({
        message: "User created successfully",
        userData: newUser,
      });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server error");
    } finally {
      await prisma.$disconnect();
    }
  };
  const loadUser = async (req, res) => {
    try {
        console.log(req.body,'dddssss');
      const { email, password } = req.body.formData;
      const exist = await prisma.user.findUnique({
        where: { email },
      });
  
      if (exist) {
        if (password && exist.password) {
          const compared = await bcrypt.compare(password, exist.password);
          if (compared) {
            const token = createSecretToken(
              exist.id,
              exist.userName,
              exist.email,
            );
            return res.status(200).json({
              userData: exist,
              status: true,
              err: null,
              token,
            });
          } else {
            return res.json({ message: "Incorrect password!" });
          }
        } else {
          return res.json({ message: "Password is missing!" });
        }
      } else {
        return res.json({ message: "Email not found!" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error!" });
    } finally {
      await prisma.$disconnect();
    }
  };

   const getWeatherByCity = async (req, res) => {
    try {
        const { city } = req.query;
        console.log(city);
        if (city) {
            const response = await fetch(`${process.env.BASE_URL}?q=${city}&appid=${process.env.API_KEY}&units=metric`);
            console.log(response,'response');
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            const data = await response.json();
            res.json({ success: true, message: "response sent to frontend", data });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
  

export { postUser,loadUser ,getWeatherByCity};
