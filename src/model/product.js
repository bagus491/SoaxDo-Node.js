const mongose = require('mongoose')

const product = mongose.model('product', 

    {
        Username: {
            type: 'string',
            require: true
        },
        NamaProduct: {
            type: 'string',
            require: true
        },
        JumlahProduct: {
            type: 'string',
            require: true
        },
        ImageProduct: {
            type: 'string',
            require: true
        }
    }

    
)

module.exports = product