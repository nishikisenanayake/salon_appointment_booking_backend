import Leave from "../models/leave.model.js"
import User from "../models/user.model.js"
import asyncErrorHandler from "../util/async-error-handler.js"
import CustomError from "../util/custom-error.js"
import validateObjectId from "../util/validate-object-id.js"
import logger from "../util/logger.js"

// @desc   get all users
// @route  GET /api/v1/users/
// @access private
export const getAllUsers = asyncErrorHandler(async (req, res) => {
    const users = await User.find()

    if (users.length === 0) {
        throw new CustomError("no users exsits", 404)
    }

    res.status(200).json(users)
})

// @desc   get an user
// @route  GET /api/v1/users/:id
// @access private
export const getUser = asyncErrorHandler(async (req, res) => {
    validateObjectId(req.params.id)

    const user = await User.findById(req.params.id)

    if (!user) {
        throw new CustomError("user not found", 404)
    }

    res.status(200).json(user)
})

// @desc   update a user
// @route  PUT /api/v1/users/:id
// @access public
export const updateUser = asyncErrorHandler(async (req, res) => {
    validateObjectId(req.params.id)

    const updatableData = req.body

    if (updatableData.role || updatableData._id || updatableData.password) {
        throw new CustomError("unauthorized action", 403)
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            ...updatableData,
        },
        { new: true, runValidators: true }
    )

    if (!user) {
        throw new CustomError("user not found", 404)
    }

    logger.info(user)
    res.status(200).json(user)
})

// @desc   get all stylists
// @route  GET /api/v1/users/all-stylists
// @access public
export const getAllStylists = asyncErrorHandler(async (req, res) => {
    const stylists = await User.find({ role: "stylist" })

    if (stylists.length === 0) {
        throw new CustomError("no stylists exsits", 404)
    }

    res.status(200).json(stylists)
})

// @desc   get available stylists in specific day
// @route  GET /api/v1/users/available-stylists?date
// @access public
export const getAvailableStylists = asyncErrorHandler(async (req, res) => {
    const { date } = req.query

    // get all stylists
    const allStylists = await User.find({ role: "stylist" })

    // get stylists who are on leave on the given date
    const leaveStylists = await Leave.find({ date }).select("stylistId")

    // extract stylist ID's who are on leave
    const leaveStylistsIds = leaveStylists.map((leave) =>
        leave.stylistId.toString()
    )

    // filter available stylists
    const availableStylists = allStylists.filter(
        (stylists) => !leaveStylistsIds.includes(stylists._id.toString())
    )

    res.status(200).json({ availableStylists })
})
