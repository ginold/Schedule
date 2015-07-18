'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MonthYearSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  year : Number,
  monthNum : Number,
  monthName : String
});

module.exports = mongoose.model('MonthYear', MonthYearSchema);