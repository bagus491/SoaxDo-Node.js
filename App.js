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

//midleware users
app.use(express.urlencoded({extended: true}))


// ini adalah app get login
app.get('/', (req,res) => {
    res.render('home', {
        title : 'SoaxDo/home',
        layout : 'home',
    })
})

//router register
app.get('/register', (req,res) => {
    res.render('register', {
        title: 'SoaxDo/register',
        layout: 'register'
    })
})

//post register
app.post('/register', (req,res) => {

})


// router login
app.get('/login', (req,res) => {
    res.render('login', {
        title: 'SoaxDo/login',
        layout: 'login'
    })
})

//post login
app.post('/login', (req,res) => {
    
})




// midleware pembatasan tidak boleh akses selain ke path yang telah ditentukan
app.use('/' ,(req,res) => {
    res.status(404)
    res.send('404 NOT FOUND')
})

app.listen(port, () => {
    console.log(`server berjalan di port ${port}`)
})