'use strict';

var _ = require('lodash'); 
var Shift = require('./shift.model');

// Get list of shifts
exports.index = function(req, res) {
  Shift.find(function (err, shifts) {
    if(err) { return handleError(res, err); }
    Shift.populate(shifts,{path:'coursiers'}, function(err,shifts){
      return res.json(200, shifts)
    })
  });
};


// Get a single shift and all its coursiers
exports.show = function(req, res) {
  Shift.findById(req.params.id, function(err,shift){
    Shift.populate(shift,{path:'coursiers'}, function(err,shift){
      return res.json(shift)
    })
  })
 
};
exports.editName = function(req, res) {
    var set = { $set: {} };
    set.$set["nom"] = req.body.name;
    Shift.update({ _id:  req.params.id }, set , function(error){
         if (error) return res.send(500, err);
         return res.send(204)
     }); 
};
exports.editStart = function(req, res) {
    var set = { $set: {} };
    set.$set["debut"] = req.body.start;
    Shift.update({ _id:  req.params.id }, set , function(error){
         if (error) return res.send(500, err);
         return res.send(204)
     }); 
};
exports.editCity = function(req, res) {
    var set = { $set: {} };
    set.$set["ville"] = req.body.city;
    Shift.update({ _id:  req.params.id }, set , function(error){
         if (error) return res.send(500, err);
         return res.send(204)
     }); 
};

exports.editEnd = function(req, res) {
   var set = { $set: {} };
    set.$set["fin"] = req.body.end;
    Shift.update({ _id:  req.params.id }, set , function(error){
         if (error) return res.send(500, error);
         return res.send(204)
     }); 
 
};

// Creates a new shift in the DB.
exports.create = function(req, res) {
  Shift.create(req.body, function(err, shift) {
    if(err) { return handleError(res, err); }
    return res.json(201, shift);
  });
};


// Updates an existing shift in the DB.
exports.update = function(req, res) {
 // console.log(req.body);
  if(req.body._id) { delete req.body._id; }
  Shift.findById(req.params.id, function (err, shift) {
    if (err) { return handleError(res, err); }
    if(!shift) { return res.send(404); }

    shift.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, shift);
    });
  });
};

// Deletes a shift from the DB.
exports.destroy = function(req, res) {
  Shift.findById(req.params.id, function (err, shift) {
    if(err) { return handleError(res, err); }
    if(!shift) { return res.send(404); }
    shift.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}