'use strict';

var _ = require('lodash');
var MonthYear = require('./monthYear.model');

// Get list of monthYears
exports.index = function(req, res) {
  MonthYear.find(function (err, monthYears) {
    if(err) { return handleError(res, err); }
    return res.json(200, monthYears);
  });
};
exports.getMonthYears = function(req, res) {
  MonthYear.find({year: req.params.year},function (err, monthYears) {
    if(err) { return handleError(res, err); }
    return res.json(200, monthYears);
  });
};

exports.open = function(req, res) {
  console.log('open')
    var set = { $set: {} };
    set.$set["active"] = req.body.active;
    MonthYear.update({ _id:  req.params.id }, set , function(error){
         if (error) return res.send(500, err);
         return res.send(204)
     }); 
};
exports.close = function(req, res) {
  console.log('close')
    var set = { $set: {} };
    set.$set["active"] = req.body.active;
    MonthYear.update({ _id:  req.params.id }, set , function(error){
         if (error) return res.send(500, err);
         return res.send(204)
     }); 
};
// Get a single monthYear
exports.show = function(req, res) {
  MonthYear.findById(req.params.id, function (err, monthYear) {
    if(err) { return handleError(res, err); }
    if(!monthYear) { return res.send(404); }
    return res.json(monthYear);
  });
};

// Creates a new monthYear in the DB.
exports.create = function(req, res) {
  MonthYear.create(req.body, function(err, monthYear) {
    if(err) { return handleError(res, err); }
    return res.json(201, monthYear);
  });
};

// Updates an existing monthYear in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  MonthYear.findById(req.params.id, function (err, monthYear) {
    if (err) { return handleError(res, err); }
    if(!monthYear) { return res.send(404); }
    var updated = _.merge(monthYear, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, monthYear);
    });
  });
};

// Deletes a monthYear from the DB.
exports.destroy = function(req, res) {
  MonthYear.findById(req.params.id, function (err, monthYear) {
    if(err) { return handleError(res, err); }
    if(!monthYear) { return res.send(404); }
    monthYear.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}