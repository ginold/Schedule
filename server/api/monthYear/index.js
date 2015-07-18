'use strict';

var express = require('express');
var controller = require('./monthYear.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/year/:year', controller.getMonthYears);
router.put('/:id/open',auth.hasRole('admin'),  controller.open);
router.put('/:id/close',auth.hasRole('admin'),  controller.close);
router.get('/:id',auth.hasRole('admin'),  controller.show);
router.post('/',auth.hasRole('admin'),  controller.create);
router.put('/:id',auth.hasRole('admin'),  controller.update);
router.patch('/:id',auth.hasRole('admin'),  controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;