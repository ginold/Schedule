'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CounterSchema = new Schema({
  name: String,
  numeroCoursier: 0
});

module.exports = mongoose.model('Counter', CounterSchema);