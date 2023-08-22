const mongose = require('mongoose')
const{MongoClient} = require('mongodb')

const url = 'mongodb://127.0.0.1:27017/soaxdo'

mongose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})

const client = new MongoClient(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

client.connect((error) => {
    if(error){
        return console.log('gagal terhubung')
    }

    console.log('berhasil terhubung ke database')
})
