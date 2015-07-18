'use strict';

var express = require('express');
var controller = require('./attribution.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.put('/:id/setShift',auth.hasRole('admin'),  controller.setShift);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.put('/:id/deleteShift',auth.hasRole('admin'),  controller.deleteshift);

module.exports = router;