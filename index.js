//Imports
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParset = require('cookie-parser');

//Create Express Server
const app = express();

//DotEnv Cofigration
dotenv.config();

//ENV Variable 
PORT = process.env.PORT;

//Server Middlewares
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//Routes Middlewares
// app.use("/api");


app.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
})

