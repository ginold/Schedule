'use strict';

var _ = require('lodash');
var mongoose = require('mongoose')
var Attribution = require('./attribution.model');

// Get list of attributions
exports.index = function(req, res) {
  Attribution.find(function (err, attributions) {
    if(err) { return handleError(res, err); }
    return res.json(200, attributions);
  });
};

// Get a single attribution
exports.show = function(req, res) {
  Attribution.findById(req.params.id, function (err, attribution) {
    if(err) { return handleError(res, err); }
    if(!attribution) { return res.send(404); }
    return res.json(attribution);
  });
};

exports.deleteshift = function(req,res){
   Attribution.find(function (err, attributions) {
    if(err) { return handleError(res, err); }
    var theDay = req.body.day
    var monthYear = req.body.monthYear
    var coursier = req.body.coursier
    var shift = req.body.shift

    for(var month in attributions[0].monthYear){
        if (month == monthYear) {
        for(var day in attributions[0].monthYear[monthYear]){
         if (day == theDay) {
          var attrShifts = attributions[0].monthYear[monthYear][day].shifts
          for (var i = attrShifts.length - 1; i >= 0; i--) {
            if (attrShifts[i].coursierAttributed._id  == coursier._id) {
              if (attrShifts[i]._id == shift._id) {
                attrShifts.splice(i,1)
              };
            }; 
          };
         };
        }
      };
    }
    attributions[0].monthYear[monthYear][theDay].shifts = attrShifts;
    var newMonthYear =  attributions[0].monthYear[monthYear]
    var set = { $set: {} };
    set.$set["monthYear."+monthYear] = newMonthYear

    Attribution.update({ _id:  attributions[0]._id }, set , function(error, attributions){
         if (error) return res.send(500, err);
         return res.send(204, attrShifts)
     }); 
  });//attribution find by id
}
exports.setShift = function (req, res){
   Attribution.find(function (err, attributions) {
    if(err) { return handleError(res, err); }
    //if its the first time setting shift, create one
    if (attributions.length == 0) {
      exports.create(req)
    //else, just update the existing
    }else{
      exports.update(req, res, attributions)
    } 
  });
}
// Creates a new attribution in the DB.
exports.create = function(req, res) {
  console.log(req.body);
  var coursier = req.body.coursier;
  delete coursier.dispos;
  req.body.shifts[0].coursierAttributed = coursier;
  var monthYear = {}
  monthYear[req.body.monthYear] = {}
  monthYear[req.body.monthYear][req.body.day] = {}
  monthYear[req.body.monthYear][req.body.day].shifts = []
  monthYear[req.body.monthYear][req.body.day].shifts.push(req.body.shifts[0]);
  var attribution = {
    monthYear : monthYear
  }
  Attribution.create(attribution, function(err, attribution) {
    if(err) { return handleError(res, err); }
    return res.json(201, attribution);
  });
};


function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
};

// Updates an existing attribution in the DB.
// creates a new attributed shift
exports.update = function(req, res, attributions) {
  var daMonthYear = req.body.monthYear
  var daDay = req.body.day
  var coursier = req.body.coursier;
  //create a new day 
  var day = {}
  day[daDay] = {}
  //delete dispos, no use.
  delete coursier.dispos;
  //set the coursier of that shift
  req.body.shifts[0].coursierAttributed = coursier;
  req.body.shifts[0].daSuperId = mongoose.Types.ObjectId();;
  //init the monthYear
    var monthYear = {}
    monthYear[req.body.monthYear] = {}
    monthYear[req.body.monthYear][req.body.day] = {}
    monthYear[req.body.monthYear][req.body.day].shifts = []

  Attribution.findById(attributions[0]._id, function (err, attribution) {
    if (err) { return handleError(res, err); }
    if(!attribution) { return res.send(404); }

    var nowShiftsArray =  req.body.shifts
    //if this month does not exist, create it
    if (typeof attribution.monthYear[daMonthYear] == 'undefined') {
      attribution.monthYear[daMonthYear]  = {}
      attribution.monthYear[daMonthYear][daDay] = {}
      attribution.monthYear[daMonthYear][daDay].shifts = []
    }
      //if there is no shift on that day yet, init the day
     if (typeof attribution.monthYear[daMonthYear][daDay] == 'undefined') {
       attribution.monthYear[daMonthYear][daDay] = {}
       attribution.monthYear[daMonthYear][daDay].shifts = []
       var oldShiftsArray = attribution.monthYear[daMonthYear][daDay].shifts[0]//cause its an array
       //no new shifts, so newOld = nowShifts
       var newOldShifts = nowShiftsArray;
     }else{
      //there is a day with  shift, so get the old shifts and merge them
      var oldShiftsArray = attribution.monthYear[daMonthYear][daDay].shifts
      var newOldShifts = arrayUnique(oldShiftsArray.concat(nowShiftsArray));  
    }
    
   
    // insert old+new shifts to the day
   day[daDay].shifts = newOldShifts

   //copy shifts into the month on that day
   monthYear[daMonthYear][daDay].shifts[0] = newOldShifts

    //old shifts at that day of that month = all old+new shifts of that day
    attribution.monthYear[daMonthYear][daDay] = day[daDay]
    var newOldMonthYear = attribution.monthYear[daMonthYear]

    //replace the whole month with new shift.
    var set = { $set: {} };
    set.$set["monthYear."+daMonthYear] = newOldMonthYear

    Attribution.update({ _id:  attributions[0]._id }, set , function(error){
         if (error) return res.send(500, err);
         return res.send(204)
     }); 


  });
};

// Deletes a attribution from the DB.
exports.destroy = function(req, res) {
  Attribution.findById(req.params.id, function (err, attribution) {
    if(err) { return handleError(res, err); }
    if(!attribution) { return res.send(404); }
    attribution.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}