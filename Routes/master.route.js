const master_routes = require('express')();
const { createDepartment, setCaptain, createMasterAccount, loginMaster, getMasterNotification, adminApprove, logoutMaster, getDepartments, removeDeparment } = require('../Controllers/master.controller');
const masterauth = require('../Middleware/master.auth');

master_routes.post('/signup', masterauth, createMasterAccount)
master_routes.post('/login', loginMaster);
master_routes.get('/logout', logoutMaster);
master_routes.get('/', masterauth, (req, res)=>{
    res.status(200).send({success:true, message:"Permission Grant"});
});

master_routes.post('/create-dept', masterauth, createDepartment);
master_routes.post('/attach-dept-captain', masterauth, setCaptain);
master_routes.get('/approve-admin', masterauth, adminApprove);
master_routes.get('/get-notifications', masterauth, getMasterNotification);
master_routes.get('/get-departments', masterauth, getDepartments);
master_routes.get('/remove-department', masterauth, removeDeparment);

module.exports = master_routes;
