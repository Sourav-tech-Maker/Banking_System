// const i18nextHttpMiddleware = require('./middleware/translation.middleware');
const express = require('express');
const morgan = require('morgan')
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRoutes = require('./routes/transaction.routes')
const beneficiaryRoutes = require('./routes/beneficiary.route')
const KycRoutes = require('./routes/Kyc.routes')
const dashboardRoutes = require('./routes/dashboard.routes')
const userRoutes = require('./routes/user.routes')
const adminRoutes = require('./routes/admin.routes')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express();

app.use(cors({origin: "http://localhost:5173", credentials: true,}))
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
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res)=>{
    res.send("Welcome to Banking System API");
})

// Global Error Handler

app.use((err, req, res, next) => {
    console.error(err); 
    res.status(err.statusCode || 500).json({ message: err.message || "Something went wrong!" });
});

module.exports = app
