const user_routes = require('express')();
const { signup, sendOTP, login, getNotifications, forgotPassword, changePassword, userTypes, logout } = require('../Controllers/user.controller');
const userauth = require('../Middleware/user.auth');


user_routes.post('/signup', signup)
user_routes.post('/login', login)
user_routes.get('/logout', logout)
user_routes.post('/change-password', changePassword);

user_routes.get('/send-otp', sendOTP);
user_routes.get('/get-notifications', userauth, getNotifications);
user_routes.get('/forgot-password', forgotPassword);
user_routes.get("/", userauth, userTypes)

module.exports = user_routes;