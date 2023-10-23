const { adminSignup, getAdminNotification, userApprove } = require('../Controllers/admin.controller');
const adminauth = require('../Middleware/admin.auth');
const userauth = require('../Middleware/user.auth');

const admin_routes = require('express')();

admin_routes.post('/raise-admin-approval', userauth, adminSignup );
admin_routes.get('/get-notifications', adminauth, getAdminNotification );
admin_routes.get('/user-approve', adminauth, userApprove);

module.exports = admin_routes;