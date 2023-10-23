const { adminSignup, getAdminNotification, userApprove, removeUser } = require('../Controllers/admin.controller');
const adminauth = require('../Middleware/admin.auth');
const userauth = require('../Middleware/user.auth');

const admin_routes = require('express')();

admin_routes.post('/raise-admin-approval', userauth, adminSignup );
admin_routes.get('/get-notifications', adminauth, getAdminNotification );
admin_routes.get('/user-approve', adminauth, userApprove);
admin_routes.get('/remove-user', adminauth, removeUser);

module.exports = admin_routes;