const mongose = require('mongoose')
const{MongoClient} = require('mongodb')

const url = 'mongodb://bagus:<password>@ac-aax6ywu-shard-00-00.s8edxgg.mongodb.net:27017,ac-aax6ywu-shard-00-01.s8edxgg.mongodb.net:27017,ac-aax6ywu-shard-00-02.s8edxgg.mongodb.net:27017/?ssl=true&replicaSet=atlas-fvxcnp-shard-0&authSource=admin&retryWrites=true&w=majority'

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
