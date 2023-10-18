const master_routes = require('express')();
const { createDepartment } = require('../Controllers/master.controller');


master_routes.post('/create-dept', createDepartment);


module.exports = master_routes;
