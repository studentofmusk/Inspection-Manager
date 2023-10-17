//----------Imports----------
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const user_routes = require('./Routes/user.route');

//-----Create Express Server-----
const app = express();

//-----DotEnv Cofigration-----
dotenv.config();

//-----ENV Variable-----

//PORT Number 
PORT = process.env.PORT;

//-----Server Middlewares-----
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//-----Routes Middlewares----//

// User Routes 
app.use("/api", user_routes);


//-----Server Listening-----
app.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
})

