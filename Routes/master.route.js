const master_routes = require('express')();
const { createDepartment, setCaptain, createMasterAccount, loginMaster, getMasterNotification } = require('../Controllers/master.controller');
const masterauth = require('../Middleware/master.auth');

master_routes.post('/signup', masterauth, createMasterAccount)
master_routes.post('/login', loginMaster);
master_routes.post('/create-dept', masterauth, createDepartment);
master_routes.post('/attach-dept-captain', masterauth, setCaptain);
master_routes.get('/get-notifications', masterauth, getMasterNotification);

module.exports = master_routes;
