'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AttributionSchema = new Schema({
  monthYear : Schema.Types.Mixed
});

module.exports = mongoose.model('Attribution', AttributionSchema);