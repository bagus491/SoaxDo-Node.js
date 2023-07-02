const express = require('express')
const app = express()
const port = 3000


//setting view ejs
const mainlayouts = require('express-ejs-layouts')
const path = require('path')
app.set('view engine', 'ejs')
app.use(mainlayouts)
app.set('views',path.join(__dirname, 'src/views'))

//database
require('./src/utils/db')
const users = require('./src/model/users');


// ini adalah app get login
app.get('/', (req,res) => {
    res.render('home', {
        title : 'halaman/home',
        layout : 'home',
    })
})





// midleware pembatasan tidak boleh akses selain ke path yang telah ditentukan
app.use('/' ,(req,res) => {
    res.status(404)
    res.send('404 NOT FOUND')
})

app.listen(port, () => {
    console.log(`server berjalan di port ${port}`)
})