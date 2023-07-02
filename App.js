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
const product = require('./src/model/product')

//midleware users
app.use(express.urlencoded({extended: true}))
app.use(express.static('./src/public'));

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

// method override
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

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
    const token = req.cookies.token
    if(token){
        res.redirect('/profile')
    }else{
        res.render('login', {
            title: 'SoaxDo/login',
            layout: 'login',
            msg: req.flash('msg')
        })
    }
})

//post login
app.post('/login', 
async (req,res) => {
    const {Username,Password}  = req.body
    const dataOk = await users.findOne({Username})
    if(dataOk){
        const passOk = bycrpt.compareSync(Password, dataOk.Password)
        if(passOk){
            jwt.sign({Username},secretkey, {} , (err,token) =>{
            if(err) throw new err;
            res.cookie('token',token)
            
            // langsung ke halaman berikutnya kalau misalkan berhasil tokennya
            // res.send({token})
            res.cookie('id', dataOk.Username)
            res.redirect(`/profile`)
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


// router profile
app.get('/profile', (req,res) =>{
    res.render('profile', {
        title: 'SoaxDo/profile',
        layout: 'main-layouts/main-layouts',
    })
})

// sekarang masuk ke bab product semua product disini
// router product
app.get('/product', async (req,res) => {
    const dataOk = await users.findOne({Username: req.cookies.id})
    const productData = await product.find({Username: dataOk.Username})
    res.render('product', {
        title: 'SoaxDo',
        layout : 'main-layouts/main-layouts',
        msg : req.flash('msg'),
        productData
    })
})



// delete product sekarang 

app.delete('/product', (req,res) => {
        const {NamaProduct} = req.body
        product.deleteOne({NamaProduct})
            .then((error,result) =>{
                req.flash('msg', 'berhasil hapus product')
                res.redirect('/product')
            })
})

// router post product
app.post('/product', [
    body('NamaProduct').custom(async (value) => {
        const duplikatProduct = await product.findOne({NamaProduct: value})
        if(duplikatProduct){
            throw new Error('product sudah ada')
        }else{
            return true
        }
    })
] ,async (req,res) => {
    const error = validationResult(req)
     // verifikasi
     const {NamaProduct,JumlahProduct,ImageProduct} = req.body
     const dataOk = await users.findOne({Username: req.cookies.id})
     const productData = await product.find({Username: dataOk.Username})
    if(!error.isEmpty()){
        res.render('product', {
            title: 'SoaxDo',
            layout : 'main-layouts/main-layouts',
            msg : req.flash('msg'),
            error: error.array(),
            productData
        })
    }else{
        if(dataOk){
            product.insertMany(
                { 
                    Username: dataOk.Username,
                    NamaProduct,
                    JumlahProduct,
                    ImageProduct,
                   
                }
            )
            req.flash('msg','berhasil tambah product')
            res.redirect('/product')
        }
    }
   
   
})

// router update product
app.put('/product',[
    body('NamaProduct').custom(async (value) => {
        const duplikatProduct = await product.findOne({NamaProduct: value})
        if(duplikatProduct ){
            throw new Error('product sudah ada')
        }else{
            return true
        }
    })
] ,(req,res) =>{
    const error = validationResult(req)
    const {NamaProduct,JumlahProduct,ImageProduct} = req.body
    if(!error.isEmpty()){
        res.render('update', {
            title: 'SoaxDo/update',
            layout: 'main-layouts/main-layouts',
            productData: req.body,
            error: error.array()
        })
    }else {
        product.updateOne(
            {
                _id: req.body._id
            },
            {
                $set: {
                    NamaProduct: NamaProduct,
                    JumlahProduct: JumlahProduct,
                    ImageProduct: ImageProduct,
                }
            }
        )   .then((result) => {
            req.flash('msg','berhasil update product')
            res.redirect('/product')
            })

    }
    

})


// router get
app.get('/product/update/:NamaProduct', async (req,res) => {
    const productData = await product.findOne({NamaProduct: req.params.NamaProduct})
    if(!productData){
        res.redirect('/product')
    }
    res.render('update', {
        title: 'SoaxDo/update',
        layout: 'main-layouts/main-layouts',
        productData
    })
})


// router logout
app.get('/logout',(req,res) => {
    res.clearCookie('token')
    res.redirect('/login')
})

// midleware pembatasan tidak boleh akses selain ke path yang telah ditentukan
app.use('/' ,(req,res) => {
    res.status(404)
    res.send('404 NOT FOUND')
})

app.listen(port, () => {
    console.log(`server berjalan di port ${port}`)
})