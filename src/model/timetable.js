const mongose = require('mongoose')


const timetable = mongose.model('timetable', 
    {   
        Username: {
            type: 'string',
            require: true,
        },
        FromTanggal : {
            type: 'string',
            require: true,
        },
        Materi: {
            type: 'string',
            require: true,
        },
        Project : {
            type: 'string',
            require: true,
        },
        Upload : {
            type: 'string',
            require: true,
        },
        Repeat: {
            type: 'string',
            require: true,
        },
    }
)

module.exports = timetable