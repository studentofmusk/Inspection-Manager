const user_routes = require('express')();
const { signup, sendOTP } = require('../Controllers/user.controller');


user_routes.post('/signup', signup)
user_routes.get('/send-otp', sendOTP);

user_routes.get("/", (req, res)=>{
    res.status(200).send("hi");
})

module.exports = user_routes;