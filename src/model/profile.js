const mongose = require('mongoose')


const imageSchema = new mongose.Schema({
    Username:String,
    About:String,
    filename:String,
    originalname: String,
    mimetype: String,
    size: Number
})

const profile = mongose.model('profile',imageSchema)




module.exports = profile