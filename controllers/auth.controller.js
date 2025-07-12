import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import CustomError from "../util/custom-error.js"
import asyncErroHandler from "../util/async-error-handler.js"

const { hash, compare } = bcrypt
const { sign } = jwt

// @desc   register a new user
// @route  POST /api/v1/auth/register
// @access public
export const register = asyncErroHandler(async (req, res) => {
    const { name, email, password, mobileNo, role } = req.body
    const hashedPassword = await hash(password, 10)

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        mobileNo,
        role,
    })

    await newUser.save()

    const user = await User.findOne({ email })
    if (!user) {
        throw new CustomError(`user with email ${email} not found`, 401)
    }

    const token = sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    )

    res.status(201).json({ user, token })
})

// @desc   login a user
// @route  POST /api/v1/auth/login
// @access public
export const login = asyncErroHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
        throw new CustomError(`user with email ${email} not found`, 401)
    }

    const isMatch = await compare(password, user.password)
    if (!isMatch) {
        throw new CustomError("invalid credentials", 401)
    }

    const token = sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    )

    res.status(200).json({ user, token })
})

// @desc   get logged in user
// @route  GET /api/v1/auth/me
// @access private
export const getLoggedInUser = asyncErroHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    res.status(200).json(user)
})
