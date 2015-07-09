'use strict';

var express = require('express');
var controller = require('./attribution.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.put('/:id/setShift', controller.setShift);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.put('/:id/deleteShift', controller.deleteshift);

module.exports = router;