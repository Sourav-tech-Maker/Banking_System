const mongoose = require('mongoose')

const translationSchema = new mongoose.Schema({

    local: {
        type: String,
        required: true,
        trim: true
    },
    key: {
        type: String,
        required: true,
        trim: true
    },
    namespace:{ 
     type: String,
     required: true, 
     default: 'common',
     trim: true
    },
    value 
})

