import { validationResult } from "express-validator"
import CustomError from "../util/custom-error.js"

const validateRequest = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        throw new CustomError(errors.array()[0].msg, 400)
    }
    next()
}

export default validateRequest
