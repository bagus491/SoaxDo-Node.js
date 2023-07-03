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
const timetable = require('./src/model/timetable')

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

// multer last middleware
const multer = require('multer')
const Upload = multer({dest: 'uploads/'})

app.use('/profile', (req,res,next) => {
    const token = req.headers.authorization || req.cookies.token
    if(token){
        try{
            const decoded = jwt.verify(token,secretkey)
            req.Username = decoded
            next()
        }catch{
            res.clearCookie('id')
            res.redirect('/login')
        }
    }else{
        res.clearCookie('id')
        res.redirect('/login')
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
// sekarang image upload
const profile = require('./src/model/profile')
app.use('/uploads', express.static('uploads'))

// router profile
app.get('/profile', async (req,res) =>{
    const token = req.cookies.token
    const dataProfile = await profile.findOne({Username: req.cookies.id})
    if(token){
        res.render('profile', {
            title: 'SoaxDo/profile',
            layout: 'main-layouts/main-layouts',
            msg : req.flash('msg'),
            dataProfile
        })
    }else {
        res.redirect('/login')
    }
})

// sekarang masuk ke bab product semua product disini
// router product
app.get('/product', async (req,res) => {
    const dataOk = await users.findOne({Username: req.cookies.id})
    if(dataOk){
        const productData = await product.find({Username: dataOk.Username})
        if(!productData){
            res.clearCookie('token')
            res.redirect('/login')
            
        }else{   
            res.render('product', {
                title: 'SoaxDo',
                layout : 'main-layouts/main-layouts',
                msg : req.flash('msg'),
                productData })
        }
    }else{
        res.clearCookie()
    }
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


// sekarang masuk ke sction timeTable
// router get time
app.get('/timetable', async (req,res) => {
    // panggil
    const dataOk = await users.findOne({Username: req.cookies.id})
    const Time = await timetable.find({Username: dataOk.Username})
    if(dataOk){
        res.render('TimeTable', {
            title: 'SoaxDo/TimeTable',
            layout : 'main-layouts/main-layouts',
            msg: req.flash('msg'),
            Time
        })
    }else{
        res.redirect('/login')
    }
})

//router pos timetable
app.post('/timetable',async  (req,res) =>{
    // validasi kredensial
    const {FromTanggal,Materi,Project,Upload,Repeat} = req.body
    const dataOk = await users.findOne({Username: req.cookies.id})
    if(dataOk){
        timetable.insertMany(
            {
                Username: req.cookies.id,
                FromTanggal,
                Materi,
                Project,
                Upload,
                Repeat,
            }
        ).then((error,result) => {
            req.flash('msg','berhasil tambah Jadwal')
            res.redirect('/timetable')
        })
    }
})

//router delete timetable
app.delete('/timetable', async (req,res) => {
    timetable.deleteOne(
        {_id: req.body._id}
        ).then((error,result) => {
            req.flash('msg', 'berhasil hapus time')
            res.redirect('/timetable')
        })

})


// sekarang masuk ke section settings
app.get('/settings',  async (req,res) => {
    const dataOk = await users.findOne({Username: req.cookies.id})
    res.render('settings', {
        title: 'SoaxDo/Settings',
        layout: 'main-layouts/main-layouts',
        msg : req.flash('msg'),
        dataOk
    })
})

// update akun
app.get('/updateakun', async (req,res) => {
    const dataOK = await users.findOne({Username: req.cookies.id})
    if(dataOK){
        res.render('update-akun', {
            title: 'SoaxDo/UpdateAkun',
            layout: 'main-layouts/main-layouts',
            dataOK
        })
    }
})

// router post update akun
app.put('/updateakun',[
    body('Username').custom( async (value) => {
        const duplikat = await users.findOne({Username: value})
        if(duplikat){
            throw new Error('Username Telah tersedia')
        }else{
            return true
        }
    }),
    body('Password').isLength({min: 5}).withMessage('Panjang Password Minimal 5'),
    body('Email').isEmail().withMessage('Email tidak valid'),
] ,async (req,res) => {
    const dataOK = await users.findOne({Username: req.cookies.id})
    const {Username,Password,Email} = req.body
    const error = validationResult(req)
    if(!error.isEmpty()){
        res.render('update-akun', {
            title: 'SoaxDo/UpdateAkun',
            layout: 'main-layouts/main-layouts',
            dataOK: req.body,
            error: error.array()
        })
    }else{
        users.updateOne(
            {
                _id: dataOK._id
            },
            {
                $set: {
                    Username,
                    Password: bycrpt.hashSync(Password,salt),
                    Email,
                }
            }
        ).then((error,result) => {
            res.cookie('id',Username)
        })
        // sekarang update product
        product.updateMany(
            {
                Username: dataOK.Username
            },
            {
                $set: {
                    Username,
                }
            }
        ).then((error,result) => {
            req.flash('msg','berhasil update akun')
        })
        // sekarang update timetable
        timetable.updateMany(
            {
                Username: dataOK.Username
            },
            {
                $set: {
                    Username,
                }
            }
        ).then((error,result) => {
            res.redirect('/settings')
        })
    }

})

// router delete akun
app.delete('/settings', async (req,res) => {
    const dataOk = await users.findOne({Username: req.cookies.id})
    if(dataOk){
        users.deleteOne(
            {
                _id: req.body._id
            }
        ).then((error,result) => {
            console.log('berhasil')
        })

        //delete products
        product.deleteMany(
            {
                Username: dataOk.Username
            }
        ).then((error,result) => {
            req.flash('msg', 'berhasil hapus akun')
        })

        //delete time table
        timetable.deleteMany(
            {
                Username: dataOk.Username
            }
        ).then((error,result) => {
            res.clearCookie('token')
            res.clearCookie('id')
            res.redirect('/login')
        })
    }
    

})


// router logout
app.get('/logout',(req,res) => {
    res.clearCookie('token')
    res.clearCookie('id')
    res.redirect('/login')
})

// router app get update profile
app.get('/updateprofile', (req,res) => {
    res.render('updateprofile', {
        title: 'SoaxDo/UpdateProfile',
        layout: 'main-layouts/main-layouts',
    })
})

// router upload about

app.post('/updateprofile',Upload.single('avatar'),[
    body('About').isLength({max: 50}).withMessage('About terlalu Panjang')
],async (req,res) => {
    const {filename,originalname,mimetype,size} = req.file
    const dataOk = await users.findOne({Username: req.cookies.id})
    const error = validationResult(req)
    if(!error.isEmpty()){
        res.render('updateprofile', {
            title: 'SoaxDo/UpdateProfile',
            layout: 'main-layouts/main-layouts',
            error: error.array()
        })
    }else {
        if(dataOk){
            const newImage = new profile({
                Username: dataOk.Username,
                About: req.body.About,
                filename,
                originalname,
                mimetype,
                size,
            })
        
            newImage.save((err) => {
                if(err) {
                    console.error(err)
                }
                req.flash('msg', 'berhasil update profile')
                res.redirect('/profile')
            })
    
        }

    }
})

// midleware pembatasan tidak boleh akses selain ke path yang telah ditentukan
app.use('/' ,(req,res) => {
    res.status(404)
    res.send('404 NOT FOUND')
})

app.listen(port, () => {
    console.log(`server berjalan di port ${port}`)
})