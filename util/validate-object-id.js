import CustomError from "./custom-error.js"

const validateObjectId = (id) => {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new CustomError("invalid resource id", 400)
    }
}

export default validateObjectId
