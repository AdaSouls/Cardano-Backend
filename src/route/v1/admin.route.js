const express = require("express");
const validate = require("../../middleware/validate");
const adminController = require("../../controller/admin.controller");
const adminValidation = require("../../validation/admin.validation");

const router = express.Router();

router.route("/user/:userId/addRole/:role").get(validate(adminValidation.addRoleToUser), adminController.addRoleToUser);

module.exports = router;
