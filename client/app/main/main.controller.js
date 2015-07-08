'use strict';

angular.module('velociteScheduleApp')
  .controller('MainCtrl', function ($modal,$state, $scope, $http, User, calendarService, AttributionsService, shiftService, Auth) {
    
    var date = new Date();
    var days = calendarService.getDays() // lu ma me...
    var months = calendarService.getMonths()// jan fev mars...

    $scope.monthNum = date.getMonth();
    $scope.year = date.getFullYear();
    $scope.today = moment(new Date()).format("D-M-YYYY")
    $scope.monthYear = moment(new Date()).format("MM-YYYY")
    $scope.cities = ["Lausanne", "Yverdon", "Neuchâtel"]
    $scope.coursiers;
    $scope.shifts;
    $scope.isAdmin = Auth.isAdmin; //to show or not to show the first planning
    $scope.currentUser = Auth.getCurrentUser()
    $scope.presences;
    $scope.dispos;
    $scope.collapseManques = false;
    $scope.loading = true;
    $scope.shiftSources = [];
    $scope.alreadySeen = [];

$(document).ready(function () {

  $("body").on('click','.cityManquesHeader',function(){
     $(this).next('tr').slideToggle('fast')
  });

  $(document).keyup(function(e) {
    //when escaping attribution popover with "annuler"
     if (e.keyCode == 27) { // escape key maps to keycode `27`
        $(".colDaySelected").removeClass('colDaySelected')
    }
  });

  $('#fullCal').fullCalendar({
        height: 620,
        width:400,
        aspectRatio: 0.4,
        firstDay: 1, //monday
        editable: false,
        allDaySlot: false,
        minTime: "06:00:00", 
        maxTime: "21:00:00",
        lang : 'fr',
        header: {
          left: 'month agendaWeek',
          center: 'title',
          right: 'today prev,next'
        },
        eventAfterRender: function(evento, element) {
          var new_description = '<div>Shift: <b>'+evento.title+'</b></div>' +
             'de <strong>'+moment(evento.start).format("HH:mm")+"</strong> à <strong>"
             +moment(evento.end).format("HH:mm")+"</strong>"+
             '</br> Ville: <strong>' + evento.ville +"</strong>";
              element.empty().append(new_description);
        },//end eventrender
        viewRender: function(view, element) {
          var monthYear = moment(view.calendar.getDate()).format("MM-YYYY");
          //if didn't  see this month yet, download the attributions to cal
          if ($.inArray(monthYear, $scope.alreadySeen) == -1) {
            $scope.alreadySeen.push(monthYear)
                $http.get('api/attributions').success(function(attributions){
                  $scope.attributions = attributions
                   if ($scope.attributions.length == 0) {
                   return;
                 }
                 AttributionsService.getMyMonthlyShifts($scope.currentUser._id, monthYear, $scope.attributions, function (myShifts) {
                      AttributionsService.formatShiftsForCalendar(myShifts, function(formatedShifts){     
                      $('#fullCal').fullCalendar('addEventSource', formatedShifts); 
                      $("#calendar").fullCalendar('renderEvents');
                      console.debug($scope.attributions);
                      })
                  })//monthlyShifts
                })//get
          };//if       
        }//viewRender
    })
})


//render calendar on month or year change
$scope.renderCalendar = function(month, year){

  //$("").removeClass("Lausanne Neuchâtel Yverdon colDaySelected rowDaySelected")
  //$("").removeClass("absent present noInfoOff presentOff")
  console.debug('render calendar')
  //if year == null, only month has changed -> load only dispos of this month
  if (year == null) {
   // $(".attributedShift").addClass('toEmpty')
  //  $(".Lausanne, .Neuchâtel, .Yverdon, colDaySelected, .rowDaySelected, .absent, .present, .noInfoOff, .presentOff").addClass('toRemove');
    $scope.monthYear = moment(1+"-"+(month+1)+"-"+$scope.year,"D-M-YYYY").format("MM-YYYY")
    year = $scope.year
    $scope.loadAbsencesAndDispos($scope.coursiers, month)
  }else{
    $scope.monthYear = moment(1+"-"+($scope.monthNum+1)+"-"+year,"D-M-YYYY").format("MM-YYYY")
  }

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
  var shiftsSat = [];
  var allShifts = []

  if( typeof $scope.shifts == 'undefined'){
    shiftService.getShifts(function(shifts){
      for (var i = 0; i < shifts.length; i++) {
        for (var j = 0; j < shifts[i].jours.length; j++) {
          var jour = shifts[i].jours[j].id
          var shift = {   shiftID : shifts[i]._id,
                          nom :shifts[i].nom, 
                          times: shifts[i].jours[j].times, 
                          ville: shifts[i].villes[0], _id:shifts[i]._id,
                          competences : shifts[i].competences,
                          debut : shifts[i].debut, 
                          fin: shifts[i].fin, 
                          jours : shifts[i].jours,
                          remarques : shifts[i].remarques
                       }
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
          allShifts.push(shift)

      };
       var shiftsJour = [shiftsMon, shiftsTue, shiftsWed, shiftsTh, shiftsFr, shiftsSat, allShifts]
       $scope.dailyShifts = shiftsJour;
    });
  }
}
$scope.orderShiftsByDay();


/*
  show, by day, who could possibly do the shift.
  Green -> is able, is present and nbshifts/week ok
  Orange -> is able, present but nbshifts/week not ok
  Gray -> is not able but present,
  Red -> is not able, not present, not ok...
  Calls -> sortPotentialCoursiers()
*/
$scope.showPotentialCoursiers = function(day,month,year, shift, event){
  $(".lowDispo, .mediumDispo, .highDispo, .busy, .shiftManqueDaySelected").removeClass("lowDispo mediumDispo highDispo busy shiftManqueDaySelected"). addClass('noBg')
  $(event.target).addClass('shiftManqueDaySelected')
  var date = moment(new Date(year, month, day)).format("D-M-YYYY");
  var arePresentDispos = [];
 //get every one on dispo on that day
  for (var i =  $scope.presences.length - 1; i >= 0; i--) {
      var presenceDate = moment($scope.presences[i].start).format("D-M-YYYY");
      if (presenceDate == date) {
          arePresentDispos.push($scope.presences[i])
      };
  };
  $('td.presentOff').each( function(){
    var attributedShifts = $(this).attr('shiftsAttributed');
    var shiftsLeft = $(this).attr('shiftsLeft');
    var shiftsWanted = $(this).attr('shiftsWanted');
    var cellCoursierId = $(this).attr('coursierid');
    var cellCoursierName = $(this).attr('coursierName');
    var cellDate = $(this).attr('date');
     //get the cells (colummn) of the selected day
    if (cellDate == date) {
      if (cellCoursierId) {
        $scope.sortPotentialCoursiers(cellCoursierId, shiftsLeft, shiftsWanted, attributedShifts, date, shift, arePresentDispos, $(this), cellCoursierName )
   
      };
     };
  })
}
/*
  called in showPotentialCoursiers()
*/
$scope.sortPotentialCoursiers = function(coursierId, shiftsLeft, shiftsWanted, attributedShifts, date, shift, arePresentDispos, cell, cellCoursierName){
    var cell = { this : cell, attributedShifts : attributedShifts, shiftsLeft : shiftsLeft, shiftsWanted : shiftsWanted, coursierId :coursierId, coursierName: cellCoursierName}
    //convert to minutes
    var shiftStart = moment.duration( moment(shift.debut).format("H:mm")).asMinutes()
    var shiftEnd =  moment.duration( moment(shift.fin).format("H:mm")).asMinutes()
    var coursiers = $scope.coursiers
    //get the present coursier
    for (var i = coursiers.length - 1; i >= 0; i--) {
      for (var j = arePresentDispos.length - 1; j >= 0; j--) {
         if(arePresentDispos[j].coursierId == coursiers[i]._id){
           var coursier = coursiers[i];
           //get the present date == cell date
           if (cell.coursierId == coursier._id) {
              //convert to minutes
              var dispoStart = moment.duration(moment(arePresentDispos[j].start).format("H:mm")).asMinutes()
              var dispoEnd = moment.duration(moment(arePresentDispos[j].end).format("H:mm")).asMinutes()
              var isBetweenHours = $scope.isDispoBetweenShiftHours(dispoStart, dispoEnd, shiftStart, shiftEnd);
              var isInCity = arePresentDispos[j].villes.indexOf(shift.ville)
              var isBusy = parseInt(attributedShifts)>parseInt(shiftsWanted) || parseInt(attributedShifts)==parseInt(shiftsWanted)
              //console.debug(coursier.name,'shiftsWanted'+shiftsWanted, 'shiftsAttributed', attributedShifts, 'shiftsLeft',shiftsLeft);
              // console.debug('too much', parseInt(attributedShifts)>parseInt(shiftsWanted));
              // console.debug('equals', parseInt(attributedShifts)==parseInt(shiftsWanted);
              var isCapable = shiftService.containsAll(shift.competences, coursier.competences)
             // console.debug(shift.nom, "shift start ", moment(shift.debut).format("H:mm"), "shift end "+moment(shift.fin).format("H:mm"));

          //  console.debug(coursier.name, 'isDispo->'+isBetweenHours, "isCapable->"+isCapable, "isBusy->"+isBusy, "isInCity->"+isInCity);
            // console.debug(date, "iscapable->"+isCapable, "isbusy->"+isBusy, "isInCity->"+isInCity, "isBetween->"+isBetweenHours, coursier.name);
              //everything ok, green
              if (isCapable && isBetweenHours && (isInCity != -1) && !isBusy) {
                cell.this.addClass('highDispo')
              //can but is busy, blue
              }else if(isCapable && isBetweenHours && (isInCity != -1) && isBusy){
                console.debug('ok but busy...'+ cell.coursierName);
                cell.this.addClass('mediumDispo')
              //cant but is available, orange
              }else if(!isCapable && isBetweenHours && (isInCity != -1) && !isBusy){
                cell.this.addClass('lowDispo')
              //cant, is busy, but is hours and city is ok
              }else if(!isCapable && isBetweenHours && (isInCity != -1) && isBusy){
                cell.this.addClass('busy');
              }
           };
         }
      }; 
    };
  }

$scope.getAttributedShifts = function(day, month,year, userId){
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
  var day_shifts = $scope.dailyShifts[dayOfWeek-1]

  //check if the day clicked is an dispo present day
  for (var i = 0; i < $scope.presences.length; i++) {
    var dispoDay = moment($scope.presences[i].start).format("D-M-YYYY")
    //if yes, check the presence user id and the cell of user clicked
    if (dispoDay == day) {
        //then get all the shifts that fit into this coursier's time range
        if($scope.presences[i].coursierId == user._id){
          var dispo = $scope.presences[i];
          var dispoHours = $scope.getDispoHoursAndDay(dispo);
          console.log("DISPO HOURS "+dispoHours.start, dispoHours.end)
 
          var time_shifts = $scope.compareDiposHoursAndShift(dispoHours, day_shifts);
          console.debug('time shifts');
          console.debug(time_shifts);
          // //then sort the shifts by the dispo's and shift's cities
          var time_city_shifts  = $scope.compareDispoCityAndShift(time_shifts,dispo);
           console.debug('time city shifts');
          console.debug(time_city_shifts);
          var time_city_able_shifts = $scope.compareUserAndShift(time_city_shifts, user._id, user.competences); 
        
          //TODOOOOOOOOOOOOOOO check if this shift hasnt been attributed yet
          var time_city_able_notAttributed_shifts = $scope.checkAttributedShifts(time_city_able_shifts)
          //show the select screen, give it the date, found shifts and the complete user.
          $scope.showPopover(time_city_able_shifts, user, date, day_shifts, $scope.shifts);  
        }
    };
  };
}
/*
  returns 
*/
$scope.checkAttributedShifts = function(shifts){

}
$scope.showPopover = function(shifts, coursier, date, dayShifts, allShifts){
  console.debug(date);
  var dateCol = moment(date).subtract(1, 'months')
  var dateCol = moment(dateCol).format('D-M-YYYY')
  $("col[date="+dateCol+"]").addClass('colDaySelected');
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
            attributions : function () {
              return $scope.attributions[0].monthYear
            },
            dayShifts : function () {
               return dayShifts
            },
            allShifts :function(){
              return allShifts
            }
        },
        controller: 'AttribuerShiftCtrl'
    });
 }
/*
  tell if user is permited to do a shift, selected at the creation of shift
*/
$scope.compareUserAndShift = function(shifts, userId, userCompetences){
  var capableShifts = [];

  for (var i = 0; i < shifts.length; i++) {
    //if user has all competences needed for this shift
      var ok = shiftService.containsAll(shifts[i].competences, userCompetences)
      if (ok) {
          var shift = {
            nom : shifts[i].nom, 
            shiftID: shifts[i]._id,
            ville : shifts[i].ville, 
            remarques : shifts[i].remarques,
            debut :shifts[i].debut,
            fin: shifts[i].fin
          }
          capableShifts.push(shift)
      };
  };
  console.log(capableShifts)
  return capableShifts;
}
/*
  returns an array of shifts that have the same city as those
  specified in the dispo. @shifts already are sorted by dispo's time range
  Called in setShift()
*/
$scope.compareDispoCityAndShift = function(shifts, dispo){
  var dispo_city_shifts = [];
  console.debug(shifts);
  for (var i = 0; i < shifts.length; i++) {
    var shiftCity = shifts[i].ville;
      //get dispo cities
      for (var h = 0; h < dispo.villes.length; h++) {
       // console.log('DISPO CITIES ' +dispo.villes[h])
        //compare them
        if( shiftCity.toLowerCase() == dispo.villes[h].toLowerCase() ){
        //   console.debug("shift city "+ shiftCity+ " shift name "+shifts[i].nom);
          // console.log("dispo city "+ dispo.villes[h]);
          dispo_city_shifts.push(shifts[i])
        }
      };
  
  };
  return dispo_city_shifts;
}
/*
  returns true if the dispo hours are between the beginning and end of the shift hours.
  Hours are in minutes.
*/
$scope.isDispoBetweenShiftHours = function(dispoStart, dispoEnd, shiftStart, shiftEnd){
 // console.log("dispo start "+ dispoStart, "dispo end "+ dispoEnd, "shift start "+shiftStart, "shiftend "+shiftEnd);
  if (parseInt(dispoStart) <= parseInt(shiftStart)
    && parseInt(dispoEnd) >= parseInt(shiftEnd)) {
       return true;
  }
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
     // console.debug(isBetween, shift.nom, moment(shift.debut).format("H:mm"), moment(shift.fin).format("H:mm"));
       if (isBetween) {
          shifts.push(shift);
        };     
    };
    return shifts;
}

/*
  get formatted start and end hours and day of a dispo (presence)
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
  highlights the coursiers who work today
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
});

 //update view on attribution passed !!!!!!!!!!!!! -> in coursierDay directive
$scope.$on('attribution', function(event, args) {
     console.debug(args);
     console.debug($scope.attributions[0]);
     console.debug($scope.attributions[0].monthYear);
     console.debug($scope.attributions[0].monthYear[args.monthYear]);
     if (!$scope.attributions[0].monthYear[args.monthYear]) {
        $scope.attributions[0].monthYear[args.monthYear] = {}
     };
     if ($scope.attributions[0].monthYear[args.monthYear][args.day]) {
         $scope.attributions[0].monthYear[args.monthYear][args.day].shifts.push(args.shift)             
     }else{
       $scope.attributions[0].monthYear[args.monthYear][args.day] = {}
       $scope.attributions[0].monthYear[args.monthYear][args.day].shifts = []
       $scope.attributions[0].monthYear[args.monthYear][args.day].shifts.push(args.shift)             
     }
     $scope.$broadcast('attrPassed', {attributions: $scope.attributions[0].monthYear ,monthYear : args.monthYear})
     
  });
/*
  load absences and dispos of every coursier 
  into absences[] and presences[] 
*/
$scope.loadAbsencesAndDispos = function(coursiers, date){
  console.debug('load absences')
  //if date ==  only the month
  if (typeof date == 'string' || typeof date =="number") {
    var newDateString = 1+"-"+(parseInt(date)+1)+"-"+$scope.year;
    var newDate = moment(newDateString, "DD-MM-YYYY")
    var moisAnnee = moment(newDate).format("MM-YYYY")
    $scope.monthNum = moment(newDate).month();
  }else{
    var moisAnnee = moment(date).format("MM-YYYY")
    $scope.monthNum = moment(date).month()
  }
  var presences = [];
  var dispos = []
  for (var i = 0; i < coursiers.length; i++) {
     if (coursiers[i].dispos) {
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
              if (day[j].title == "Dispo") {
                presences.push(day[j])
              }
              dispos.push(day[j])
            }//end get days       
         }
      };//end get months
        };

    }
  };//end for
  $scope.presences = presences;
  $scope.dispos = dispos;
  //now we have all the dispos and absences - we can load the calendar
  $scope.renderCalendar($scope.monthNum, $scope.year, presences, dispos)
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
      $scope.toggleButtonText = "Tous les coursiers"
      $scope.toggleHeaderText = "Mon planning"
  }else{
     $scope.isAdmin = function(){
      return true;
     }
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
$scope.toggleCityDispos = function (city) {
 $(".noInfo, .noInfoOff, .present, .highDispo, .lowDispo, .busy").css("background-color", "")
    if (city == "Lausanne") {
       $(".Yverdon, .Neuchâtel").css("background-color", "")
      if ($(".Lausanne.city-bg-off").length >0 ) {
        $(".Lausanne.city-bg-off").removeClass("city-bg-off").addClass("city-bg-on").css("background-color","#E3F0B1")
      }else{
        $(".Lausanne.city-bg-on").removeClass("city-bg-on").addClass("city-bg-off").css("background-color","")
      }
    }
     else if (city == "Yverdon") {
      $(".Lausanne, .Neuchâtel").css("background-color", "")
      if ($(".Yverdon.city-bg-off").length >0 ) {
        $(".Yverdon.city-bg-off").removeClass("city-bg-off").addClass("city-bg-on").css("background-color","#EEB1F0")
      }else{
        $(".Yverdon.city-bg-on").removeClass("city-bg-on").addClass("city-bg-off").css("background-color","")
      }
    }
     else if (city == "Neuchâtel") {
       $(".Lausanne, .Yverdon").css("background-color", "")
      if ($(".Neuchâtel.city-bg-off").length >0 ) {
        $(".Neuchâtel.city-bg-off").removeClass("city-bg-off").addClass("city-bg-on").css("background-color","#BDCAF2")
      }else{
        $(".Neuchâtel.city-bg-on").removeClass("city-bg-on").addClass("city-bg-off").css("background-color","")
      }
    }
}
$scope.returnAttributions = function(monthYear){
  if ($scope.attributions.length != 0) {
      return $scope.attributions[0].monthYear[monthYear]
    };
}
$scope.toggleBusy = function(){

   if($(".busyOff").length > 0 ) {
      $(".busyOff").removeClass('busyOff').addClass('busy')

   }else{
      $(".busy").removeClass('busy').addClass('busyOff')
   }
}
$scope.toggleLowDispo = function(){
  if($(".lowDispoOff").length > 0 ) {
      $(".lowDispoOff").removeClass('lowDispoOff').addClass('lowDispo')
   }else{
      $(".lowDispo").removeClass('lowDispo').addClass('lowDispoOff')
   }
}
$scope.toggleMediumDispo = function(){
    if($(".mediumDispoOff").length > 0 ) {
      $(".mediumDispoOff").removeClass('mediumDispoOff').addClass('mediumDispo')
   }else{
      $(".mediumDispo").removeClass('mediumDispo').addClass('mediumDispoOff')
   }
}
$scope.toggleHighDispo = function(){
   if($(".highDispoOff").length > 0 ) {
      $(".highDispoOff").removeClass('highDispoOff').addClass('highDispo')
   }else{
      $(".highDispo").removeClass('highDispo').addClass('highDispoOff')
   }
}
$scope.toggleDispoLevelCity = function(city, level){
  //there is a space at the end...
    $("td").removeClass('dispoLevelCityLow dispoLevelCityMedium dispoLevelCityHigh')
    var city = city.substring(0, city.length - 1);
   if (level == 'lowDispo') {
     $("td."+city+"."+level+"Off").addClass('dispoLevelCityLow')
   }else if(level =='mediumDispo'){
     $("td."+city+"."+level+"Off").addClass('dispoLevelCityMedium')

   }else if(level =='highDispo'){
     $("td."+city+"."+level+"Off").addClass('dispoLevelCityHigh')
    }
}
$scope.offClasses = function (){
  $('.Lausanne, .Yverdon, .Neuchâtel').css("background-color","")
  $(".lowDispo, .mediumDispo, .highDispo, .busy, .shiftManqueDaySelected").removeClass("lowDispo mediumDispo highDispo busy shiftManqueDaySelected")
 
}
/* 
  checks if the date given has been 
  defined as dispo of the coursier (userId);
  if it is, returns the dispo cities
  //TODO -> INPUT REFRESH ON ATTR + DOUBLONS + MANQUES   
*/

$scope.checkDispo = function(day, month,year, userId){
  if (typeof $scope.dispos != 'undefined') {
    var date = new Date(year, month, day)
    var dispos = $scope.dispos
    var day = moment(date).format("D-M-YYYY");
     for (var i = dispos.length - 1; i >= 0; i--) {
       var presentDay = moment(dispos[i].start).format("D-M-YYYY");
        if (presentDay == day && userId == dispos[i].coursierId) {
            if(typeof dispos[i].villes != 'undefined' ) {
              var villes = dispos[i].villes
            }else{
              var villes = [];
            }
              var dispo = {type: dispos[i].title, villes: villes }
        }
     };
     return dispo;
  };
}

})
.directive('manquesCity', function($compile){
    return {
      scope: {
        day : "=",
        dayOfWeek : "=",
        monthNum : "=",
        year : "=",
        dailyShifts : "=",
        city : "=",
        monthYear : "=",
        attributions: "=",
        showPotentialCoursiers: "="
      },
      link: function  (scope, elem, attrs) {
        
        //scope.dayOfWeek = scope.getDayOfWeek(scope.day, scope.monthNum, scope.year)
        /*
          checks if shift has already been attributed and how many times
          => manques par ville + nb de fois
          Returns 'enough' if times attributed == times needed
          Returns object with name and left attributions needed if not.
        */
        scope.isAttributedShift = function (shift, day, month, year, attributions) {
          console.debug('is attr shift in manques city');
          console.debug('attributions in the funciton->', attributions);
            var day = moment(new Date(parseInt(year), parseInt(month), parseInt(day+1) ) ).format("D");
            console.debug('the day '+day);
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
                })
               console.debug('checked shifts for '+ moment(date).format('D-M-YYYY'));
               console.debug(scope.checkedShifts);
          }; 
          
        }
        //update view on attribution passed !!!!!!!!!!!!!
         scope.$on("attrPassed", function(e, args){
          console.debug('attr passed in manques!');
          var date = new Date(parseInt(scope.year), scope.monthNum, scope.day+1)
          var dayOfWeek = date.getDay();
          scope.attributions = args.attributions[args.monthYear]
          scope.checkShifts(dayOfWeek, scope.day,  scope.monthNum, scope.year, scope.attributions)
         })
        //WATCH MONTH and re render changes
         scope.$watch("monthNum",function(newMonth,oldValue) {
            var date = new Date(parseInt(scope.year), newMonth, scope.day+1)
            var dayOfWeek = date.getDay();
              scope.checkShifts(dayOfWeek, scope.day, newMonth, scope.year, scope.attributions)
      
          });
         //WATCH YEARand re render changes
         scope.$watch("year",function(newYear,oldValue) {
            var date = new Date(parseInt(newYear), scope.monthNum, scope.day+1)
            var dayOfWeek = date.getDay();
             scope.checkShifts(dayOfWeek,scope.day, scope.monthNum, newYear,scope.attributions)
          });
         //others
         elem.addClass('manquesCell');
      },       
    template: '<p ng-repeat="daShift in checkedShifts" ng-click ="showPotentialCoursiers(day+1, monthNum, year, daShift, $event)" ng-class="daShift.enough==true ? \'bg-success\':\'bg-danger\'" ' 
   + '  class="shiftsByCity"> '
   +' {{daShift.ville == city ? (daShift.enough === true ? daShift.nom : daShift.nom+"("+daShift.timesLeft+")") : null}}</p>  '
  }
})
  .directive('coursierDay', function  ($compile) {
    return{
      transclude: true,
      scope : {
        year : "=",
        day : "=",
        monthNum : "=",
        checkDispo : "=",
        user: "=",
        attributions : "=",
        monthYear : "="
      },
      link : function  (scope, elem, attrs) {
        scope.addDispoMonthChange = function (newMonth) {
          elem.attr("date", (scope.day)+"-"+(newMonth+1)+"-"+scope.year )  
          var dispo = scope.checkDispo(scope.day, newMonth, scope.year, scope.user._id) 
           elem.removeClass("presentOff present absent city-bg-off city-bg-on noInfo noInfoOff Lausanne Yverdon Neuchâtel")
              if(dispo){
                if (dispo.type =="Dispo") {
                   elem.attr("ng-click", "setShift($index+1, monthNum, year, user)")
                   elem.addClass("presentOff")
                  if (dispo.villes) {
                    $.each(dispo.villes, function  (i, ville) {
                       elem.addClass(ville)
                       elem.addClass("city-bg-off")
                    })
                  }
                }else{
                   elem.addClass("absent")
                   $(".absent").removeClass('highDispo mediumDispo lowDispo busy')
                  }
              }else{
                 elem.addClass("noInfoOff")
              }
        }
        scope.addDispoYearChange = function  (newYear) {
          elem.removeClass("presentOff present absent city-bg-off city-bg-on noInfo noInfoOff Lausanne Yverdon Neuchâtel")
          elem.attr("date", (scope.day)+"-"+(scope.monthNum+1)+"-"+newYear)  
           var dispo = scope.checkDispo(scope.day, (scope.monthNum), newYear, scope.user._id) 
              if(dispo){
                if (dispo.type =="Dispo") {
                   elem.addClass("presentOff")
                  if (dispo.villes) {
                    $.each(dispo.villes, function  (i, ville) {
                       elem.addClass(ville+" city-bg-off")
                    })
                  }
                }else{
                   elem.addClass("absent")
                }
              }else{
                 elem.addClass("noInfoOff")
              }
        } 
        scope.getAttrShifts = function (attributions, monthYear){
         if (attributions) {
             if (attributions[scope.day]) {           
              var daShifts = []
              $.each(attributions[scope.day].shifts, function(i, shift){
                 if (shift.coursierAttributed._id  == scope.user._id) {
                      daShifts.push(shift);  
                  }
                })
                scope.daShifts = daShifts;        
            };
          };  
        }
        /*
          checks if the number of shifts/week has been exceeded
        */
        scope.checkShiftsPerWeek = function(dayOfWeek, day, month, year){
           var date = new Date(year, month, day)
            var monthYear = moment(date).format("MM-YYYY");
            var startWeek = moment(date).startOf('week')._d
            var endWeek = moment(date).endOf('week')._d
            var day = moment(date).format("D");
            elem.removeAttr('shiftsAttributed shiftsLeft shiftsWanted coursierId coursierName')
            for(var month in scope.user.dispos){
              if (monthYear == month) {
                for(var week in scope.user.dispos[month]){
                   var aDay = scope.user.dispos[month][week].dispos[0].start;
                   var startWeekDay = moment(aDay).startOf('week')._d
                  //if its during the week you clicked, get the weekly shifts of that week
                  if (moment(startWeekDay).isSame(startWeek)) {
                    var shiftsPerWeek = scope.user.dispos[month][week].shiftsWeek;
                    var attributed = scope.getNumberOfAttributedShifts(scope.user._id, monthYear, startWeek, endWeek)
                    scope.setDispoBGInfo(startWeek, endWeek, shiftsPerWeek, attributed,moment(date)._d)
                  };
                }
              };
            }
        }
        /*
          thanks to te gb color, tell the user how many shifts approx. are left for attribution
          or if it has already been exceeded
        */
        scope.setDispoBGInfo = function(startWeek, endWeek, wantedShifts, attributedShifts, date){
          if (moment(startWeek).isBefore(date) || moment(startWeek).isSame(date) ) {
            if (moment(date).isBefore(endWeek) || moment(date).isSame(endWeek)) {
              //set bg from mon till saturday
              if (date.getDay()  < 7 &&  date.getDay() >0) {  
                var shiftsLeft = (wantedShifts-attributedShifts)
                    if (attributedShifts>wantedShifts || attributedShifts == wantedShifts) {
                      elem.addClass("busyOff")
                    }else if( shiftsLeft <= 3 ){
                      elem.addClass("lowDispoOff")
                    }else if(shiftsLeft >=4 && shiftsLeft <=7){
                      elem.addClass("mediumDispoOff")
                    }else if(shiftsLeft >=8){
                      elem.addClass("highDispoOff")
                    }
                  $(".absent").removeClass('highDispo mediumDispo lowDispo busy')
                  elem.attr('shiftsAttributed', attributedShifts)
                  elem.attr('shiftsLeft', shiftsLeft)
                  elem.attr('shiftsWanted', wantedShifts)
                  elem.attr('coursierId', scope.user._id)
                  elem.attr('coursierName', scope.user.name)
              };          
            };
          };
        }
        /*
            gets the number of already attributed shifts to the coursier
            for the given week. 
        */

        scope.getNumberOfAttributedShifts = function (coursierId, monthYear, startWeek, endWeek) {
            var attributed = 0;
            var startDay = parseInt(moment(startWeek).format("D"));
            var endDay = parseInt(moment(endWeek).format("D"));
            var startMonth = moment(startWeek).month()
            var endMonth =  moment(endWeek).month()
            var currentMonth =  scope.monthNum;
            //use only days within the month and not from the previous or next !
            if (startDay > endDay && startMonth < endMonth && endMonth == currentMonth ) {
              startDay = 1;
            }
            else if (startDay > endDay && startMonth < endMonth && startMonth == currentMonth){
              endDay = moment(startWeek).daysInMonth()             
            };
            // console.debug(startDay, endDay); 
            for(var day in  scope.attributions){
              //look for shifts during that week and count        
              if (day >=startDay && day <=endDay ) {
                 var shifts = scope.attributions[day].shifts;
                 for (var i = shifts.length - 1; i >= 0; i--) {
                   if(shifts[i].coursierAttributed._id == coursierId){
                    attributed++;
                   }
                 };
              };        
            }     
            return attributed
        }

        //update view on attribution passed !!!!!!!!!!!!!
         scope.$on("attrPassed", function(e, args){
          //set for the first attribution
          if (!scope.attributions) {
            scope.attributions = {}
          };
          if (!scope.attributions[args.monthYear]) {
            scope.attributions[args.monthYear] = {}
          };
          scope.attributions[args.monthYear]  = args.attributions[args.monthYear]
          scope.getAttrShifts(scope.attributions[args.monthYear], args.monthYear)
          scope.checkShiftsPerWeek(null, scope.day, scope.monthNum, scope.year)
         })
        //WATCH MONTH
         scope.$watch("monthNum",function(newMonth,oldValue) {
          elem.removeClass('lowDispo mediumDispo highDispo lowDispoOff mediumDispoOff highDispoOff busy busyOff')
             var date = new Date(parseInt(scope.year), newMonth, scope.day)
             var dayOfWeek = date.getDay();
             var monthYear = moment(1+"-"+(newMonth+1)+"-"+scope.year, "D-M-YYYY").format("MM-YYYY")
             scope.addDispoMonthChange(newMonth);
             scope.getAttrShifts(scope.attributions, monthYear)
             scope.checkShiftsPerWeek(dayOfWeek,scope.day,  newMonth, scope.year)
          });
         //WATCH YEAR
         scope.$watch("year",function(newYear,oldValue) {
           elem.removeClass('lowDispo mediumDispo highDispo lowDispoOff mediumDispoOff highDispoOff busy busyOff')
            var date = new Date(parseInt(newYear), scope.monthNum, scope.day)
            var dayOfWeek = date.getDay();
            var monthYear = moment(1+"-"+(scope.monthNum+1)+"-"+newYear,  "D-M-YYYY").format("MM-YYYY")
            scope.addDispoYearChange(newYear)
            scope.getAttrShifts(scope.attributions, monthYear)
            scope.checkShiftsPerWeek(dayOfWeek, scope.day, scope.monthNum, newYear )
          });
          elem.addClass("coursierDay");
              
      },//link
      template:'<span ng-repeat="shift in daShifts track by $index" ng-class="daShifts != null ? \'attributedShift\' : \'\'  "  '
              +' popover="Remarques:{{shift.competences}} {{shift.remarques}} A {{shift.ville}} de {{shift.debut | date : \'H:mm\'}} à  {{shift.fin | date : \'H:mm\'}}" '
              +'   popover-placement="top"  '
              +'  popover-trigger="mouseenter">'+
            '{{shift.nom}}{{$last ? "" : "+"}}</span>'
    }
  })
.directive('doublons', function  () {
    return{
      transclude: true,
      scope : {
        year : "=",
        day : "=",
        monthNum : "=",
        dailyShifts : "=",
        attributions : "=",
        monthYear : "="
      },
      link : function  (scope, elem, attrs) {
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
              console.debug(day, shift.nom, times, shift.times, shift);
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
        //WATCH MONTH and re render changes
         scope.$watch("monthNum",function(newMonth,oldValue) {
           scope.checkShifts(scope.day, newMonth, scope.year, scope.attributions)
          });
         //WATCH YEARand re render changes
         scope.$watch("year",function(newYear,oldValue) {
            scope.checkShifts(scope.day, scope.monthNum, newYear, scope.attributions)
         });
     }, 
      template:'<span class="shiftsDoubles" ng-class="shift.invalidDay === true ? \'bg-warning\': \'\' " ng-repeat="shift in doubleShifts">{{shift.timesLeft>1 ? shift.nom+"("+shift.timesLeft+")" : shift.nom}}</span>'

    }
})
