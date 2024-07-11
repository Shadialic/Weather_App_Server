import { Router } from 'express';
import { getWeatherByCity, loadUser, postUser } from '../controllers/userController.js';
const router = Router();
router.post('/register', postUser)
router.post('/login', loadUser)
router.get('/weather/current', getWeatherByCity)
// router.get('/weather/forecast/', getWeatherByCity)
// router.post('/favorites/:name/:temp/:desc/:humidity', AddToFav)
// router.get('/favorites', GetFavorites)
// router.get('/delete/:id', DeleteUserFav)
export default router;
