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
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json("All fields are required");
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
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
        userName: username,
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
            exist.email
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
    if (city) {
      const response = await fetch(
        `${process.env.BASE_URL}?q=${city}&appid=${process.env.API_KEY}&units=metric`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const data = await response.json();
      res.json({ success: true, message: "response sent to frontend", data });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDailyForcastByCity = async (req, res) => {
  try {
    const { city } = req.query;
    const days = 7;
    if (city) {
      const response = await fetch(
        `${process.env.FORCAST_BASE_URL}?q=${city}&appid=${process.env.API_KEY}&cnt=${days}&units=metric`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch forecast data");
      }
      const data = await response.json();
      res.json({ success: true, message: "Response sent to frontend", data });
    } else {
      res.status(400).json({ error: "City parameter is required" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const AddToFav = async (req, res) => {
  try {
    const { name, temp, desc, humidity } = req.body;
    if (!name || !temp || !desc || !humidity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const favsExist = await prisma.wishlist.findUnique({
      where: { place: name },
    });

    if (!favsExist) {
      const newFavCity = await prisma.wishlist.create({
        data: {
          place: name,
          temperature: temp.toString(),
          description: desc,
          humidity: humidity.toString(),
        },
      });
      return res
        .status(201)
        .json({ success: true, message: "City added to wishlist", newFavCity });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "City already exists in wishlist" });
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to add city to wishlist" });
  }
};

const GetFavorites = async (req, res) => {
  try {
    const favs = await prisma.wishlist.findMany();
    if (favs) {
      res.json({ success: true, message: "Fav cities fetched", favs });
    } else {
      res.json({ success: false, message: "No fav cities found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to add city to wishlist" });
  }
};

const DeleteFav = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteFav = await prisma.wishlist.delete({
      where: { id: Number(id) },
    });
    res.json({
      success: true,
      message: "City deleted from wishlist",
      deleteFav,
    });
  } catch (error) {
    console.error("Error deleting from wishlist:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete city from wishlist" });
  }
};

export {
  postUser,
  loadUser,
  getWeatherByCity,
  getDailyForcastByCity,
  AddToFav,
  GetFavorites,
  DeleteFav,
};
