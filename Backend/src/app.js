const express = require('express');
const morgan = require('morgan')
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRoutes = require('./routes/transaction.routes')
const beneficiaryRoutes = require('./routes/beneficiary.route')
const KycRoutes = require('./routes/Kyc.routes')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express();

app.use(cors({origin: "http://localhost:5173/"}))
app.use(express.json());
app.use(morgan("dev")) 
app.use(cookieParser())

/**
 * - Use Routes
 */
app.use('/api/auth', authRouter)
app.use('/api/account', accountRouter)
app.use('/api/transaction', transactionRoutes)
app.use('/api/beneficiary', beneficiaryRoutes )
app.use('/api/Kyc', KycRoutes)

app.get('/', (req, res)=>{
    res.send("Welcome to Banking System API");
})

// Global Error Handler

app.use((err, req, res, next) => {
    console.error(err); 
    res.status(500).json({ message: err.message || "Something went wrong!" });
});

module.exports = app
