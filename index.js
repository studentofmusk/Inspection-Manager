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
app.get("/account/signup", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "account/signup.html"));
})
app.get("/account/changepassword", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "account/changepassword.html"));
})
app.get("/account/forgotpassword", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "account/forgotpassword.html"));
})


app.get("/equipments/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "equipments.html"));
})

app.get("/equipments/details", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "equipments/details.html"));
})

app.get("/maintenance/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "maintenance.html"));
})
app.get("/maintenance/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "maintenance.html"));
})
app.get("/maintenance/inspection/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "maintenance/inspection.html"));
})
app.get("/manageequipments/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "manageequipments.html"));
})
app.get("/manageequipments/create/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "manageequipments/create.html"));
})
app.get("/manageequipments/delete/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "manageequipments/delete.html"));
})
app.get("/manageequipments/edit/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "manageequipments/edit.html"));
})
app.get("/trucks/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "trucks.html"));
})
app.get("/trucks/create/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "trucks/create.html"));
})
app.get("/trucks/delete/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "trucks/delete.html"));
})
app.get("/trucks/edit/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "trucks/edit.html"));
})
app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "index.html"));
})
app.get("*", (req, res)=>{
    res.sendFile(path.join(__dirname, "./client/out", "404.html"));
})


//Error middleware
app.use(errorHandlingMiddleware);

//-----Server Listening-----
app.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
})

