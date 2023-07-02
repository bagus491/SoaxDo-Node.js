const express = require('express')
const app = express()
const port = 3000



app.get('/', (req,res) => {
    res.send('hello world')
})





// midleware pembatasan tidak boleh akses selain ke path yang telah ditentukan
app.use('/' ,(req,res) => {
    res.status(404)
    res.send('404 NOT FOUND')
})

app.listen(port, () => {
    console.log(`server berjalan di port ${port}`)
})