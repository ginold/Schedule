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
      $scope.toggleAll = false;
      $scope.showAllPlanning = true;
      $scope.shiftSources = [];
      $scope.alreadySeen = [];
      $scope.formatedShifts = []
      $scope.number = 12;
      $scope.limitFrom = 0;
      $scope.limitTo = 12;
      $scope.dispoOn = false;
      $scope.noInfoOn = false;
      $scope.toggleCities = []
      $scope.citiesLeft = []
      $scope.citiesManques = []

  $(document).ready(function () {
    $("body").on('click','.cityManquesHeader',function(){
       $(this).next('tr').slideToggle('fast')
    });

    $("body").on('mouseover','.coursierDay',function(){
      $(".colHover").removeClass("colHover")
      $(this).closest('tr').addClass('colHover')
    });


    $(".planning").on('mousewheel',"#shiftsTable",function(e){
      e.preventDefault();
        if(e.originalEvent.wheelDelta /120 > 0) {
           $("#down").trigger('click')  
        }
        else{
          $("#up").trigger('click')
            
        }
       if ($scope.preselectedShift) {
          //you have to give some time to load first
          setTimeout(function(){
            var day = moment($scope.preselectedDate,"D-M-YYYY").format("D")
            var month = moment($scope.preselectedDate,"D-M-YYYY").format("M")
            var year = moment($scope.preselectedDate,"D-M-YYYY").format("YYYY")
            $scope.showPotentialCoursiers(day,(month-1),year,$scope.preselectedShift, $scope.preselectedEvent)
        },100)
      }
      if ($scope.dispoOn) {
         $(".presentOff").removeClass("presentOff").addClass("present");
      };
       if ($scope.noInfoOn) {
        $(".noInfoOff").removeClass("noInfoOff").addClass("noInfo");
      };
      if ($scope.toggleAll) {
         $("td.lowDispoOff").addClass('lowDispo').removeClass('lowDispoOff') 
         $("td.mediumDispoOff").addClass('mediumDispo') .removeClass('mediumDispoOff')  
         $("td.highDispoOff").addClass('highDispo') .removeClass('highDispoOff')  
         $("td.busyOff").addClass('busy').removeClass('busyOff');
      };
      $scope.toggleCityDispos(null)


    });

    $(document).keyup(function(e) {
      //when escaping attribution popover with "annuler"
       if (e.keyCode == 27) { 
          $(".colDaySelected").removeClass('colDaySelected')
      }
    });

    //because angular-fullcalendar was so sloooooow....
    $('#fullCal').fullCalendar({
          height: 620, width:400, aspectRatio: 0.4,firstDay: 1, //monday
          editable: false,allDaySlot: false,eventLimit: 3,minTime: "06:00:00", 
          maxTime: "21:00:00",lang : 'fr',
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

             AttributionsService.getMyMonthlyShifts($scope.currentUser._id, monthYear, $scope.attributions, function (myShifts) {
              console.debug(myShifts);
                  AttributionsService.formatShiftsForCalendar(myShifts, function(formatedShifts){ 
                  $scope.formatedShifts = $scope.formatedShifts.concat(formatedShifts)    
                  $('#fullCal').fullCalendar('removeEventSource')
                  $('#fullCal').fullCalendar('removeEvents');
                   $('#fullCal').fullCalendar('addEventSource',$scope.formatedShifts);
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
    $(".notDispoLausanne, .notDispoYverdon, .notDispoNeuchâtel").removeClass("notDispoLausanne notDispoYverdon notDispoNeuchâtel")
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
  //sets the preselected shift to null so you can 
  //set any shift
  $scope.unselectShift = function(){
    $scope.preselectedShift = null
    $(".lowPotential, .mediumPotential, .highPotential, .busyPotential, .shiftManqueDaySelected").removeClass("lowPotential mediumPotential highPotential busyPotential shiftManqueDaySelected")
    $(".shiftManqueDaySelected").removeClass("shiftManqueDaySelected")
  }
  //when searching for a numero-coursier, you have to
  //open the limits of the searching array
  $scope.searchNo = function(number){
    console.debug($scope.limitFrom, $scope.limitTo);
    if (number == '' || typeof number=== undefined) {
      $scope.limitFrom = 0
      $scope.limitTo =  $scope.number
    };
    for (var i = $scope.coursiers.length - 1; i >= 0; i--) {
      if(number == $scope.coursiers[i].numeroCoursier){
         $scope.limitFrom = 0
         $scope.limitTo = $scope.coursiers.length
      }
    };
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
    Orange -> is not able but present + city ok
    Gray -> is not able, busy, but city+hours ok
    Called in HTML, Calls -> sortPotentialCoursiers()
  */
  $scope.showPotentialCoursiers = function(day,month,year, shift, event){
    $(".lowPotential, .mediumPotential, .highPotential, .busyPotential, .shiftManqueDaySelected").removeClass("lowPotential mediumPotential highPotential busyPotential shiftManqueDaySelected")
    $(event.target).addClass('shiftManqueDaySelected')
    var date = moment(new Date(year, month, day)).format("D-M-YYYY");
    var theDay = moment(new Date(year, month, day)).format("D")
    $scope.preselectedShift = shift;
    $scope.preselectedDate = date;
    $scope.preselectedEvent = event
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
                  cell.this.addClass('highPotential')
                //can but is busy, blue
                }else if(isCapable && isBetweenHours && (isInCity != -1) && isBusy){
                  cell.this.addClass('mediumPotential')
                //cant but is available, orange
                }else if(!isCapable && isBetweenHours && (isInCity != -1) && !isBusy){
                  cell.this.addClass('lowPotential')
                //cant, is busy, but is hours and city is ok
                }else if(!isCapable && isBetweenHours && (isInCity != -1) && isBusy){
                  cell.this.addClass('busyPotential');
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
    If there is a preselected shift, it automatically attributes the shift
    to the cell if its the same day as the selected shift day
  */
    $scope.setShift = function(day, month,year, user){
      if (Auth.isAdmin()) {
        var date = new Date(year, month, day)
        var formatedDate = moment(date).format("D-M-YYYY")
        var day =  moment(date).format("D")
        var dayOfWeek = moment(date).day()
        //attribute the selected shift automatically
        if($scope.preselectedShift && formatedDate == $scope.preselectedDate){
           AttributionsService.setShift([$scope.preselectedShift], user, date, null);
           $scope.preselectedShift = null
           $(".lowPotential, .mediumPotential, .highPotential, .busy, .shiftManqueDaySelected").removeClass("lowPotential mediumPotential highPotential busy shiftManqueDaySelected")
           return;
        }
        var day_shifts = $scope.dailyShifts[dayOfWeek-1]
        var presences = $scope.lesPresences
        //Get attributed shifts for that coursier on that day
        var attributedShifts  = $scope.getAttributedShifts($scope.attributions[0].monthYear[$scope.monthYear], date, user._id)
        //there are no presences sent yet
        if(Object.keys(presences).length == 0){
           $scope.showPopover(null, user, date, null, attributedShifts);  
           return;  
        }
       var index = 0;
       var max = Object.keys(presences).length 
        //check if the day clicked is an dispo present day
        for(var theDay in presences){
          index++;
          if (theDay == day) {
            for (var i =  presences[day].length - 1; i >= 0; i--) {
              var dispo = presences[day][i]
              if(dispo.coursierId == user._id){
                var dispoHours = $scope.getDispoHoursAndDay(dispo);
                var time_shifts = $scope.compareDiposHoursAndShift(dispoHours, day_shifts);
                var time_city_shifts  = $scope.compareDispoCityAndShift(time_shifts, dispo);
                var time_city_able_shifts = $scope.compareUserAndShift(time_city_shifts, user._id, user.competences); 
                //show the select screen, give it the date, found shifts and the complete user.
                $scope.showPopover(time_city_able_shifts, user, date, day_shifts, attributedShifts);  
                return;
              //no dispo found!
              }else if (i == 0){
                $scope.showPopover(null, user, date, null, attributedShifts);  
                return;  
            }
          };
        //there are presences, but none of the user
        }else if(index == max){
            $scope.showPopover(null, user, date, null, attributedShifts);  
            return;   
        }
      }
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
              if (day) {
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
              };
                 
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
  $scope.togglePlanning = function(){
    if ($scope.showAllPlanning == true) {
        $scope.showAllPlanning = false
    }else{ 
        $scope.showAllPlanning = true
    }
    $('#fullCal').fullCalendar('removeEventSource')
    $('#fullCal').fullCalendar('removeEvents');
    $('#fullCal').fullCalendar('addEventSource',$scope.formatedShifts);
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
        $scope.dispoOn = false
      }else{
        $(".presentOff").removeClass("presentOff").addClass("present");
         $scope.dispoOn = true
      }
  }
  $scope.toggleNoInfo = function(){
      if ($(".noInfo").length > 0) {
        $(".noInfo").removeClass("noInfo").addClass("noInfoOff");
        $scope.noInfoOn = false
      }else{
        $(".noInfoOff").removeClass("noInfoOff").addClass("noInfo");
         $scope.noInfoOn = true
      }
  }
  // on click on td "manques" -> show who is NOT present in a @city
  // works for one city at a time
  $scope.toggleCityDispos = function (city) {

     if( $.inArray(city, $scope.toggleCities) == -1){
      $scope.toggleCities.push(city)
     }else{
      $scope.toggleCities.splice($.inArray(city, $scope.toggleCities), 1)
     }
     var citiesLeft = []
     for (var i = $scope.cities.length - 1; i >= 0; i--) {
        if($.inArray($scope.cities[i], $scope.toggleCities) == -1 ){
          citiesLeft.push($scope.cities[i])
        }
     };
     for (var i = $scope.toggleCities.length - 1; i >= 0; i--) {
        $(".manques"+$scope.toggleCities[i]).addClass('notDispo'+$scope.toggleCities[i])   
        $("td.coursierDay:not(."+$scope.toggleCities[i]+"):not(.noInfo):not(.noInfoOff):not(.absent)").addClass("city-bg-on notDispo"+$scope.toggleCities[i])
     };
     for (var i = citiesLeft.length - 1; i >= 0; i--) {
       $(".manques"+citiesLeft[i]).removeClass('notDispo'+citiesLeft[i]).addClass('city-bg-off')
       $("td.coursierDay.notDispo"+citiesLeft[i]).removeClass("notDispo"+citiesLeft[i])
     
     };
      //$scope.citiesManques = citiesLeft;
  }
  $scope.returnAttributions = function(monthYear){
    if ($scope.attributions.length != 0) {
        return $scope.attributions[0].monthYear[monthYear]
      };
  }
  $scope.toggleShiftsLevel = function(toggleAll,event){
    if (toggleAll) {
     $("td.lowDispo").addClass('lowDispoOff').removeClass('lowDispo') 
     $("td.mediumDispo").addClass('mediumDispoOff') .removeClass('mediumDispo')  
     $("td.highDispo").addClass('highDispoOff') .removeClass('highDispo')  
     $("td.busy").addClass('busyOff').removeClass('busy');
  
     $scope.toggleAll = false;    
   }else if (!toggleAll){
      $("td.lowDispoOff").addClass('lowDispo').removeClass('lowDispoOff') 
     $("td.mediumDispoOff").addClass('mediumDispo') .removeClass('mediumDispoOff')  
     $("td.highDispoOff").addClass('highDispo') .removeClass('highDispoOff')  
     $("td.busyOff").addClass('busy').removeClass('busyOff');
     $scope.toggleAll = true;
   }  
  }
  //====================== TODO - DISPO LEVEL BY CITY =======================
  // $scope.toggleBusy = function(){
  //    if($(".busyOff").length > 0 ) {
  //      $(".busyOff").removeClass('busyOff').addClass('busy')
  //    }else{
  //       $(".busy").removeClass('busy').addClass('busyOff')
  //    }
  // }
  // $scope.toggleLowDispo = function(){
  //   if($(".lowDispoOff").length > 0 ) {
  //       $(".lowDispoOff").removeClass('lowDispoOff').addClass('lowDispo')
  //    }else{
  //       $(".lowDispo").removeClass('lowDispo').addClass('lowDispoOff')
  //    }
  // }
  // $scope.toggleMediumDispo = function(){
  //     if($(".mediumDispoOff").length > 0 ) {
  //       $(".mediumDispoOff").removeClass('mediumDispoOff').addClass('mediumDispo')
  //    }else{
  //       $(".mediumDispo").removeClass('mediumDispo').addClass('mediumDispoOff')
  //    }
  // }
  // $scope.toggleHighDispo = function(){
  //    if($(".highDispoOff").length > 0 ) {
  //       $(".highDispoOff").removeClass('highDispoOff').addClass('highDispo')
  //    }else{
  //       $(".highDispo").removeClass('highDispo').addClass('highDispoOff')
  //    }
  // }
  // $scope.toggleDispoLevelCity = function(city, level){
  //   //there is a space at the end...
  //     var city = city.substring(0, city.length - 1);
  //    if (level == 'lowDispo') {
  //      if ($(".lowDispoOff").length >0) {
  //        $("td."+city+"."+level+"Off").addClass('dispoLevelCityLow').removeClass(level+"Off")
  //      }else{
  //       $("td."+city+"."+level).addClass('dispoLevelCityLow').removeClass(level+"Off")
  //      }
  //    }
  //    else if(level =='mediumDispo'){
  //      $("td."+city+"."+level+"Off").addClass('dispoLevelCityMedium').removeClass(level+"Off")

  //    }
  //    else if(level =='highDispo'){
  //      $("td."+city+"."+level+"Off").addClass('dispoLevelCityHigh').removeClass(level+"Off")
  //     }
  // }
//===========================================================================
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
    };
  }
  var show = true;
  $scope.showHiddenShifts = function(){
    if (show) {
       $(".shiftHidden").css('display','block')
       show = false
    }else{
      $(".shiftHidden").css('display','none')
      show = true
    }
  }
  //on moushewheel down
  $scope.up = function(){
    if ($scope.limitTo >= $scope.coursiers.length) {
      return
    }else{
       $scope.limitFrom++
        $scope.limitTo++
    }
  }
  //on moushewheel up
  $scope.down = function(){
    if ($scope.limitFrom <= 0) {
      return
    }else{
        $scope.limitFrom--
        $scope.limitTo--

    };
  }
  //on change the ng-model= number input
  $scope.limitCoursiers = function(number){
    var max = $scope.coursiers.length
    var limitTo = $scope.limitTo
      if ($scope.preselectedShift) {
      setTimeout(function(){
        var day = moment($scope.preselectedDate,"D-M-YYYY").format("D")
        var month = moment($scope.preselectedDate,"D-M-YYYY").format("M")
        var year = moment($scope.preselectedDate,"D-M-YYYY").format("YYYY")
        $scope.showPotentialCoursiers(day,(month-1),year,$scope.preselectedShift, $scope.preselectedEvent)
      },100) 
    }
    if (number =="tous") {
      $scope.limitFrom = 0 
      $scope.limitTo = max
      return
    }else{

      if (number >= max) {
        $scope.limitTo = max
      }else{
        $scope.limitTo = $scope.limitFrom+number
      }
      if ($scope.limitFrom <= 0) {
        $scope.limitFrom = 0
      }
       };
  }
  })
  .filter('limitFromTo', function(){
    return function (input, left, right) {
        if(input === undefined || left === undefined) return input;
        if(right === undefined){
            right = left;
            left =  0;
        }
        return input.slice(left,right);//string and array all have this method
    };
});

