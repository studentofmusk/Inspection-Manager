const master_routes = require('express')();
const { createDepartment, setCaptain } = require('../Controllers/master.controller');


master_routes.post('/create-dept', createDepartment);
master_routes.post('/attach-dept-captain', setCaptain);


module.exports = master_routes;
