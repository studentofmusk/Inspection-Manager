const user_routes = require('express')();
const { signup, sendOTP, login, getNotifications, forgotPassword, changePassword, userTypes, logout, updateDetails, getTrucks, getEquipments, getEquipment, getTruck, getDetails, submitInspection, getInspectionTruckWise, getNotification, getInspectionById, getDashboardDetails, getInspectedTrucks } = require('../Controllers/user.controller');
const userauth = require('../Middleware/user.auth');


user_routes.post('/signup', signup)
user_routes.post('/login', login)
user_routes.get('/logout', logout)
user_routes.post('/change-password', changePassword);
user_routes.get('/forgot-password', forgotPassword);

user_routes.get('/send-otp', sendOTP);
user_routes.get("/", userauth, userTypes)

user_routes.get("/get-dashboard-details",userauth,  getDashboardDetails)

user_routes.get('/get-notifications', userauth, getNotifications);
user_routes.get('/get-notification', userauth, getNotification);
user_routes.get('/get-details', userauth, getDetails);
user_routes.post('/update-details',userauth, updateDetails)
user_routes.post('/upload-Inspection',userauth, submitInspection);
user_routes.get('/get-Inspection-by-bus',userauth, getInspectionTruckWise);
user_routes.get('/get-Inspection-by-id',userauth, getInspectionById);
user_routes.get('/get-Inspected-trucks',userauth, getInspectedTrucks);
user_routes.get('/get-trucks', userauth, getTrucks);
user_routes.get('/get-truck', userauth, getTruck);
user_routes.get('/get-equipments', userauth, getEquipments);
user_routes.get('/get-equipment', userauth, getEquipment);

module.exports = user_routes;