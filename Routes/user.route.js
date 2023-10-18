const user_routes = require('express')();
const { signup } = require('../Controllers/user.controller');


user_routes.post('/signup', signup)

user_routes.get("/", (req, res)=>{
    res.status(200).send("hi");
})

module.exports = user_routes;