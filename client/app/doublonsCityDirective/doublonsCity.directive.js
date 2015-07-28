'use strict';

angular.module('velociteScheduleApp')
  .directive('doublonsCity', function () {
  
      return{
        scope : {
          year : "=",
          day : "=",
          monthNum : "=",
          dailyShifts : "=",
          returnAttributions: "=",
          monthYear : "="
        },
         templateUrl: 'app/doublonsCityDirective/doublonsCity.html',
    
        link : function  (scope, elem, attrs) {
          scope.attributions = null;
         
          /*
            checks if shift has already been attributed and how many times
            => manques par ville + nb de fois
            In this case -> check if too much OR if its not the day that shift should be done
          */
          scope.isAttributedShift = function (shift, day, month, year, attributions) {
              var date = new Date(year, month, (day+1));
              var day = moment( date ).format("D");  
              var dayId = date.getDay()
              //get the day
              for(var daDay in attributions){
                if (daDay == day) {
                  var times = 0;
                  var dayShifts = attributions[day].shifts
                  //for every shift attributed, if its the same as 
                  //count each attributed shift
                  for (var i = dayShifts.length - 1; i >= 0; i--) {
                    if (dayShifts[i].shiftID == shift._id || dayShifts[i]._id == shift._id) {
                      times++;   
                    }
                  };
                  
                }
              }       
              //if it has been attributed at least one time
              if (times > 0) {
                  //check if its the correct day for that shift
                  var shiftDayIds = []
                  for(var theDay in shift.jours){
                    shiftDayIds.push(shift.jours[theDay].id)
                  }
                  //if its incorrect day, show it with other bg
                  if ($.inArray(dayId, shiftDayIds) == -1) {
                    var daShift = {_id: shift._id, 
                      nom: shift.nom, invalidDay: true, 
                      ville : shift.ville, timesLeft : times,
                      competences:shift.competences, 
                      fin: shift.fin, debut: shift.debut
                    }
                     return daShift;
                  }
                  //else, its the good day, return how many times
                  else{
                    //check how many times on that day it sould be done!
                    for(theDay in shift.jours){
                      if (shift.jours[theDay].id == dayId) {
                        if (times > shift.jours[theDay].times) {
                           var daShift = {_id: shift._id, nom: shift.nom, enough: true, 
                            ville : shift.ville, timesLeft : Math.abs(shift.times-times),
                            competences:shift.competences, 
                            fin: shift.fin, debut: shift.debut
                          }
                           return daShift;
                        };
                      };
                    }


                  }
              }               
          }
          scope.checkShifts = function(day, month, year, attributions){
            var date = new Date(parseInt(year), month, day+1)
            var dayOfWeek = date.getDay();
            //will be checking for all the shifts
            scope.shifts =  scope.dailyShifts[scope.dailyShifts.length-1]
            scope.doubleShifts = [];
            if (scope.shifts) {
                 $.each(scope.shifts, function(i, shift){
                  var shift = scope.isAttributedShift(shift, scope.day, month, year, attributions) 
                    if (shift) {                  
                    scope.doubleShifts.push(shift)
                  };
                })   
            };          
          }
           //update view on attribution passed !!!!!!!!!!!!!
           scope.$on("attrPassed", function(e, args){
            scope.attributions = args.attributions[args.monthYear]
            scope.checkShifts(args.day, scope.monthNum, scope.year, scope.attributions)
           })
          //update on deletition
           scope.$on("delPassed",function(e, args){
            scope.attributions[args.day].shifts = args.shifts
            scope.checkShifts(args.day, scope.monthNum, scope.year, scope.attributions)
           })
          //WATCH MONTH and re render changes
           scope.$watch("monthNum",function(newMonth,oldValue) {
             scope.attributions = scope.returnAttributions(scope.monthYear)
             scope.checkShifts(scope.day, newMonth, scope.year, scope.attributions)
            });
           //WATCH YEARand re render changes
           scope.$watch("year",function(newYear,oldValue) {
             scope.attributions = scope.returnAttributions(scope.monthYear)
              scope.checkShifts(scope.day, scope.monthNum, newYear, scope.attributions)
           });
       
      }
     }
      
  });