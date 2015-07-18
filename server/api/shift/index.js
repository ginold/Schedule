'use strict';

var express = require('express');
var controller = require('./shift.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/',  controller.index);
router.get('/:id',  controller.show);
router.post('/',auth.hasRole('admin'),  controller.create);
router.put('/:id',auth.hasRole('admin'),  controller.update);
router.put('/:id/editStart',auth.hasRole('admin'), controller.editStart);
router.put('/:id/editEnd',auth.hasRole('admin'), controller.editEnd);
router.put('/:id/editCity',auth.hasRole('admin'), controller.editCity);
router.put('/:id/editName',auth.hasRole('admin'), controller.editName);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;