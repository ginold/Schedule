'use strict';
/*
	separation de la directive trouvee dans main.js
	Il faut la faire fonctionner, je n-y suis pas arrive.
	elle a un nom different pour ne pas faire de collision
*/
angular.module('velociteScheduleApp')
  .directive('manquesCity', function () {
    return {
         scope: {
          day : "=",
          dayOfWeek : "=",
          monthNum : "=",
          year : "=",
          dailyShifts : "=",
          city : "=",
          monthYear : "=",
          returnAttributions: "=",
          showPotentialCoursiers: "="
        },
      templateUrl: 'app/manquesDirective/manques.html',
        link: function  (scope, elem, attrs) {
           elem.addClass('manquesCell');
           scope.attributions = scope.returnAttributions(scope.monthYear)
         
          /*
            checks if shift has already been attributed and how many times
            => manques par ville + nb de fois
            Returns 'enough' if times attributed == times needed
            Returns object with name and left attributions needed, if not.
          */
          scope.isAttributedShift = function (shift, day, month, year, attributions) {
              var day = moment(new Date(parseInt(year), parseInt(month), parseInt(day+1) ) ).format("D");
                  //get the day
                  for(var daDay in attributions){
                    if (daDay == day) {
                      var dayShifts = attributions[day].shifts
                      //for every shift attributed, if its the same as 
                      //in the daily shift list, count how many times, if times >0 retun true
                      var times = 0;
                      for (var i = dayShifts.length - 1; i >= 0; i--) {
                        if (dayShifts[i].shiftID == shift._id ||  dayShifts[i]._id == shift._id) {
                          times++;     
                        }
                      };
                    }
                  }       
                //if it has been attributed at least one time
                if (times > 0) {
                  //attributed the needed times
                  if (times == shift.times || times > shift.times) {
                    
                     var daShift = {_id: shift._id, nom: shift.nom, enough: true, ville : shift.ville, timesLeft : 0,competences:shift.competences, fin: shift.fin, debut: shift.debut}
                   //attributed less than needed
                  }else{
                    var daShift = {_id: shift._id, nom: shift.nom, enough: false, timesLeft : parseInt(shift.times-times), ville : shift.ville, competences:shift.competences,fin: shift.fin, debut: shift.debut}
                  } 
                //there is no attribution -> so manques
                }else{
                  var daShift = { _id: shift._id, nom: shift.nom, enough: false, timesLeft : parseInt(shift.times), ville : shift.ville, competences: shift.competences, fin: shift.fin, debut: shift.debut}  
                } 
                return daShift;
          }


          scope.checkShifts = function(dayOfWeek, day, month, year, attributions){
            var date = new Date(parseInt(year), month, day+1)
            var dayOfWeek = date.getDay();
            scope.shifts =  scope.dailyShifts[dayOfWeek-1]
            scope.checkedShifts = []
            if (scope.shifts) {
                 $.each(scope.shifts, function(i, shift){
                  var shift = scope.isAttributedShift(shift, scope.day, month, year, attributions) 
                    scope.checkedShifts.push(shift)
                  });
            }; 
            
          }
          //update view on attribution passed !!!!!!!!!!!!!
           scope.$on("attrPassed", function(e, args){
            var date = new Date(parseInt(scope.year), scope.monthNum, scope.day+1)
            var dayOfWeek = date.getDay();
            scope.attributions = args.attributions[args.monthYear]
            scope.checkShifts(dayOfWeek, scope.day,  scope.monthNum, scope.year, scope.attributions)
           })
          //update on deletition
          scope.$on("delPassed",function(e, args){
            var date = new Date(parseInt(scope.year), scope.monthNum, scope.day+1)
            var dayOfWeek = date.getDay();
            scope.attributions[args.day].shifts = args.shifts
            scope.checkShifts(dayOfWeek, scope.day,  scope.monthNum, scope.year, scope.attributions)
           })
          //WATCH MONTH and re render changes
           scope.$watch("monthNum",function(newMonth,oldValue) {
              var date = new Date(parseInt(scope.year), newMonth, scope.day+1)
              var dayOfWeek = date.getDay();
              scope.attributions = scope.returnAttributions(scope.monthYear)
               scope.checkShifts(dayOfWeek, scope.day, newMonth, scope.year, scope.attributions)
        
            });
           //WATCH YEARand re render changes
           scope.$watch("year",function(newYear,oldValue) {
              var date = new Date(parseInt(newYear), scope.monthNum, scope.day+1)
              var dayOfWeek = date.getDay();
              scope.attributions = scope.returnAttributions(scope.monthYear)
               scope.checkShifts(dayOfWeek,scope.day, scope.monthNum, newYear,scope.attributions)
            });
        },
    //        template: '<p ng-repeat="daShift in checkedShifts" ng-click ="showPotentialCoursiers(day+1, monthNum, year, daShift, $event)" ' 
  //    + '  class="shiftsByCity"  ng-class="daShift.enough !=true ? \'bg-danger\' : \'shiftHidden\' " > '
  //    +' {{daShift.ville == city ? ( daShift.timesLeft <= 1 ? daShift.nom : daShift.nom+"("+daShift.timesLeft+")"    )  : null }}</p>  '
  //   }     
  
    };
  });