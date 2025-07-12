import Leave from "../models/leave.model.js"
import asyncErrorHandler from "../util/async-error-handler.js"

// @desc request leave
// @route POST /api/v1/leaves
// @access private
export const requestLeave = asyncErrorHandler(async (req, res) => {
    const { stylistId, date } = req.body

    // check if leave already exists for this stylist on this date
    const isLeaveExists = await Leave.findOne({ stylistId, date })
    if (isLeaveExists) {
        throw new CustomError(
            "leave already exists for this stylist on this date",
            400
        )
    }

    const newLeave = new Leave({
        stylistId,
        date,
    })

    const leave = await newLeave.save()
    res.status(201).json(leave)
})
