const user_routes = require('express')();
const { signup, sendOTP, login } = require('../Controllers/user.controller');
const userauth = require('../Middleware/user.auth');


user_routes.post('/signup', signup)
user_routes.post('/login', login)

user_routes.get('/send-otp', sendOTP);

user_routes.get("/", userauth, (req, res)=>{
    res.status(200).send("hi");
})

module.exports = user_routes;