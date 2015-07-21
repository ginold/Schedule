'use strict';

angular.module('velociteScheduleApp')
  .controller('SendDisposCtrl', function ($scope, $http,$modal,calendarService, Auth) {

  //var $doc = angular.element(document);
  var index = 0; //for event delete
  //checkbox default  checked
  $scope.laus_check = false;
  $scope.yv_check = false;
  $scope.neuch_check = false;
  $scope.isBefore  =  false;
  $scope.months = calendarService.getMonths();
  $scope.monthYear;
  var monthYear = moment(new Date()).format("MM-YYYY")
  $scope.dispos = {};
  $scope.villes = [];
  $scope.forgotCity = false;
  $scope.drag = false
  $scope.loaded = false;
  $scope.forgotShiftsWeek = false
  $scope.weekDispos =  []; // everyday dispo per week
  $scope.eventSources = [$scope.weekDispos];
  $scope.dispoType  = true; // true = disponible, false = absent
  $scope.user = Auth.getCurrentUser();
   $scope.alreadySeen = []
  var date = new Date()
  var year = date.getFullYear()

  //get months for this and next year
  $http.get("api/monthYears/year/"+year).success(function(monthYears){
    $scope.monthYears = monthYears
      $http.get("api/monthYears/year/"+(year+1)).success(function(monthYears2){
           $scope.monthYears = $scope.monthYears.concat(monthYears2)
      })
  })

  /* config calendar */
  $scope.calendarConfig = {    
    calendarDispos:{
      height: 660,
      firstDay: 1, //monday
      width: 400,
      lang : 'fr',
      selectable:true, //time range
      editable: false,
      timezone: 'local',
      minTime: "06:00:00", 
     	maxTime: "21:00:00",
      businessHours: {
          start: '06:00', // a start time (10am in this example)
          end: '21:00', // an end time (6pm in this example)
      },
      defaultAllDayEventDuration: {
           hours: 15
      },
     // events: $scope.myDispos,
      header:{
        left: 'agendaWeek',
        center: 'title',
        right: 'today prev,next'
      },
      defaultView: 'agendaWeek',
     //get visible weekly date range, ex 15-21 june 2015
     viewRender: function(view, element) {
          var weekStart = view.start.date();
          var weekEnd = view.end.date();
          var monthStart = view.start._d.getMonth();
          var monthEnd = view.end._d.getMonth();
          var monthYearStart = moment(view.start._d).format("MM-YYYY");
          var monthYearEnd = moment(view.end._d).format("MM-YYYY");
          //init name of the displayed month
          //useful for displaying month names in veryfiDispos.html
          // for example 28 juin - 2 juillet
          if (monthEnd == monthStart) {
             $scope.week = weekStart+" - "+weekEnd+" "+$scope.months[monthStart]
          }else{
             $scope.week = weekStart+" "+$scope.months[monthStart]+" - "+weekEnd+" "+$scope.months[monthEnd]
          }
          $scope.monthYear = monthYearStart
          $scope.loadDispos($scope.week, monthYearStart, monthYearEnd ) 
          $('#calendar').fullCalendar('removeEventSource')
          $('#calendar').fullCalendar('removeEvents');
          $('#calendar').fullCalendar('addEventSource', $scope.weekDispos);
      },

      select: function(start, end) {
        var startMonth = moment(start).startOf('week').month()
        var endMonth = moment(end).endOf('week').month()
        var monthYearEnd = moment(end).format("MM-YYYY")
        var monthYearStart = moment(start).format("MM-YYYY")
        
        //if click is before now
        if (moment(start).isBefore(new Date(), "day") ) {
          $scope.isBefore = true;
          return
        }else{
          $scope.isBefore = false;
        }
        //if the month is closed
        if (!$scope.isOpenMonth(start)) {
          $scope.monthClosedInfo = {
            show : true,
            name : $scope.months[start._d.getMonth()]
          };
          return;
        }else{
          $scope.monthClosedInfo = false;
        }
    
          $scope.monthYear = moment(start._d).format("MM-YYYY");
          var startHour = start._d.getHours()+":"+start._d.getMinutes();
          var endHour = end._d.getHours()+":"+end._d.getMinutes();
        
        //if you dragged...
        if (moment(end).isAfter(moment(start), "day") && !(startHour == endHour)  ) {
          $scope.drag = true;
        }else{
          $scope.drag = false
        }
         //if it has the same starting nad ending hours 
         //-> it's all day, restrict the starting and ending hours
         if (startHour == endHour) {
          console.debug(startHour, endHour);
            var allDay = true;
            var startTime = new Date(start).setHours(6)
            // startTime = moment(startTime).hour(4)
            var endTime = new Date(end).setHours(21)
            // endTime = moment(endTime).subtract(1,"days").hour(19)
            console.debug(startTime, endTime);
         }else{
            var allDay = false;
            var startTime = start;
            var endTime = end;
         }
         //assign the dispo type (absent/present)
         if ($scope.dispoType == true) {
            var className = "presentDispo"; //blue
            var title = "Dispo"
         }else{
            var className = "absentDispo"; //red
            var title = "Absent"
            var villes = null;
         }
      
         //create the dispo variable
         var dispo =  { index : index, title: title, start: startTime,
          end: endTime, stick: true, villes : villes, allDay : allDay, 
          className: className+" data-id="+index
         };
         console.debug(dispo);
         index++;
        //replace a dispo if selected on the same day
        if ($scope.dispos[$scope.monthYear] && $scope.villes.length != 0 ) {
            if ($scope.dispos[$scope.monthYear][$scope.week]) {
              if ($scope.dispos[$scope.monthYear][$scope.week].dispos) {
                var dispos = $scope.dispos[$scope.monthYear][$scope.week].dispos
                for (var i = dispos.length - 1; i >= 0; i--) {
                  if( moment(dispos[i].start).isSame(dispo.start,"day") ){
                    $scope.dispos[$scope.monthYear][$scope.week].dispos.splice(i,1)

                    for (var  j = $scope.weekDispos.length - 1; j >= 0; j--) {
                      if( moment($scope.weekDispos[j].start).isSame(dispo.start,"day")){
                        $scope.weekDispos.splice(j,1)
                      
                      }
                    };
                       $('#calendar').fullCalendar('removeEventSource')
                         $('#calendar').fullCalendar('removeEvents');
                         $('#calendar').fullCalendar('addEventSource', $scope.weekDispos);
                  }
                };
              };
            };
         //or if they are loaded and you want to modify
         }
      
        if ($scope.villes.length == 0) {
          $scope.forgotCity = true

        }else{
          $scope.forgotCity = false
        }
        if ($("#shiftsWeek").val() == '' || $("#shiftsWeek").val() == null) {
          $scope.forgotShiftsWeek = true

        }else{
          $scope.forgotShiftsWeek = false
        }
        //everything ok,  push!!
        if (!$scope.drag && !$scope.forgotCity && !$scope.forgotShiftsWeek && !$scope.isBefore) {

            //init for the first click
            if (!$scope.dispos[$scope.monthYear]) {
              $scope.dispos[$scope.monthYear] = {}
            };
            if (!$scope.dispos[$scope.monthYear][$scope.week]) {
              $scope.dispos[$scope.monthYear][$scope.week] = {}
            };
            if(!$scope.dispos[$scope.monthYear][$scope.week].dispos){
              $scope.dispos[$scope.monthYear][$scope.week].dispos = []
            }
            if (startMonth !== endMonth) {
              $scope.dispos[monthYearEnd][$scope.week].shiftsWeek = angular.copy( $scope.dispos[monthYearStart][$scope.week].shiftsWeek )
              $scope.dispos[monthYearEnd][$scope.week].remarques = angular.copy( $scope.dispos[monthYearStart][$scope.week].remarques)
            }
            dispo.villes = angular.copy($scope.villes)
            $scope.dispos[$scope.monthYear][$scope.week].dispos.push(dispo)
            $scope.weekDispos.push(dispo);
            console.debug($scope.dispos);
        };
      },//end select
      /*
        add cities to dispo cell
      */
      eventAfterRender: function(evento, element) {
       if (evento.villes != null) {
        var villes = evento.villes.join(', ');        
        var new_description = '<strong>Villes: </strong><br/>' + villes + '<br/>';       
        element.append(new_description);
       };
        
      }//end eventrender
    }
	}//calendarConfig
/*
  checks if the month of date clicked 
  is opened for new dispos or not (active)
*/
$scope.isOpenMonth = function(date){
    var monthNum = date._d.getMonth()
    var year = date._d.getFullYear()
    for (var i = $scope.monthYears.length - 1; i >= 0; i--) {
      if ($scope.monthYears[i].monthNum == monthNum && $scope.monthYears[i].year ==year) {
        return $scope.monthYears[i].active
      };
    };
  }


$scope.inputShiftsWeek = function(number){
  $scope.shiftsWeek = number;
  $scope.forgotShiftsWeek = false
}
$scope.inputRemarques =function (remarques){
  $scope.remarques = remarques;
}

$scope.loadDispos = function(theWeek, monthYearStart, monthYearEnd){
  if (monthYearStart == monthYearEnd) {
    var months= [monthYearStart]
  }else{
    var months= [monthYearStart, monthYearEnd]
  }

 for (var j = months.length - 1; j >= 0; j--) {
  var monthYear = months[j] 
  if ($scope.user.dispos) {
    console.debug($scope.user.dispos);
    for(var month in $scope.user.dispos){
      if (monthYear == month &&  $.inArray(monthYear, $scope.alreadySeen) == -1 ) {
        $scope.alreadySeen.push(monthYear)

        for(var week in $scope.user.dispos[monthYear]){
          for (var i = $scope.user.dispos[monthYear][week].dispos.length - 1; i >= 0; i--) {
             $scope.weekDispos.push($scope.user.dispos[monthYear][week].dispos[i])
          };
         if (!$scope.dispos[monthYear]) {
            $scope.dispos[monthYear] = {}
         };
         if (!$scope.dispos[monthYear][week]) {
            $scope.dispos[monthYear][week] = {}
         };
         if ($scope.dispos[monthYear][week].dispos) {
            $scope.dispos[monthYear][week].dispos = []
         };

         $scope.dispos[monthYear][week].dispos = $scope.user.dispos[monthYear][week].dispos
         $scope.dispos[monthYear][week].shiftsWeek = $scope.user.dispos[monthYear][week].shiftsWeek
         $scope.dispos[monthYear][week].remarques = $scope.user.dispos[monthYear][week].remarques
             
        }
      }else if($.inArray(monthYear, $scope.alreadySeen) != -1){
        return;
      }
    }
  };    
}
 
}
  /**
    Dispo dispoType
    true = disponible, false = absent
  */
$scope.toggleDispoType = function(type){
    if (type == 'present') {
      $scope.dispoType = true;
    }else{
      $scope.dispoType = false;
    }
  }

  
});
