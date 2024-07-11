import express from 'express'
const app = express()
import cors from 'cors'
import env from 'dotenv'
import router from './routes/routes.js'
env.config()

app.use(cors({
    origin:process.env.URL,
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.use('/', router)

app.listen(process.env.PORT, () => {
    console.log(`server listening on port ${process.env.PORT}!`)
})