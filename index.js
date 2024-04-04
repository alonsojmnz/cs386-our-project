if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []
let posts = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(express.static('public'))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUnitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
  res.render('index.ejs', {isAuthenticated: req.isAuthenticated(), name: req.user ? req.user.name : ''})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.get('/blog', checkAuthenticated, (req, res) => {
  res.render('blog.ejs')
})

app.post('/post', (req, res) => {
  const { topic, comment } = req.body
  console.log(topic, comment)
  posts.push({ topic, comment })

  res.redirect('/posts')
})

app.get('/posts', (req, res) => {
  res.render('posts.ejs', { posts })
})

app.get('/Resources', (req, res) => {
  res.render('Resources.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
  console.log(users)
})

app.get('/CalorieFunctions', (req, res) => {
  res.sendFile('index.html', { root: 'public/CalorieFunctions' })
})

app.delete('/logout', (req, res) => {
  req.logOut(function(err) {
    if(err) { return next(err) }
    res.redirect('/')
  })
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next ) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)