import express from "express"
import verifyToken from "../middlewares/verify-token.middleware.js"
import validateRequest from "../middlewares/validate-request.middleware.js"
import authorizeRoles from "../middlewares/authorize-role.middleware.js"
import {
    getAllStylists,
    getAllUsers,
    getAvailableStylists,
    getUser,
    updateUser,
} from "../controllers/user.controller.js"
import { body, param, query } from "express-validator"

const router = express.Router()

// get all stylists
router.get(
    "/all-stylists",
    verifyToken,
    authorizeRoles("client", "admin"),
    validateRequest,
    getAllStylists
)

// get available stylist
router.get(
    "/available-stylists",
    verifyToken,
    authorizeRoles("client", "admin"),
    query("date").notEmpty().withMessage("date is required"),
    validateRequest,
    getAvailableStylists
)

// get all users
router.get(
    "/",
    verifyToken,
    authorizeRoles("admin"),
    validateRequest,
    getAllUsers
)

// get a single user
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("admin"),
    param("id")
        .notEmpty()
        .withMessage("user id is required")
        .isMongoId()
        .withMessage("invalid user id"),
    validateRequest,
    getUser
)

// update a single user
router.patch(
    "/:id",
    verifyToken,
    authorizeRoles("client", "stylist", "admin"),
    body("name", "Name is required")
        .optional()
        .isString()
        .withMessage("name must be a string"),
    body("email").optional().isEmail().withMessage("invalid email"),
    body("mobileNo")
        .optional()
        .isMobilePhone()
        .withMessage("invalid mobile number"),
    body("profileImageUrl").optional().isURL().withMessage("invalid url"),
    validateRequest,
    updateUser
)

export default router
