import mongoose from "mongoose"

const AppointmentSchema = new mongoose.Schema(
    {
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            validate: {
                validator: async function (userId) {
                    const user = await mongoose.model("User").findById(userId)
                    return user.role === "client"
                },
                message: "user is not a client",
            },
        },
        stylistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            validate: {
                validator: async function (userId) {
                    const user = await mongoose.model("User").findById(userId)
                    return user.role === "stylist"
                },
                message: "user is not a stylist",
            },
        },
        date: { type: Date, required: true },
        slotNumber: { type: Number, required: true, min: 1, max: 8 },
        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "cancelled",
                "completed",
                "expired",
            ],
            default: "pending",
        },
    },
    { timestamps: true, versionKey: false }
)

const Appointment = mongoose.model("Appointment", AppointmentSchema)
export default Appointment
