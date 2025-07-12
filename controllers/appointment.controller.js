import asyncErrorHandler from "../util/async-error-handler.js"
import CustomError from "../util/custom-error.js"
import Appointment from "../models/appointment.model.js"
import Leave from "../models/leave.model.js"
import User from "../models/user.model.js"
import validateObjectId from "../util/validate-object-id.js"

// client specific functions ============================================================================
// @desc   create an appointment
// @route  POST /api/v1/appointments
// @access private
export const createAppointment = asyncErrorHandler(async (req, res) => {
    const { clientId, stylistId, date, slotNumber } = req.body

    // check selected stylist is on leave
    const isStylistOnLeave = await Leave.findOne({
        stylistId,
        date,
    })
    if (isStylistOnLeave) {
        return res.status(200).json({ isStylistOnLeave: true })
    }

    // check if appointment already exists for this stylist at this slot
    const isExistingAppointment = await Appointment.findOne({
        stylistId,
        date,
        slotNumber,
        status: { $nin: ["declined", "cancelled", "completed"] },
    })
    if (isExistingAppointment) {
        throw new CustomError(
            "appointment already exists for this stylist at this slot",
            400
        )
    }

    const newAppointment = new Appointment({
        clientId,
        stylistId,
        date,
        slotNumber,
    })

    const appointment = await newAppointment.save()
    res.status(201).json(appointment)
})

// @desc   get available slots for a stylist on a date
// @route  GET /api/v1/appointments/availability?stylistId=stylistId&date=date
// @access public
export const getAvailableSlots = asyncErrorHandler(async (req, res) => {
    const { stylistId, date } = req.query

    // check stylist exists
    const stylist = await User.findOne({ _id: stylistId, role: "stylist" })

    if (!stylist) {
        throw new CustomError("stylist not found", 404)
    }

    // check selected stylist is on leave
    const isStylistOnLeave = await Leave.exists({
        stylistId,
        date,
    })
    if (isStylistOnLeave) {
        throw new CustomError("stylist is on leave", 400)
    }

    // get all appointments for the stylist on the date
    const appointments = await Appointment.find({
        stylistId,
        date,
        status: { $nin: ["rejected", "cancelled", "completed"] },
    })

    const bookedSlots = appointments.map(
        (appointment) => appointment.slotNumber
    )
    const allSlots = Array.from({ length: 8 }, (_, i) => i + 1)
    const availableSlots = allSlots.filter(
        (slotNumber) => !bookedSlots.includes(slotNumber)
    )

    res.json({ availableSlots })
})

// @desc   Get all pending appointments for a client
// @route  GET /api/v1/appointments/pending?clientId=clientId
// @access public
export const getPendingAppointments = asyncErrorHandler(async (req, res) => {
    const { clientId } = req.query

    if (!clientId) {
        throw new CustomError("clientId is required", 400)
    }

    const appointments = await Appointment.find({
        clientId,
        status: "pending",
    })
        .populate("stylistId", "name email")
        .sort({ date: -1, slotNumber: 1 })

    res.status(200).json(appointments)
})

// @desc   Get all approved (accepted) appointments for a client
// @route  GET /api/v1/appointments/approved?clientId=clientId
// @access public
export const getApprovedAppointments = asyncErrorHandler(async (req, res) => {
    const { clientId } = req.query

    if (!clientId) {
        throw new CustomError("clientId is required", 400)
    }

    const appointments = await Appointment.find({
        clientId,
        status: "accepted",
    })
        .populate("stylistId", "name email")
        .sort({ date: -1, slotNumber: 1 })

    res.status(200).json(appointments)
})

// @desc   cancel an appointment request
// @route  PUT /api/v1/appointments/:id/cancel
// @access public
export const cancelAppointment = asyncErrorHandler(async (req, res) => {
    validateObjectId(req.params.id)

    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) {
        throw new CustomError("appointment not found", 404)
    }

    if (appointment.status === "cancelled") {
        throw new CustomError("appointment already cancelled", 400)
    }

    appointment.status = "cancelled"
    await appointment.save()
    res.status(200).json(appointment)
})
// client specific functions ============================================================================

// stylist specific functions ===========================================================================
// @desc   accept an appointment request
// @route  PUT /api/v1/appointments/:id/accept
// @access private
export const acceptAppointment = asyncErrorHandler(async (req, res) => {
    validateObjectId(req.params.id)

    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) {
        throw new CustomError("appointment not found", 404)
    }

    if (appointment.status === "accepted") {
        throw new CustomError("appointment already accepted", 400)
    }

    appointment.status = "accepted"
    await appointment.save()
    res.status(200).json(appointment)
})

// @desc   get upcoming accepted appointments for a stylist
// @route  GET /api/v1/appointments/upcoming?stylistId=stylistId
// @access private
export const getUpcomingAppointmentsForStylist = asyncErrorHandler(
    async (req, res) => {
        const { stylistId } = req.query

        if (!stylistId) {
            throw new CustomError("stylistId is required", 400)
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const appointments = await Appointment.find({
            stylistId,
            status: "accepted",
            date: { $gte: today },
        })
            .populate("clientId", "name email")
            .sort({ date: 1, slotNumber: 1 })

        res.status(200).json(appointments)
    }
)

// @desc   get all pending (requested) appointments for a stylist
// @route  GET /api/v1/appointments/requested?stylistId=stylistId
// @access private
export const getRequestedAppointmentsForStylist = asyncErrorHandler(
    async (req, res) => {
        const { stylistId } = req.query

        if (!stylistId) {
            throw new CustomError("stylistId is required", 400)
        }

        const appointments = await Appointment.find({
            stylistId,
            status: "pending",
        })
            .populate("clientId", "name email")
            .sort({ date: 1, slotNumber: 1 })

        res.status(200).json(appointments)
    }
)

// @desc   reject an appointment request
// @route  PUT /api/v1/appointments/:id/reject
// @access private
export const rejectAppointment = asyncErrorHandler(async (req, res) => {
    validateObjectId(req.params.id)

    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) {
        throw new CustomError("appointment not found", 404)
    }

    if (appointment.status === "rejected") {
        throw new CustomError("appointment already rejected", 400)
    }

    appointment.status = "rejected"
    await appointment.save()
    res.status(200).json(appointment)
})
// stylist specific functions ===========================================================================

// admin specific functions =============================================================================
// @desc   Get all appointments (admin only)
// @route  GET /api/v1/appointments/all
// @access private (admin only)
export const getAllAppointments = asyncErrorHandler(async (req, res) => {
    const appointments = await Appointment.find()
        .populate("clientId", "name email")
        .populate("stylistId", "name email")
        .sort({ date: -1, slotNumber: 1 })

    res.status(200).json(appointments)
})
// admin specific functions =============================================================================
