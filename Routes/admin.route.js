const { adminSignup } = require('../Controllers/admin.controller');
const userauth = require('../Middleware/user.auth');

const admin_routes = require('express')();

admin_routes.post('/raise-admin-approval', userauth, adminSignup );

module.exports = admin_routes;