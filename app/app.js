import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import morgan from "morgan"
import helmet from "helmet"

import connectDB from "../config/db.js"
import router from "../routes/index.routes.js"
import CustomError from "../util/custom-error.js"
import globalErrorHandler from "../middlewares/global-error-handler.middleware.js"
import logger from "../util/logger.js"

// load env variables
dotenv.config()

// express app
const app = express()

// database connection
connectDB()

// middlewares
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)
app.use(express.json())
app.use(helmet())

// morgan logger
const morganFormat = ":method :status :url :response-time ms"
app.use(
    morgan(morganFormat, {
        stream: {
            write: (message) => {
                const logObject = {
                    method: message.split(" ")[0],
                    status: message.split(" ")[1],
                    url: message.split(" ")[2],
                    responseTime: message.split(" ")[3],
                }

                logger.info(JSON.stringify(logObject))
            },
        },
    })
)

// routes
app.use(router)

// 404 route
app.all("*", (req, res, next) => {
    const error = new CustomError(
        `can't find ${req.originalUrl} on this server`,
        404
    )
    next(error)
})

// global error handling middleware
app.use(globalErrorHandler)

export default app
