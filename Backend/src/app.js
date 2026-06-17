const express = require('express');
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRoutes = require('./routes/transaction.routes')
const cookieParser = require('cookie-parser')
const app = express();

app.use(express.json());
app.use(cookieParser())

/**
 * - Use Routes
 */
app.use('/api/auth', authRouter)
app.use('/api/account', accountRouter)
app.use('/api/transaction', transactionRoutes)

app.get('/', (req, res)=>{
    res.send("Welcome to Banking System API");
})

// Global Error Handler
// A simple safety net for any errors
app.use((err, req, res, next) => {
    console.error(err); 
    res.status(500).json({ message: err.message || "Something went wrong!" });
});

module.exports = app
