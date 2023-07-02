const mongose = require('mongoose')

const users = mongose.model('users', 
{
    Username: {
        type: 'string',
        require: true
    },
    Password: {
        type: 'string',
        require: true
    },
    Email: {
        type: 'string',
        require: true
    },
}

)

module.exports = users