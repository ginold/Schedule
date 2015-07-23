'use strict';

angular.module('velociteScheduleApp')
  .controller('AttribuerShiftCtrl', function (event, $scope, shifts, $http, preselectedDate, preselectedShift, 
                      coursier, date, allShifts, AttributionsService, attributions, attributedShifts) {
    //->no shifts found => the user didnt give his dispos  (coming from setShift())
    if (shifts == null) {
      shifts = []
      $scope.wait = false;
      $scope.noDispo = true;
    };
    if(preselectedShift && moment(date).format("D-M-YYYY") == preselectedDate){
      $scope.preselectedShift = preselectedShift
    }
       //if any, you can delete one and sort them out
    if (attributedShifts){
      $scope.attributed = true;
      $scope.attributedShifts = attributedShifts.coursierShifts
    }; 
    shifts.push({nom: "Absence/vacances", 
                  _id: "nope",
                  ville: "Indisponible",
                  start: date,
                  title: 'Absent'
                })
    $scope.shifts = shifts;
    $scope.date = date;
    $scope.coursier = coursier
    $scope.wait = true;
    $scope.allShifts = allShifts

    //remove from select already enoughly attributed shifts
    $.each(attributedShifts.enoughAttr, function(i, enough){
      $.each($scope.shifts, function(j,shift){
        if (shift && enough) {
          if (shift._id == 
            enough._id) {
             $scope.shifts.splice(j, 1)
          };
        };
       
      })
    })
    //preselect the selected shift in manques, if exising in the shift list
    if(preselectedShift && moment(date).format("D-M-YYYY") == preselectedDate){
      $http.get("api/shifts/"+preselectedShift._id).success(function(shift){
        for (var i = $scope.shifts.length - 1; i >= 0; i--) {
           if($scope.shifts[i]['_id'] === shift['_id']){
                $scope.selectedShift = []
                $scope.selectedShift.push($scope.shifts[i]);
            }
        };
        
      })
    }

    /*
      returns the number of desired shifts per week
      on during the week of the clicked day. Calls getNumberOfAttributedShifts.
    */
    $scope.getDesiredShiftsWeekly = function (coursierId, date) {
      $http.get("api/users/"+coursierId).success(function(coursier) {
          var monthYear = moment(date).format("MM-YYYY");
          var startWeek = moment(date).startOf('week')._d
          var endWeek = moment(date).endOf('week')._d
          var day = moment(date).format("D");
          for(var month in coursier.dispos){
            if (monthYear == month) {
              for(var week in coursier.dispos[month]){
                 var aDay = coursier.dispos[month][week].dispos[0].start;
                 var startWeekDay = moment(aDay).startOf('week')._d
                //if its during the week you clicked, get the weekly shifts of that week
                if (moment(startWeekDay).isSame(startWeek)) {
                  $scope.shiftsWeekly = coursier.dispos[month][week].shiftsWeek; 
                  $scope.getNumberOfAttributedShifts(coursierId, monthYear, startWeek, endWeek)
                  $scope.wait = false;
                };
              }
            };
          }
      })
    
    }
    /*
        gets the number of already attributed shifts to the coursier
        for the given week. 
    */
    $scope.getNumberOfAttributedShifts = function (coursierId, monthYear, startWeek, endWeek) {
        var attributed = 0;
        var startDay = parseInt(moment(startWeek).format("D"));
        var endDay = parseInt(moment(endWeek).format("D"));

         var startMonth = moment(startWeek).month()
            var endMonth =  moment(endWeek).month()
            var currentMonth = new Date().getMonth();
              if (startDay > endDay && startMonth < endMonth && endMonth == currentMonth ) {
              startDay = 1;
            }
            else if (startDay > endDay && startMonth < endMonth && startMonth == currentMonth){
              endDay = moment(startWeek).daysInMonth()             
            };
        for(var day in  attributions[monthYear]){
          //look for shifts during that week and count        
          if (day >= startDay && day <=endDay ) {
             var shifts = attributions[monthYear][day].shifts;            

             for (var i = shifts.length - 1; i >= 0; i--) {
               if(shifts[i].coursierAttributed._id == coursierId){
                attributed++;
               }
             };
          };        
        } 
        $scope.attributed = attributed;      
        return;
    }
    /*
      returns the hours dispo of the clicked day
    */
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
      $scope.getDesiredShiftsWeekly(coursier._id, date)
      $scope.dispoHoursOfTheDay(coursier, date)
    
    $scope.close = function() {
       $scope.$dismiss();
       $(".colDaySelected").removeClass('colDaySelected');
     
    };
    $scope.deleteShift = function(coursier, date, shift){
      AttributionsService.deleteShift(coursier, date, shift);
       $(".colDaySelected").removeClass('colDaySelected');
        $scope.$close();
    }
    $scope.attribuer = function(shifts, coursier, date, otherShift) {
      //in components/attribution
      AttributionsService.setShift(shifts, coursier, date,otherShift);
      $(".colDaySelected").removeClass('colDaySelected');
       $(".lowPotential, .mediumPotential, .highPotential, .busy, .shiftManqueDaySelected").removeClass("lowPotential mediumPotential highPotential busy shiftManqueDaySelected")
      $scope.$close();

    };

});
