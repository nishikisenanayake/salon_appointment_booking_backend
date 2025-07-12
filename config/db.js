import { connect as _connect } from "mongoose"
import logger from "../util/logger.js"

const connectDB = async () => {
    try {
        const connect = await _connect(process.env.DB_CONNECTION_STRING)
        logger.info(
            `Database connected: ${connect.connection.host}, ${connect.connection.name}`
        )
    } catch (error) {
        logger.error(error)
        process.exit(1)
    }
}

export default connectDB
