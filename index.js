//----------Imports----------
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const user_routes = require('./Routes/user.route');
const errorHandlingMiddleware = require('./Error/middleware');
const master_routes = require('./Routes/master.route');
const admin_routes = require('./Routes/admin.route');
const path = require('path');

//-----Create Express Server-----
const app = express();

//-----DotEnv Cofigration-----
dotenv.config();

//-----DB Connection-------
require("./DB/conn");

//-----ENV Variable-----

//PORT Number 
PORT = process.env.PORT;

//Static 
app.use(express.static(path.join(__dirname, "./client/out")));
app.use(express.static(path.join(__dirname, "./uploads")));

//-----Server Middlewares-----
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//-----Routes Middlewares----//

// User Routes 
app.use("/api", user_routes);
app.use("/api/admin", admin_routes);
app.use("/api/master/admin", master_routes)


app.get("/account/login", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "account/login.html"));
})
app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "index.html"));
})

//Error middleware
app.use(errorHandlingMiddleware);

//-----Server Listening-----
app.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
})

