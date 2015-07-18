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
      $scope.cities = shiftService.getCities()
      $scope.isAdmin = Auth.isAdmin; //to show or not to show the first planning
      $scope.currentUser = Auth.getCurrentUser()
      $scope.loading = true;
      $scope.toggleAll = true;
      $scope.shiftSources = [];
      $scope.alreadySeen = [];

  $(document).ready(function () {
    $("body").on('click','.cityManquesHeader',function(){
      console.debug('asds');
       $(this).next('tr').slideToggle('fast')
    });

    $(document).keyup(function(e) {
      //when escaping attribution popover with "annuler"
       if (e.keyCode == 27) { // escape key maps to keycode `27`
          $(".colDaySelected").removeClass('colDaySelected')
      }
    });
    setTimeout(function(){
      // $('.planning.shifts').floatThead({
      //   scrollContainer: function($table){
      //     return  $table.closest('.wrapper');
      //   }
      // });
    // var coursierShifts = $('.planning.shifts').DataTable( {
    //       "scrollY": "300px",
    //       "scrollX": "100%",
    //       "scrollCollapse": true,
    //        "paging": false,
    //        bFilter: false, 
    //        bInfo: false,
    //        bSort : false
    
    //   } );
    //   new $.fn.dataTable.FixedColumns( coursierShifts );

    },1500)

    //because angular-fullcalendar was so sloooooow....
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
                        //$("#calendar").fullCalendar('render');
                        })
                    })//monthlyShifts
                  })//get
            };//if       
          }//viewRender
      })
  })


  //render calendar on month or year change
  $scope.renderCalendar = function(month, year){
    var dateStart = new Date(year, month, 1)//1st of the month
    var dateEnd =  new Date(year, month+1, 0) //last day of the month
    //show the only coursiers that were active during that moment!
      // for (var i = $scope.coursiers.length - 1; i >= 0; i--) {
      //     if ( moment(dateStart, "MM-YYYY").isAfter( moment($scope.coursiers[i].createdOn), "MM-YYYY") ) {
      //       console.debug('is  before');
      //       console.debug(dateStart);
      //       console.debug($scope.coursiers[i].createdOn, $scope.coursiers[i].name);
      //       delete $scope.coursiers[i]
      //     };
      // };

    //if year == null, only month has changed -> load only dispos of this month
    if (year == null) {
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
    if( typeof shifts == 'undefined'){
      shiftService.getShifts(function(shifts){
        for (var i = 0; i < shifts.length; i++) {
          for (var j = 0; j < shifts[i].jours.length; j++) {
            var jour = shifts[i].jours[j].id
            var shift = {   
                            shiftID : shifts[i]._id,
                            nom :shifts[i].nom, 
                            times: shifts[i].jours[j].times, 
                            ville: shifts[i].ville, 
                            _id: shifts[i]._id,
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
    Blue -> is able, present but nbshifts/week not ok
    Orange -> is not able but present,
    Gray -> is not able, not present, not ok...
    Calls -> sortPotentialCoursiers()
  */
  $scope.showPotentialCoursiers = function(day,month,year, shift, event){
    $(".lowDispo, .mediumDispo, .highDispo, .busy, .shiftManqueDaySelected").removeClass("lowDispo mediumDispo highDispo busy shiftManqueDaySelected"). addClass('noBg')
    $(event.target).addClass('shiftManqueDaySelected')
    var date = moment(new Date(year, month, day)).format("D-M-YYYY");
    var theDay = moment(new Date(year, month, day)).format("D")
    $scope.preselectedShift = shift;
    $scope.preselectedDate = date;
    var arePresentDispos = [];
    //get every one on dispo on that day
    for(var day in $scope.lesPresences){
      if (day == theDay) {
        arePresentDispos = $scope.lesPresences[day]
      };
    }
    $('td.coursierDay').each( function(){
      var attributedShifts = $(this).attr('shiftsAttributed');
      var shiftsLeft = $(this).attr('shiftsLeft');
      var shiftsWanted = $(this).attr('shiftsWanted');
      var cellCoursierId = $(this).attr('coursierid');
      var cellDate = $(this).attr('date');
       //get the cells (colummn) of the selected day
      if (cellDate == date) {
        if (cellCoursierId) {
          $scope.sortPotentialCoursiers(cellCoursierId, shiftsLeft, shiftsWanted, attributedShifts, date, shift, arePresentDispos, $(this) )
        };
       };
    })
  }
  /*
    highlights the coursiers that could be potentially chosen to do a shift
    called in showPotentialCoursiers()
  */
  $scope.sortPotentialCoursiers = function(coursierId, shiftsLeft, shiftsWanted, attributedShifts, date, shift, arePresentDispos, cell){
      var cell = { this : cell, attributedShifts : attributedShifts, shiftsLeft : shiftsLeft, shiftsWanted : shiftsWanted, coursierId :coursierId}
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
                var isCapable = shiftService.containsAll(shift.competences, coursier.competences)
                //everything ok, green
                if (isCapable && isBetweenHours && (isInCity != -1) && !isBusy) {
                  cell.this.addClass('highDispo')
                //can but is busy, blue
                }else if(isCapable && isBetweenHours && (isInCity != -1) && isBusy){
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
  /*
      gets the user attributed shifts + the shifts that haven't
      been attributed enough times on that day-> will be shown in the selection menu
  */
  $scope.getAttributedShifts = function (attributions, date, coursierId){
      var day = moment(date).format("D");
      var coursierShifts = [];
      var attrShiftsDay = []
      var enoughAttr = []
      var dayId = date.getDay()
      var dayShifts = $scope.dailyShifts[dayId-1];
      var dayShift = {}
      var countShift = {}
      //get how many times a shift has to be done on that day
      for(var theShift in dayShifts){
        var currenShift = dayShifts[theShift];  
        for (var i = currenShift.jours.length - 1; i >= 0; i--) {
          if(currenShift.jours[i].id == dayId){
            dayShift[currenShift.nom] = currenShift
            dayShift[currenShift.nom].times = currenShift.jours[i].times
          }
        };
      }
     //all attributed shifts on that day + of the coursier 
     if(attributions) {
         if (attributions[day]) {        
          var dailyAttr = attributions[day].shifts
          $.each(attributions[day].shifts, function(i, shift){
             if (shift.coursierAttributed._id  == coursierId) {
                coursierShifts.push(shift);  
              }
            })                     
        };
       }; 
      //check the shifts that are attributed enough times
      if (dailyAttr){ 
        for (var i = dailyAttr.length - 1; i >= 0; i--) {
          if (!countShift[dailyAttr[i].nom]) {
            countShift[dailyAttr[i].nom] = 0
          }
          countShift[dailyAttr[i].nom]++
        };
       $.each(dayShift, function(shift, count){
          if (dayShift[shift] && dayShift[shift].times <= countShift[shift]) {
            enoughAttr.push(dayShift[shift])
          };
       })
      }
      var shifts = {coursierShifts: coursierShifts, enoughAttr: enoughAttr}
      return shifts; 
     
    }

  /*
    Shows a list of sorted out shifts with corresponding
    hours, cities and capabilities of coursier.
  */
  $scope.setShift = function(day, month,year, user, event){
    if (Auth.isAdmin()) {
    var date = new Date(year, month, day)
    var day =  moment(date).format("D")
    var dayOfWeek = moment(date).day()
    var day_shifts = $scope.dailyShifts[dayOfWeek-1]
    var presences = $scope.lesPresences
    var attributedShifts  = $scope.getAttributedShifts($scope.attributions[0].monthYear[$scope.monthYear], date, user._id)
    //there are no presences sent yet
    if(Object.keys(presences).length == 0){
       $scope.showPopover(null, user, date, null, attributedShifts, event);  
       return;  
    }
   var index = 0;
   var max = Object.keys(presences).length 
    //check if the day clicked is an dispo present day
    for(var theDay in presences){
      index++;
      if (theDay == day) {
        console.log(theDay, day)
        for (var i =  presences[day].length - 1; i >= 0; i--) {
          console.log(i)
          var dispo = presences[day][i]
          if(dispo.coursierId == user._id){
            var dispoHours = $scope.getDispoHoursAndDay(dispo);
            var time_shifts = $scope.compareDiposHoursAndShift(dispoHours, day_shifts);
            var time_city_shifts  = $scope.compareDispoCityAndShift(time_shifts, dispo);
            var time_city_able_shifts = $scope.compareUserAndShift(time_city_shifts, user._id, user.competences); 
            //Get attributed shifts for that coursier on that day
            //show the select screen, give it the date, found shifts and the complete user.
            $scope.showPopover(time_city_able_shifts, user, date, day_shifts, attributedShifts, event);  
            return;
          //no dispo found!
          }else if (i == 0){
                   console.log('afte')
            $scope.showPopover(null, user, date, null, attributedShifts, event);  
            return;  
        }
      };
    }else if(index == max){
        $scope.showPopover(null, user, date, null, attributedShifts, event);  
            return;   
    }
  }
      //  var day = moment(date).format("D-M-YYYY");
    // for (var i = 0; i < $scope.presences.length; i++) {
    //   var dispoDay = moment($scope.presences[i].start).format("D-M-YYYY")
    //   //if yes, check the presence user id and the cell of user clicked
    //   if (dispoDay == day && $scope.presences[i].coursierId == user._id) {
    //       //then get all the shifts that fit into this coursier's time range
    //         var dispo = $scope.presences[i];
    //         var dispoHours = $scope.getDispoHoursAndDay(dispo);
    //         var time_shifts = $scope.compareDiposHoursAndShift(dispoHours, day_shifts);
    //         var time_city_shifts  = $scope.compareDispoCityAndShift(time_shifts, dispo);
    //         var time_city_able_shifts = $scope.compareUserAndShift(time_city_shifts, user._id, user.competences); 
    //         //Get attributed shifts for that coursier on that day
    //         //show the select screen, give it the date, found shifts and the complete user.
    //         $scope.showPopover(time_city_able_shifts, user, date, day_shifts, attributedShifts, event);  
    //         return;
    //       // no dispo found
    //   }else if (i == $scope.presences.length-1){
    //          $scope.showPopover(null, user, date, null, attributedShifts, event);  
    //          return;  
    //       } 
    // };

  };//isAdmin

  }
  $scope.showPopover = function(shifts, coursier, date, dayShifts,attributedShifts, event){
    var dateCol = moment(date).subtract(1, 'months')
    var dateCol = moment(dateCol).format('D-M-YYYY')
    $("col[date="+dateCol+"]").addClass('colDaySelected');
    $modal.open({
          templateUrl: "app/main/setShiftModal.html",
          animation: false,
          backdrop: false,
          size: "sm",
          windowClass: "modalWindow",
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
              event: function(){
                return event;
              },
              attributions : function () {
                return $scope.attributions[0].monthYear
              },
              dayShifts : function () {
                 return dayShifts
              },
              allShifts :function(){
                return $scope.shifts
              },
              preselectedShift : function(){
                return $scope.preselectedShift
              },
              preselectedDate : function(){
                return $scope.preselectedDate
              },
              attributedShifts : function(){
                  return attributedShifts
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
              _id: shifts[i]._id,
              ville : shifts[i].ville, 
              jours : shifts[i].jours,
              remarques : shifts[i].remarques,
              debut :shifts[i].debut,
              fin: shifts[i].fin
            }
            capableShifts.push(shift)
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
      var shiftCity = shifts[i].ville;
        //get dispo cities
        for (var h = 0; h < dispo.villes.length; h++) {
          //compare them
          if( shiftCity.toLowerCase() == dispo.villes[h].toLowerCase() ){
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
     highlights the coursiers that work on the given day
   */
  $scope.whoWorksOn = function(day, month, year){
    $(".colDaySelected, .rowDaySelected").removeClass("colDaySelected rowDaySelected")
    var date = new Date(year, month, day)
    var dateCol = moment(new Date(year, month-1, day) ).format("D-M-YYYY")
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
          $scope.coursiers = coursiers;
          $scope.loadAbsencesAndDispos($scope.coursiers, new Date())
    })
  }
  //load shifts and coursiers
  shiftService.getShifts(function(shifts){
    $scope.shifts = shifts;
    $scope.loadCoursiers();
  });

   //update view on attribution passed !!!!! -> in coursierDay directive
  $scope.$on('attribution', function(event, args) {
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

  $scope.$on("deletitionShift", function(event,args){
    var shifts = $scope.attributions[0].monthYear[args.monthYear][args.day].shifts
    for (var i = shifts.length - 1; i >= 0; i--) {
       if (shifts[i].coursierAttributed._id  == args.coursier._id) {
        if (shifts[i]._id == args.shift._id) {
          shifts.splice(i,1)
        };
      }; 
    };
    $scope.attributions[0].monthYear[args.monthYear][args.day].shifts = shifts
    $scope.$broadcast("delPassed", {day:args.day, monthYear: args.monthYear, shifts : $scope.attributions[0].monthYear[args.monthYear][args.day].shifts})
  })
  /*
    load absences and dispos of every coursier 
    into absences[] and presences[] 
    Sort into objects with daily attributes
  */
  $scope.loadAbsencesAndDispos = function(coursiers, date){
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
    var disponibilites  = {}
    var lesPresences = {}
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
                var dayNo = moment(day[j].start).format("D")
                if (!disponibilites[dayNo]) {
                  disponibilites[dayNo] = []
                }
                if (!lesPresences[dayNo]) {
                   lesPresences[dayNo] = []
                };
                day[j].coursierId = coursierId
                if (day[j].title == "Dispo") {
                  lesPresences[dayNo].push(day[j])
                }
                disponibilites[dayNo].push(day[j])
              }//end get days       
           }
        };//end get months
      };//var month in coursiers[i].dispos

      }
    };//end for
    $scope.lesPresences = lesPresences
    $scope.disponibilites = disponibilites
    //now we have all the dispos and absences - we can load the calendar
    $scope.renderCalendar($scope.monthNum, $scope.year)
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
  $scope.toggleAllDispos = function(toggleAll){
  if (toggleAll== true) {
     $("td.lowDispoOff").addClass('lowDispo').removeClass('lowDispoOff') 
     $("td.mediumDispoOff").addClass('mediumDispo') .removeClass('mediumDispoOff')  
     $("td.highDispoOff").addClass('highDispo') .removeClass('highDispoOff')  
     $("td.busyOff").addClass('busy').removeClass('busyOff');
     $scope.toggleAll = false;    
   }else if (toggleAll == false){
    $("td.lowDispo").addClass('lowDispoOff').removeClass('lowDispo') 
     $("td.mediumDispo").addClass('mediumDispoOff') .removeClass('mediumDispo')  
     $("td.highDispo").addClass('highDispoOff') .removeClass('highDispo')  
     $("td.busy").addClass('busyOff').removeClass('busy');
     $scope.toggleAll = true;
   }  
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
      var city = city.substring(0, city.length - 1);
     if (level == 'lowDispo') {
       if ($(".lowDispoOff").length >0) {
         $("td."+city+"."+level+"Off").addClass('dispoLevelCityLow').removeClass(level+"Off")
       }else{
        $("td."+city+"."+level).addClass('dispoLevelCityLow').removeClass(level+"Off")
       }
     }
     else if(level =='mediumDispo'){
       $("td."+city+"."+level+"Off").addClass('dispoLevelCityMedium').removeClass(level+"Off")

     }
     else if(level =='highDispo'){
       $("td."+city+"."+level+"Off").addClass('dispoLevelCityHigh').removeClass(level+"Off")
      }
  }

  /* 
    checks if the date given has been 
    defined as dispo of the coursier (userId);
    if it is, returns the dispo infos  
  */
  $scope.checkDispo = function(day, month,year, userId){
    if (typeof $scope.disponibilites != 'undefined') {
      var theDay = moment(new Date(year, month, day)).format("D");
      var theYear = moment(new Date(year, month, day)).format("YYYY");
      var dispos = $scope.disponibilites// created in loadAbsencesAndDispos
      for(var day in dispos){
          if (day == theDay) {
            for(var dispo in dispos[day]){
               if (dispos[day][dispo].coursierId == userId) {
                 var currDispo = dispos[day][dispo]
                 if (theYear == moment(currDispo).format("YYYY")) {//get for the current year only
                    if(typeof dispos[day][dispo].villes != undefined) {
                     var villes = currDispo.villes
                    }else{
                      var villes = [];
                    }
                  var theDispo = {type: currDispo.title, villes: villes, start : currDispo.start, end: currDispo.end};
                 };
               };
            }
          };
      }
      return theDispo ;
       //  var dispos = $scope.dispos
     // var day = moment(date).format("D-M-YYYY");
       // for (var i = dispos.length - 1; i >= 0; i--) {
       //   var presentDay = moment(dispos[i].start).format("D-M-YYYY");
       //    if (presentDay == day && userId == dispos[i].coursierId) {
       //        if(typeof dispos[i].villes != 'undefined' ) {
       //          var villes = dispos[i].villes
       //        }else{
       //          var villes = [];
       //        }
       //          var dispo = {type: dispos[i].title, villes: villes, start : dispos[i].start, end: dispos[i].end};
       //    }
       // };
       //console.debug($scope.dispos);
      // console.debug(myDispo);
    };
  }

  })
  .directive('manquesCity', function(){
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
      template: '<p ng-repeat="daShift in checkedShifts" ng-click ="showPotentialCoursiers(day+1, monthNum, year, daShift, $event)" ng-class="daShift.enough !=true ? \'bg-danger\' : \'shiftHidden\' " ' 
     + '  class="shiftsByCity"> '
     +' {{daShift.ville == city ? (daShift.enough === true ? daShift.nom : daShift.nom+"("+daShift.timesLeft+")") : null}}</p>  '
    }
  })
  .directive('coursierDay', function() {
      return{
        scope : {
          year : "=",
          day : "=",
          setShift : "=",
          monthNum : "=",
          returnAttributions: "=",
          checkDispo : "=",
          user: "=",
          monthYear : "="
        },
        link : function  (scope, elem, attrs) {
          elem.addClass('coursierDay')

          scope.addDispoChange = function (newMonth, newYear) {
            elem.attr("date", (scope.day)+"-"+(newMonth+1)+"-"+newYear )  
            var dispo = scope.checkDispo(scope.day, newMonth, newYear, scope.user._id) 
             elem.removeClass("presentOff present absent city-bg-off city-bg-on noInfo noInfoOff Lausanne Yverdon Neuchâtel")
                if(dispo){
                  if (dispo.type =="Dispo") {
                     elem.addClass("presentOff")
                    if (dispo.villes) {
                      scope.from = moment(dispo.start).format("H:mm")
                      scope.to = moment(dispo.end).format("H:mm")
                      scope.cities =  dispo.villes.join(", ");
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

          scope.getAttrShifts = function (attributions, monthYear){
             scope.daShifts = []
             if (attributions) {
                 if (attributions[scope.day]) {           
                  var daShifts = []
                  $.each(attributions[scope.day].shifts, function(i, shift){
                     if (shift.coursierAttributed._id  == scope.user._id) {
                          if (shift.title == 'Absent') {
                            elem.addClass("absent")
                          }else{
                             daShifts.push(shift);  
                          }
                      }
                    })
                    scope.daShifts = daShifts;        
                }
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
                      scope.remarques = scope.user.dispos[month][week].remarques;
                      var attributed = scope.getNumberOfAttributedShiftsWeek(scope.user._id, monthYear, startWeek, endWeek)
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
                      }else if( shiftsLeft <= 2 ){
                        elem.addClass("lowDispoOff")
                      }else if(shiftsLeft >=3 && shiftsLeft <=5){
                        elem.addClass("mediumDispoOff")
                      }else if(shiftsLeft >=6){
                        elem.addClass("highDispoOff")
                      }
                    $(".absent").removeClass('highDispo mediumDispo lowDispo busy')
                    elem.attr('shiftsAttributed', attributedShifts)
                    elem.attr('shiftsLeft', shiftsLeft)
                    elem.attr('shiftsWanted', wantedShifts)
                    elem.attr('coursierId', scope.user._id)
                    elem.attr('coursierName', scope.user.name);
                    //used in popover on cell
                    scope.shiftsLeft = shiftsLeft
                    scope.wantedShifts = wantedShifts
                    scope.attributedShifts = attributedShifts
                };          
              };
            };
          }
          /*
              gets the number of already attributed shifts to the coursier
              for the given week. 
          */
          scope.getNumberOfAttributedShiftsWeek = function (coursierId, monthYear, startWeek, endWeek) {
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
                     if(shifts[i].coursierAttributed._id == coursierId && !shifts[i].title){//title-> dont count the absent shift as a shift!
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
            //scope.addDispoMonthChange(scope.monthNum);
            scope.getAttrShifts(scope.attributions[args.monthYear], args.monthYear)
            scope.checkShiftsPerWeek(null, scope.day, scope.monthNum, scope.year)
           })
           //update on deletition
           scope.$on("delPassed",function(e, args){
            scope.attributions[args.day].shifts = args.shifts
           // scope.addDispoMonthChange(scope.monthNum);
            scope.getAttrShifts(scope.attributions, scope.monthYear)
            scope.checkShiftsPerWeek(null, scope.day, scope.monthNum, scope.year)
           })
          //WATCH MONTH
           scope.$watch("monthNum",function(newMonth,oldValue) {
               elem.removeClass('lowDispo mediumDispo highDispo lowDispoOff mediumDispoOff highDispoOff busy busyOff absent present Lausanne Yverdon Neuchâtel')
               var date = new Date(parseInt(scope.year), newMonth, scope.day)
               var dayOfWeek = date.getDay();
               var monthYear = moment(1+"-"+(newMonth+1)+"-"+scope.year, "D-M-YYYY").format("MM-YYYY")
               scope.attributions = scope.returnAttributions(monthYear)
               scope.shiftsLeft = scope.wantedShifts = scope.daShifts =scope.cities = scope.attributedShifts = scope.remarques = scope.from = scope.to = scope.villes = null
               scope.addDispoChange(newMonth, scope.year);
               scope.getAttrShifts(scope.attributions, monthYear)
               scope.checkShiftsPerWeek(dayOfWeek,scope.day,  newMonth, scope.year)
            });
           //WATCH YEAR
           scope.$watch("year",function(newYear,oldValue) {
              elem.removeClass('lowDispo mediumDispo highDispo lowDispoOff mediumDispoOff highDispoOff busy busyOff absent present Lausanne Yverdon Neuchâtel')
              var date = new Date(parseInt(newYear), scope.monthNum, scope.day)
              var dayOfWeek = date.getDay();
              var monthYear = moment(1+"-"+(scope.monthNum+1)+"-"+newYear,  "D-M-YYYY").format("MM-YYYY")
              scope.attributions = scope.returnAttributions(scope.monthYear)
              scope.shiftsLeft = scope.wantedShifts = scope.daShifts = scope.cities = scope.attributedShifts = scope.from = scope.to =scope.remarques = scope.villes = null
              scope.addDispoChange(scope.monthNum, newYear)
              scope.getAttrShifts(scope.attributions, monthYear)
              scope.checkShiftsPerWeek(dayOfWeek, scope.day, scope.monthNum, newYear)
            });

        },//link
        template:'<div class="dispoInfo"  tooltip="De {{from != null ? from : \'?\'}} à {{to != null ? to : \'?\'}} &#8232; '
                + ' {{cities != null ? \'Villes: \'+cities : \'?\'}} {{remarques != null ? \'--- \'+remarques : \'\' }} ---{{shiftsLeft != null ? \'Shifts restants:\'+ shiftsLeft : \'\'}}" '
                + 'tooltip-placement="top"  tooltip-append-to-body="true" tooltip-trigger="mouseenter" > </div>'
                +' <span city="{{shift.ville}}"  ng-repeat="shift in daShifts track by $index" ng-class="daShifts != null ? \'attributedShift\' : \'\'  "  '
                +' popover="Remarques: {{shift.remarques}} || A {{shift.ville}} de {{shift.debut | date : \'H:mm\'}} à  {{shift.fin | date : \'H:mm\'}}" '
                +'   popover-placement="top"  '
                +'  popover-trigger="mouseenter">'+
              '{{shift.nom}}{{$last ? "" : "+"}}</span>'
      }
    })
  .directive('doublons', function  () {
      return{
        scope : {
          year : "=",
          day : "=",
          monthNum : "=",
          dailyShifts : "=",
          returnAttributions: "=",
          monthYear : "="
        },
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
       }, 
        template:'<span class="shiftsDoubles" ng-class="shift.invalidDay === true ? \'bg-warning\': \'\' " ng-repeat="shift in doubleShifts">{{shift.timesLeft>1 ? shift.nom+"("+shift.timesLeft+")" : shift.nom}}</span>'

      }
  })

