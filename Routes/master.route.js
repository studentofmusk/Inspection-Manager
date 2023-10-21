const master_routes = require('express')();
const { createDepartment, setCaptain, createMasterAccount, loginMaster } = require('../Controllers/master.controller');
const masterauth = require('../Middleware/master.auth');

master_routes.post('/signup', createMasterAccount)
master_routes.post('/login', loginMaster);
master_routes.post('/create-dept', masterauth, createDepartment);
master_routes.post('/attach-dept-captain', masterauth, setCaptain);

module.exports = master_routes;
