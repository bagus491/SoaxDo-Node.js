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

//validator
const {body,validationResult} = require('express-validator')

//bycrpt
const bycrpt = require('bcrypt')
const salt = bycrpt.genSaltSync(10)

//flash msg
const cookie = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')

app.use(cookie('secret'))
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'secret',
    cookie: {maxAge: 6000}
}))
app.use(flash())

// midleware  token
const jwt = require('jsonwebtoken')
const secretkey = 'asdsawe1235saxsasa3123'

app.use('/profile', (req,res,next) => {
    const token = req.headers.authorization || req.cookies.token
    if(token){
        try{
            const decoded = jwt.verify(token,secretkey)
            req.Username = decoded
            next()
        }catch{
            res.status(401)
            res.send('wrong Credtentials')
        }
    }else{
        res.status(401)
        res.send('wrong Credtentials')
    }
})


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
app.post('/register', [
    body('Username').custom(async (value) => {
        const Duplikat = await users.findOne({Username: value})
        if(Duplikat) {
            throw new Error('Username telah tersedia')
        }else{
            return true
        }
    }),
    body('Password').isLength({min: 5}).withMessage('Password minimal 5 character'),
    body('Email').isEmail().withMessage('Email tidak valid').custom(async (value) => {
        const DuplikatEmail = await users.findOne({Email: value})
        if(DuplikatEmail){
            throw new Error('Email telah terdaftar')
        }else{
            return true
        }
    }),
],(req,res) => {
    const error = validationResult(req)
    const {Username,Password,Email} = req.body
    if(!error.isEmpty()){
        res.render('register', {
            title: 'SoaxDo/register',
            layout: 'register',
            error: error.array()
        })
    }else{
        users.insertMany(
            {
                Username,
                Password: bycrpt.hashSync(Password,salt),
                Email,
            }
        )
            .then((error,result) => {
                req.flash('msg', 'Berhasil Register')
                res.redirect('/login')
            })
    }
})


// router login
app.get('/login', (req,res) => {
    res.render('login', {
        title: 'SoaxDo/login',
        layout: 'login',
        msg: req.flash('msg')
    })
})

//post login
app.post('/login', 
async (req,res) => {
    const {Username,Password}  = req.body
    const dataOk = await users.findOne({Username})
    if(dataOk){
        const passOk = bycrpt.compareSync(Password, dataOk.Password)
        if(passOk){
            jwt.sign({Username, id:dataOk._id},secretkey, {} , (err,token) =>{
            if(err) throw new err;
            res.cookie('token',token)
            
            // langsung ke halaman berikutnya kalau misalkan berhasil tokennya
            res.redirect('/profile')
           })
        }else {
            req.flash('msg', 'Password Salah')
            res.redirect('/login')
        }
    }else{
        req.flash('msg', 'username tidak ditemukan')
        res.redirect('/login')
    }
    
})

// succes login dan register





// midleware pembatasan tidak boleh akses selain ke path yang telah ditentukan
app.use('/' ,(req,res) => {
    res.status(404)
    res.send('404 NOT FOUND')
})

app.listen(port, () => {
    console.log(`server berjalan di port ${port}`)
})