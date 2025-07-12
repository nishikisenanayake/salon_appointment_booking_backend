import Service from "../models/service.model.js"
import asyncErrorHandler from "../util/async-error-handler.js"
import CustomError from "../util/custom-error.js"
import validateObjectId from "../util/validate-object-id.js"

// @desc   create a new service
// @route  POST /api/v1/services
// @access private/admin
export const createService = asyncErrorHandler(async (req, res) => {
    const { name, duration, price, serviceImageUrl } = req.body

    const isServiceExist = await Service.findOne({ name })
    if (isServiceExist) {
        throw new CustomError("service already exists", 400)
    }

    const newService = new Service({
        name,
        duration,
        price,
        serviceImageUrl,
    })

    const service = await newService.save()
    res.status(201).json(service)
})

// @desc   get all services
// @route  GET /api/v1/services
// @access public
export const getServices = asyncErrorHandler(async (req, res) => {
    const services = await Service.find()
    res.status(200).json(services)
})

// @desc   get a single service
// @route  GET /api/v1/services/:id
// @access public
export const getServiceById = asyncErrorHandler(async (req, res) => {
    validateObjectId(req.params.id)

    const service = await Service.findById(req.params.id)

    if (!service) {
        throw new CustomError("service not found", 404)
    }

    res.status(200).json(service)
})

// @desc   update a service
// @route  PUT /api/v1/services/:id
// @access private/admin
export const updateService = asyncErrorHandler(async (req, res) => {
    validateObjectId(req.params.id)

    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    if (!service) {
        throw new CustomError("service not found", 404)
    }

    res.status(200).json(service)
})

// @desc   delete a service
// @route  DELETE /api/v1/services/:id
// @access private/admin
export const deleteService = asyncErrorHandler(async (req, res) => {
    validateObjectId(req.params.id)

    const service = await Service.findByIdAndDelete(req.params.id)

    if (!service) {
        throw new CustomError("service not found", 404)
    }

    res.status(200).json({ message: "service deleted successfully" })
})
