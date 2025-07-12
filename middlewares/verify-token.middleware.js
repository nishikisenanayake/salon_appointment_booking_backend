import jwt from "jsonwebtoken"
import CustomError from "../util/custom-error.js"

const { verify } = jwt

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new CustomError("no token, authorization denied", 401))
        }

        const token = authHeader.split(" ")[1]
        if (!token) {
            return next(new CustomError("no token, authorization denied", 401))
        }

        const decode = verify(token, process.env.JWT_SECRET)
        req.user = decode
        next()
    } catch (error) {
        return next(new CustomError("token is invalid", 401))
    }
}

export default verifyToken
