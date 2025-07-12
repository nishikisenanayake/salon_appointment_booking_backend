import { createLogger, format, transports } from "winston"
const { combine, timestamp, json, colorize } = format

// custom format for console logging with colors
const consoleLogFormat = format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm" }),
    format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level}: ${message}`
    })
)

// create a winston logger
const logger = createLogger({
    level: "info",
    format: combine(colorize(), timestamp(), json()),
    transports: [
        new transports.Console({
            format: consoleLogFormat,
        }),
        new transports.File({
            filename: "logs/app.log",
            format: combine(colorize(), timestamp(), json()),
        }),
    ],
})

export default logger
