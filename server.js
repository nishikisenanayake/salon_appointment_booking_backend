import app from "./app/app.js"
import logger from "./util/logger.js"

// app starts here
const port = process.env.PORT || 8000
app.listen(port, () => {
    logger.info(`server running on port ${port}`)
})
