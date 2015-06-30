'use strict';

angular.module('velociteScheduleApp')
  .controller('MainCtrl', function ($modal,$state, $scope, $http, User, calendarService, shiftService, Auth) {
    var date = new Date();
    var days = calendarService.getDays() // lu ma me...
    var months = calendarService.getMonths()// jan fev mars...

    $scope.monthNum = date.getMonth();
    $scope.year = date.getFullYear();
    $scope.today = moment(new Date()).format("D-M-YYYY")
    $scope.coursiers;
    $scope.shifts;
    $scope.isAdmin = Auth.isAdmin; //to show or not to show the first planning
    $scope.currentUser = Auth.getCurrentUser()
    $scope.presences;
    $scope.absences;
    $scope.showButton = true
    $scope.collapseManques = false;
    $scope.loading = true;
    $scope.eventSources = [];
    $http.get('api/attributions').success(function(attributions){
      $scope.attributions = attributions
      console.log($scope.attributions[0])
    })
     /* config calendar */
    $scope.calendarConfig = {
      calendarCoursier:{
        height: 500,
       //eventDurationEditable: true,
        firstDay: 1, //monday
        lang : 'fr',
        selectHelper: true,
        selectable:true, //time range
        header: {
          left: 'month agendaWeek',
          center: 'title',
          right: 'today prev,next'
        }
      }
    };

// $scope.$watch('shifts',function(){
//   console.log('monthhhh')
// })

//render calendar on month or year change
$scope.renderCalendar= function(month, year, absences,presences){
  console.debug('render calendar')
  console.log(month,year)
  //if year == null, only month has changed -> load only dispos of this month
  if (typeof absences == "undefined") {
     $scope.loadAbsencesAndDispos($scope.coursiers, month, year)
     return;
  };
  $scope.loading = true;
  $scope.absences = absences;
  $scope.presences = presences;
  $scope.monthNum = parseInt(month);

  $scope.calendar = {
      year : year, //selected year
      month: months[$scope.monthNum], //selected month ('janvier','fevrier')
      monthNames: months,// array of mont hames
      daysNames : getDaysArray(year, $scope.monthNum), // get day name for each day of month
      days : new Date(year, $scope.monthNum+1,0).getDate(),//number of days in month
      monthDays : new Array(new Date(year, $scope.monthNum+1,0).getDate())
  }
  $scope.loading = false;
}
/*
  //TODO - BY MONTH TOO!
  returns an array of shifts ordered by day of week
  array[0] = shifts of monday, array[1] = shifts on tuesday...
*/
$scope.orderShiftsByDay = function(){
  var shiftsMon = []
  var shiftsTue = [] 
  var shiftsWed = [] 
  var shiftsTh = [] 
  var shiftsFr = [] 
  var shiftsSat = []

  if( typeof $scope.shifts == 'undefined'){
    shiftService.getShifts(function(shifts){
      for (var i = 0; i < shifts.length; i++) {
        for (var j = 0; j < shifts[i].jours.length; j++) {
          var jour = shifts[i].jours[j].id
          var shift = {nom :shifts[i].nom, times: shifts[i].jours[j].times, 
            ville: shifts[i].villes[0], _id:shifts[i]._id }
          if (jour == 1) {
            shiftsMon.push(shift)
          };
          if (jour == 2) {
            shiftsTue.push(shift)
          };
          if (jour == 3) {
            shiftsWed.push(shift)
          };
          if (jour == 4) {
             shiftsTh.push(shift)
          };
          if (jour == 5) {
            shiftsFr.push(shift)
          };
          if (jour == 6) {
             shiftsSat.push(shift)
          };
        };
      };
       var shiftsJour = [shiftsMon, shiftsTue, shiftsWed, shiftsTh, shiftsFr, shiftsSat]
       $scope.dailyShifts = shiftsJour;
    })
  }
}
$scope.orderShiftsByDay()

/*
  checks if shift has already been attributed and how many times
  => manques par ville + nb de fois
  Returns 'enough' if times attributed == times needed
  Returns object with name and left attributions needed if not.
*/

$scope.isAttributedShift = function (shift, day, month, year,city ) {
  if (typeof $scope.attributions[0] != 'undefined') {
    var day = moment(new Date(year, month, (day+1) ) ).format("D");
    var monthYear = moment(new Date(year, month, day)).format("MM-YYYY");
    var attributions = $scope.attributions[0].monthYear
    //get the month and year

    for(var month in attributions){
      if (month == monthYear) {
        //get the day
        for(var daDay in attributions[month]){
          if (daDay == day) {
            var dayShifts = attributions[month][day].shifts
            //for every shift attributed, if its the same as 
            //in the daily shift list, count how many times, if times >0 retun true
            var times = 0;
            for (var i = dayShifts.length - 1; i >= 0; i--) {
              if (dayShifts[i].shiftID == shift._id) {
                times++;     
              }
            };
          };
        }
      };
    }
  };
  //if it has been attributed at least one time
  if (times > 0) {
  //   //attributed the needed times
    if (times == shift.times || times > shift.times) {
  //     var daShift = {nom: shift.nom, enough: true}
  //     console.log('is enough! '+daShift.nom)
      return true;
   
  //   //attributed less than needed
    }else{

  //     var daShift = {nom: shift.nom, enough: false, timesLeft : shift.times-times}
  //         console.log('is not enough! '+daShift.nom)
          return false;
    }

  };



}

/*
  returns an array of shifts that can be done on the given day.
  Can be given number of the day of week (ex: 1, 2,3...) 
  or complete date (day, month, year)
*/
$scope.sortShiftByDayOfWeek = function(dayId, day, month,year ){
   var day_shifts = [];
  if (dayId == null) {
    var date = new Date(year, month-1, day+1)
    var dayId = date.getDay();
  };
  for (var i = 0; i < $scope.shifts.length; i++) {
      for (var j = 0; j < $scope.shifts[i].jours.length; j++) {
        if ($scope.shifts[i].jours[j].id == dayId) {
          day_shifts.push($scope.shifts[i]);
        };
      };
    };
  return day_shifts;
}

$scope.getAttributedShift = function(day, month,year, userId){
  if (typeof $scope.attributions[0] != 'undefined') {
     var date = new Date(year, month, day+1)
     var monthYear = moment(date).format("MM-YYYY")
     var day = moment(date).format("D")
     var attributions = $scope.attributions[0].monthYear
     var attributedShifts = []
     for(var month in attributions){
      //if its the current month
      if (month == monthYear) {
        for(var dday in attributions[month]){
         //if its the current day
          if (dday == day) {
            for (var i = 0; i < attributions[month][day].shifts.length; i++) {
              if (typeof attributions[month][day].shifts[i].coursierAttributed != 'undefined') {
                //if there is an id in the attributed shifts, its THAT GUY!!!
                if(attributions[month][day].shifts[i].coursierAttributed._id == userId){
                  attributedShifts.push(attributions[month][day].shifts[i])
                }
              };
            };
          };
        }
      };
     }
     if (attributedShifts.length == 0) {
      return
     }else{
      return attributedShifts;
     }
  };

}
/*
  Shows a list of sorted out shifts with corresponding
  hours, cities and capabilities of coursier.
*/
$scope.setShift = function(day, month,year, user){

  var date = new Date(year, month, day)
  var day = moment(date).format("D-M-YYYY");
  var dayOfWeek = moment(date).day()
  //SORT SHIFTs BY DAY OF WEEK clicked
  var day_shifts = $scope.sortShiftByDayOfWeek(dayOfWeek, null, null, null)
  //check if the day clicked is an dispo present day
  for (var i = 0; i < $scope.presences.length; i++) {
    var dispoDay = moment($scope.presences[i].start).format("D-M-YYYY")
    //if yes, check the presence user id and the cell of user clicked
    if (dispoDay == day) {
        //then get all the shifts that fit into this coursier's time range
        if($scope.presences[i].coursierId == user._id){
          var dispo = $scope.presences[i];
          var dispoHours = $scope.getDispoHoursAndDay(dispo);
          // //console.log("DISPO HOURS "+dispoHours.start, dispoHours.end)
          // //console.log('DISPO DAY ' + new Date($scope.presences[i].start).getDay() )
          var time_shifts = $scope.compareDiposHoursAndShift(dispoHours, day_shifts);
          // //then sort the shifts by the dispo's and shift's cities
          var time_city_shifts  = $scope.compareDispoCityAndShift(time_shifts,dispo);
          var time_city_able_shifts = $scope.compareUserAndShift(time_city_shifts, user._id); 
          //check if this shift hasnt been attributed yet
          var time_city_able_notAttributed_shifts = $scope.checkAttributedShifts(time_city_able_shifts)
          //check if shifts/week is respected
          var time_city_able_notAttributed_weeklyOk_shifts = []
          //show the select screen, give it the date, found shifts and the complete user.
          $scope.showPopover(time_city_able_shifts, user, date);  
        }
    };
  };
}
/*
  returns 
*/
$scope.checkAttributedShifts = function(shifts){

}
$scope.showPopover = function(shifts, coursier, date){

 // $state.go('main.selectShift',{shifts: shifts, coursier: coursier, date:date, event : $event})
  $modal.open({
        templateUrl: "app/main/setShiftModal.html",
        animation: false,
        backdrop: false,
        size: "sm",
        resolve: {// what we send to the modal  as 'index'
            shifts : function(){
              return shifts;
            },
            coursier: function(){
              return coursier;
            },
            date: function(){
              return date;
            },
        },
        controller: 'AttribuerShiftCtrl'
    });
 }
/*
  tell if user is permited to do a shift, selected at the creation of shift
*/
$scope.compareUserAndShift = function(shifts, userId){
  var capableShifts = [];
  for (var i = 0; i < shifts.length; i++) {
   //console.log(shifts[i].nom, shifts[i].coursiers);
   for (var j = 0; j < shifts[i].coursiers.length; j++) {
      var coursier =  shifts[i].coursiers[j]
        if(coursier._id == userId){
          var shift = {
            nom : shifts[i].nom, 
            shiftID: shifts[i]._id,
            ville : shifts[i].villes[0], 
            remarques : shifts[i].remarques,
            debut :shifts[i].debut,
            fin: shifts[i].fin
          }
          capableShifts.push(shift)
        }  
   };
  };
  return capableShifts;
}
/*
  returns an array of shifts that have the same city as those
  specified in the dispo. @shifts already are sorted by dispo's time range
  Called in setShift()
*/
$scope.compareDispoCityAndShift = function(shifts, dispo){
  var dispo_city_shifts = [];
  for (var i = 0; i < shifts.length; i++) {
    var shiftCities = shifts[i].villes;
    //get shift cities
    for (var j = 0; j < shiftCities.length; j++) {
      //get dispo cities
      for (var h = 0; h < dispo.villes.length; h++) {
        console.log('DISPO CITIES ' +dispo.villes[h])
        //compare them
        if( shiftCities[j].toLowerCase() == dispo.villes[h].toLowerCase() ){
          
           console.debug("shift city "+ shiftCities[j] + " shift name "+shifts[i].nom);
          // console.log("dispo city "+ dispo.villes[h]);
          dispo_city_shifts.push(shifts[i])
        }
      };
    };
  };
  return dispo_city_shifts;
}
/*
  returns true if the dispo hours are between the beginning and end of the shift hours.
  Hours are in minutes.
*/
$scope.isDispoBetweenShiftHours = function(dispoStart, dispoEnd, shiftStart, shiftEnd){
  if (parseInt(dispoStart) <= parseInt(shiftStart)
    && parseInt(dispoEnd) >= parseInt(shiftEnd)) {
       return true;
  };
}

/*
  returns array of shifts that can be done within dispoHours time range
*/
$scope.compareDiposHoursAndShift = function(dispoHours, dailyShifts){
   var shifts = [];
   //convert date hours to minutes  => easier to compare
   var dispoStart = moment.duration(dispoHours.start).asMinutes()
   var dispoEnd = moment.duration(dispoHours.end).asMinutes()

    for (var i = 0; i < dailyShifts.length; i++) {
      var shift = dailyShifts[i];
      var shiftStart = moment.duration(moment(shift.debut).format("H:mm")).asMinutes();
      var shiftEnd = moment.duration(moment(shift.fin).format("H:mm")).asMinutes();
      var isBetween = $scope.isDispoBetweenShiftHours(dispoStart, dispoEnd, shiftStart, shiftEnd)
       if (isBetween) {
          shifts.push(shift);
        };     
    };
    return shifts;
}

/*
  get start and end hours and day of a dispo (presence)
*/
 $scope.getDispoHoursAndDay = function(presence){
    var data = {
      start : moment(presence.start).format("H:mm"),
      end : moment(presence.end).format("H:mm"),
      day : new Date(presence.start).getDay()
    }
    return data;
 }
 /*
  highlights the coursiers that work today
 */
$scope.todaysCoursiers = function(){
  var today = moment(new Date()).format("D-M-YYYY")
  $(".colDaySelected, .rowDaySelected").removeClass("colDaySelected rowDaySelected")
  $(".attributedShift").each(function() {
    if( $(this).parent().attr('date') == today ){
       $(this).parent().closest('tr').addClass('rowDaySelected')
    } 
  });
}
 /*
   highlights the coursiers that work today and the colummn of that day
 */
$scope.whoWorksOn = function(day, month, year){
  $(".colDaySelected, .rowDaySelected").removeClass("colDaySelected rowDaySelected")
  var date = new Date(parseInt(year), parseInt(month), parseInt(day))
  var dateCol = moment(new Date(parseInt(year), parseInt(month)-1, parseInt(day)) ).format("D-M-YYYY")
  var workingDay = moment(date).format("D-M-YYYY");

  $(".attributedShift").each(function() {
    if( $(this).parent().attr('date') == workingDay ){
      $("col[date="+dateCol+"]").addClass('colDaySelected');
       $(this).parent().closest('tr').addClass('rowDaySelected')
    } 
    
  });
}
/*
  load all coursiers.
  Callback : load absences and dispos of coursiers
*/
$scope.loadCoursiers = function(){
  $http.get("/api/users").success(function(coursiers){    
    if (typeof $scope.coursiers == 'undefined') {
        $scope.coursiers = coursiers;
        $scope.loadAbsencesAndDispos($scope.coursiers, new Date())
    };    
  })
}
//load shifts and coursiers
shiftService.getShifts(function(shifts){
  $scope.shifts = shifts;
  $scope.loadCoursiers();
})

/*
  load absences and dispos of every coursier 
  into absences[] and presences[] 
*/
$scope.loadAbsencesAndDispos = function(coursiers, date){
  console.debug('load absences')
  console.log(date)
  if (typeof date == 'string' || typeof date =="number") {
    var newDateString = 1+"-"+(parseInt(date)+1)+"-"+$scope.year;
    var newDate = moment(newDateString, "DD-MM-YYYY")
    var moisAnnee = moment(newDate).format("MM-YYYY")
    $scope.monthNum = moment(newDate).month();
  }else{
    var moisAnnee = moment(date).format("MM-YYYY")
    $scope.monthNum = moment(date).month()
  }

  var absences = [];
  var presences = [];
  for (var i = 0; i < coursiers.length; i++) {
     if (coursiers[i].dispos != null) {
      var coursierId = coursiers[i]._id;
     //get the months
     for(var month in coursiers[i].dispos){
        if (month == moisAnnee) {
         var month = coursiers[i].dispos[month]
        //get the weeks
         for(var week in month){
            var day = month[week].dispos;
            //get days with absence or presence
            for (var j = 0; j < day.length; j++) {
              day[j].coursierId = coursierId
              if (day[j].title == "Absent") {
                absences.push(day[j])
              }else{
                presences.push(day[j])
              }
            }//end get days       
         }
      };//end get months
        };

    }
  };//end for
 
  //now we have all the dispos and absences - we can load the calendar
  $scope.renderCalendar($scope.monthNum, $scope.year, absences, presences)
}

/*
  get day name for each day of month
*/
function getDaysArray(year, month) {
      var date = new Date(year, month, 1);
      var result = [];
      while (date.getMonth() == month) {
        result.push(days[date.getDay()]);
        date.setDate(date.getDate()+1);
      }
      return result;
}
//toggle planning between all coursiers and monthly personnal view
$scope.togglePlanning = function(planningAdmin){
  if (planningAdmin) {
     $scope.isAdmin = function(){
      return false;
     } 
     $scope.showButton = true
      $scope.toggleButtonText = "Tous les coursiers"
      $scope.toggleHeaderText = "Mon planning"
  }else{
     $scope.isAdmin = function(){
      return true;
     }
     $scope.showButton = true
      $scope.toggleButtonText = "Mon planning"
      $scope.toggleHeaderText = "Tous les coursiers"
  }
}
$scope.isToday= function(day, month, year){
  var date = new Date(year, month, day)
  var day = moment(date).format("D-M-YYYY")

  if (day == $scope.today) {
    return 'today';
  };
}
$scope.getTimes = function(n){
     return new Array(n);
};
$scope.toggleIsPresent = function(){
  if ($(".present").length > 0) {
    $(".present").removeClass("present").addClass("presentOff");
  }else{
    $(".presentOff").removeClass("presentOff").addClass("present");
  }
}
$scope.toggleNoInfo = function(){
  if ($(".noInfo").length > 0) {
    $(".noInfo").removeClass("noInfo").addClass("noInfoOff");
  }else{
    $(".noInfoOff").removeClass("noInfoOff").addClass("noInfo");
  }
}
/* 
  returns true if the date given has been 
  defined as absent of the coursier (userId)
*/
$scope.isAbsent = function(day, month,year, userId){
 // console.log('is absent')
 if(typeof $scope.absences != 'undefined'){
   var date = new Date(year, month, day+1)
   var day = moment(date).format("D-M-YYYY");
    for (var i = 0; i < $scope.absences.length; i++) {
      var absentDay = moment($scope.absences[i].start).format("D-M-YYYY")
        if (absentDay == day && userId == $scope.absences[i].coursierId) {
          return true
        }
    }
 }//end if
 
}
/* 
  returns true if the date given has been 
  defined as dispo of the coursier (userId)
*/

$scope.isPresent = function(day, month,year, userId){
  //console.log('is present')
  if (typeof $scope.presences != 'undefined') {
    var date = new Date(year, month, day+1)
    var day = moment(date).format("D-M-YYYY");
     for (var i = 0; i < $scope.presences.length; i++) {
      var presentDay = moment($scope.presences[i].start).format("D-M-YYYY")
        if (presentDay == day && userId == $scope.presences[i].coursierId) {
          return true
        }
    }
  };
}
function todayAndWeekndConflict () {
  console.log($(".di").length)
}


/*
  Returns the day of the week of the given date
  1 = monday, 2 = tuesday...
*/
$scope.getDayOfWeek = function(day, month, year){
  var date = new Date(parseInt(year), month, day+1)
  var dayId = date.getDay();
  return dayId;
}

  })
  .filter('range', function() {
    return function(input, total) {
      total = parseInt(total);
      for (var i=0; i<total; i++)
        input.push(i);
      return input;
    };


  })
  .directive('elem', function(){
    return {
        // link: function(scope, elm){
        //   elm.parent().removeClass('present').addClass('absent')
        // }
    }
});
