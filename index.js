require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const router = require('./router/index');
const errorMiddleware = require('./middlewares/error-middleware');

const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use('/api', router)
app.use(errorMiddleware)

const start = async () => {
    try {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log(error)
    }
}

start();