const { adminSignup, getAdminNotification, userApprove, removeUser, setAdmin, uploadEquipmentImage, createEquipment, createTruck, updateTruck } = require('../Controllers/admin.controller');
const adminauth = require('../Middleware/admin.auth');
const userauth = require('../Middleware/user.auth');

const admin_routes = require('express')();

admin_routes.get('/', adminauth, setAdmin)
admin_routes.post('/raise-admin-approval', userauth, adminSignup );
admin_routes.get('/get-notifications', adminauth, getAdminNotification );
admin_routes.get('/user-approve', adminauth, userApprove);
admin_routes.get('/remove-user', adminauth, removeUser);
admin_routes.post('/create-equipment', adminauth, uploadEquipmentImage.single('image'), createEquipment);
admin_routes.post('/create-truck', adminauth, createTruck);
admin_routes.post('/update-truck', adminauth, updateTruck);

module.exports = admin_routes;