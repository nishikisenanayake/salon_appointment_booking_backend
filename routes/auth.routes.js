import express from "express"
import { body } from "express-validator"
import {
    getLoggedInUser,
    login,
    register,
} from "../controllers/auth.controller.js"
import verifyToken from "../middlewares/verify-token.middleware.js"
import validateRequest from "../middlewares/validate-request.middleware.js"

const router = express.Router()

// register a user
router.post(
    "/register",
    body("name", "Name is required")
        .notEmpty()
        .withMessage("name is required")
        .isString()
        .withMessage("name must be a string"),
    body("email", "Email is required")
        .notEmpty()
        .isEmail()
        .withMessage("invalid email"),
    body("password", "Password is required")
        .notEmpty()
        .withMessage("password is required")
        .isLength({ min: 6 }),
    body("mobileNo")
        .notEmpty()
        .withMessage("mobile number is required")
        .isMobilePhone(),
    body("role")
        .notEmpty()
        .withMessage("role is required")
        .isIn(["admin", "client", "stylist"]),
    validateRequest,
    register
)

// login a user
router.post(
    "/login",
    body("email", "Email is required")
        .notEmpty()
        .isEmail()
        .withMessage("invalid email"),
    body("password", "Password is required")
        .notEmpty()
        .withMessage("password is required"),
    validateRequest,
    login
)

// get logged in user
router.get("/me", verifyToken, validateRequest, getLoggedInUser)

export default router
