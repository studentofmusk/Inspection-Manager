const user_routes = require('express')();

user_routes.get("/", (req, res)=>{
    res.status(200).send("hi");
})

module.exports = user_routes;