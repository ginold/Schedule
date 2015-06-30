'use strict';

angular.module('velociteScheduleApp')
  .controller('AttribuerShiftCtrl', function ($scope, shifts, coursier, date, Attributions) {  

    shifts.push({nom: "Absence/vacances", ville: "Autres"})
    $scope.shifts = shifts;
    $scope.date = date;
    $scope.coursier = coursier
    console.log('in shift!!', shifts)
    $scope.dispoHoursOfTheDay = function (coursier, date) {
      var monthYear = moment(date).format("MM-YYYY");
      var day = moment(date).format("DD-MM-YYYY")
        //for the month of the click date
       for(var month in coursier.dispos){
        if (monthYear == month) {
          //for every week
          var monthDispos = coursier.dispos[monthYear]
          for(var week in monthDispos){
            //look for the dispo day = click day
            for (var i = 0; i < monthDispos[week].dispos.length; i++) {
             var dispoDay = moment(monthDispos[week].dispos[i].start).format("DD-MM-YYYY")
              if (dispoDay == day) {
                //and get the hours of the dispo day
                $scope.dispoStart = monthDispos[week].dispos[i].start;
                $scope.dispoEnd = monthDispos[week].dispos[i].end;
              };
            };
          }
        };
       }
    }
    //get the hours only if there is a shift to set
    if (shifts.length != 0) {
      $scope.dispoHoursOfTheDay(coursier, date)
    };

    $scope.close = function() {
       $scope.$dismiss();
    };
    
    $scope.attribuer = function(shifts, coursier, date) {
      //in components/attribution
      Attributions.setShift(shifts, coursier, date);

      $scope.$close();
      var text = '';
      for (var i = 0; i < shifts.length; i++) {
        console.debug(shifts[i]);
      	 text += shifts[i].nom+' '
      };
      console.log(event)
      event.currentTarget.innerHTML = text;
    };

});
