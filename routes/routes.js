import { Router } from "express";
import {
  AddToFav,
  DeleteFav,
  getDailyForcastByCity,
  GetFavorites,
  GetPastForecast,
  getWeatherByCity,
  loadUser,
  postUser,
} from "../controllers/userController.js";
const router = Router();

// Get
router.get("/weather/current", getWeatherByCity);
router.get("/weather/forecast", getDailyForcastByCity);
router.get("/weather/historical", GetPastForecast);
router.get("/favorites", GetFavorites);

//Post
router.post("/register", postUser);
router.post("/login", loadUser);
router.post("/favorites", AddToFav);

//Put
router.put("/deleteFavorites/:id", DeleteFav);

export default router;
