const mongoose = require('mongoose')
const schema = new mongoose.Schema({ food: { type: mongoose.Schema.Types.ObjectId, ref: 'food', required: true }, user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, text: { type: String, required: true, trim: true, maxlength: 500 } }, { timestamps: true })
module.exports = mongoose.model('comment', schema)
