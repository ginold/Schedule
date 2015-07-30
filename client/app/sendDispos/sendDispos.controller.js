  'use strict';

  angular.module('velociteScheduleApp')
    .controller('SendDisposCtrl', function ($scope, $http,$modal,calendarService, Auth, shiftService) {

    //var $doc = angular.element(document);
    var index = 0; //for event delete
    //checkbox default  checked
    $scope.laus_check = false;
    $scope.yv_check = false;
    $scope.cities =  shiftService.getCities()
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
    $scope.forgotRemarques = true;
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
        lang : 'fr',
        selectable:true, //time range
        editable: false,
        timezone: 'local',
        minTime: "06:00:00", 
       	maxTime: "21:00:00",
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
            $scope.monthYearStart = monthYearStart
            $scope.monthYearEnd = moment(view.end).format("MM-YYYY")
            $scope.viewStart = view.start
            $scope.viewEnd = view.end
            $scope.loadDispos($scope.week, monthYearStart, monthYearEnd ) 

            if ($scope.dispos[$scope.monthYear]) {
               if ($scope.dispos[$scope.monthYear][$scope.week]) {
                if ($scope.dispos[$scope.monthYear][$scope.week].dispos.length == 0) {
                  $scope.forgotShiftsWeek = true
                  $scope.forgotRemarques = true
                };
                if ($scope.dispos[$scope.monthYearEnd][$scope.week]) {
                  if ($scope.dispos[$scope.monthYearEnd][$scope.week].dispos.length == 0) {
                    delete $scope.dispos[$scope.monthYearEnd][$scope.week]
                    $scope.forgotShiftsWeek = true
                    $scope.forgotRemarques = true
                  };
                };
                if ($scope.dispos[monthYearStart][$scope.week].remarques) {
                  $scope.forgotRemarques = false
                };
                if ($scope.dispos[monthYearStart][$scope.week].shiftsWeek) {
                    $scope.forgotShiftsWeek = false
                };
              };
            };
            //different rules if the week starts in different month that it ends
            if (monthYearStart != monthYearEnd) {
              //f there is only the ending month, you should see the shiftsWeek and remarques in both cases
              if ($scope.dispos[monthYearEnd] && !$scope.dispos[monthYearStart]) {
                $scope.dispos[monthYearStart] = {}
                $scope.dispos[monthYearStart][$scope.week] = {}
                if ($scope.dispos[monthYearEnd][$scope.week].shiftsWeek) {
                  $scope.dispos[monthYearStart][$scope.week].shiftsWeek = $scope.dispos[monthYearEnd][$scope.week].shiftsWeek
                  $scope.forgotShiftsWeek = false
                };
                if ($scope.dispos[monthYearEnd][$scope.week].remarques) {
                   $scope.dispos[monthYearStart][$scope.week].remarques =   $scope.dispos[monthYearEnd][$scope.week].remarques
                   $scope.forgotRemarques = false; 
                };
              //if there is the ending month and starting month but nothing in the same week...
              }else if($scope.dispos[monthYearEnd] && !$scope.dispos[monthYearStart][$scope.week] ){
                $scope.dispos[monthYearStart][$scope.week] = {}
                 if ($scope.dispos[monthYearEnd][$scope.week].shiftsWeek) {
                  $scope.dispos[monthYearStart][$scope.week].shiftsWeek = $scope.dispos[monthYearEnd][$scope.week].shiftsWeek
                  $scope.forgotShiftsWeek = false
                };
                if ($scope.dispos[monthYearEnd][$scope.week].remarques) {
                   $scope.dispos[monthYearStart][$scope.week].remarques =   $scope.dispos[monthYearEnd][$scope.week].remarques
                   $scope.forgotRemarques = false; 
                };
              }
            };

              if (!$scope.dispos[$scope.monthYear]) {
                 $scope.forgotShiftsWeek = true
                 $scope.forgotRemarques = true
              }else if( !$scope.dispos[$scope.monthYear][$scope.week] ){
                 $scope.forgotShiftsWeek = true;
                 $scope.forgotRemarques = true
              }

            $('#calendar').fullCalendar('removeEventSource')
            $('#calendar').fullCalendar('removeEvents');
            $('#calendar').fullCalendar('addEventSource', $scope.weekDispos);
            console.log($scope.dispos[monthYearStart][$scope.week])
            console.log($scope.dispos[monthYearEnd][$scope.week])
        },
        select: function(start, end) {
        
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
          console.debug($scope.villes);
          if ($scope.villes.length == 0) {
            $scope.forgotCity = true
          }else{
            $scope.forgotCity = false
          }
       
           //if it has the same starting and ending hours 
           //-> it's all day, restrict the starting and ending hours
           if (startHour == endHour) {
              var allDay = true;
              var startTime = moment(start).hour(4)
              var endTime = moment(end).hour(19)
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
              $scope.forgotCity = false
           }

           //create the dispo variable
           var dispo =  { index : index, title: title, start: startTime,
            end: endTime, stick: true, villes : villes, allDay : allDay, 
            className: className+" data-id="+index
           };
           index++;
          //replace a dispo if selected on the same day
          if ( ($scope.dispos[$scope.monthYear] && $scope.villes.length != 0) || ($scope.dispos[$scope.monthYear]  && dispo.title == 'Absent') ) {
              if ($scope.dispos[$scope.monthYear][$scope.week]) {
                if ($scope.dispos[$scope.monthYear][$scope.week].dispos) {
                  var dispos = $scope.dispos[$scope.monthYear][$scope.week].dispos
                  for (var i = dispos.length - 1; i >= 0; i--) {
                    console.log(moment(dispos[i].start), dispo.start)
                    if( moment(dispos[i].start).isSame(dispo.start,"day") ){
                      $scope.dispos[$scope.monthYear][$scope.week].dispos.splice(i,1)
                      for (var  j = $scope.weekDispos.length - 1; j >= 0; j--) {
                        if( moment($scope.weekDispos[j].start).isSame(dispo.start,"day")){
                          $scope.weekDispos.splice(j,1)                          
                           $('#calendar').fullCalendar('removeEventSource')
                           $('#calendar').fullCalendar('removeEvents');
                           $('#calendar').fullCalendar('addEventSource', $scope.weekDispos);
                          }
                      };
                    }
                  };
                };
              };
           }
          //too short, it will just delete other event
          var dispoStart = moment.duration(dispo.start).asMinutes()
          var dispoEnd = moment.duration(dispo.end).asMinutes()
          if (dispoEnd-dispoStart <= 60 ) {

  
            return
          };
           console.debug($scope.forgotShiftsWeek);
          //show forgot city modal
          if ($scope.forgotCity && dispo.title != 'Absent') {
             var modalInstance = $modal.open({
              template: '<div class="modal-header"> '
             + '<h3 class="modal-title">Erreur</h3> </div>'
             + '  <div class="modal-body"> <p>Sélectionne une ville!</p>'
                    
              +  '</div><div class="modal-footer">'

               +     '<button class="btn btn-primary" ng-click="cancel()">ok</button></div>',
              controller: function($scope, $modalInstance){
                  $scope.cancel = function(){ 
                      $modalInstance.dismiss('cancel'); 
                  }
               },
              size: "sm"
          });
          };
            //show forgot shifts modal
          if ($scope.forgotShiftsWeek &&  dispo.title != 'Absent') {
             var modalInstance = $modal.open({
              template: '<div class="modal-header"> '
             + '<h3 class="modal-title">Erreur</h3> </div>'
             + '  <div class="modal-body"> <p>Mets tes shifts par semaine!</p>'
                    
              +  '</div><div class="modal-footer">'

               +     '<button class="btn btn-primary" ng-click="cancel()">ok</button></div>' ,
              controller: function($scope, $modalInstance){
                  $scope.cancel = function(){ 
                      $modalInstance.dismiss('cancel'); 
                  }
               },
              size: "sm"
          });
          };
            //show forgot remarques modal
          if ($scope.forgotRemarques &&  dispo.title != 'Absent') {
             var modalInstance = $modal.open({
              template: '<div class="modal-header"> '
             + '<h3 class="modal-title">Erreur</h3> </div>'
             + '  <div class="modal-body"> <p>Mets tes remarques!</p>'
                    
              +  '</div><div class="modal-footer">'

               +     '<button class="btn btn-primary" ng-click="cancel()">ok</button></div>',
              controller: function($scope, $modalInstance){
                  $scope.cancel = function(){ 
                      $modalInstance.dismiss('cancel'); 
                  }
               },
              size: "sm"
          });
          };
          //everything ok,  push!!
         if ((!$scope.drag && !$scope.forgotCity && !$scope.forgotShiftsWeek && !$scope.isBefore && !$scope.forgotRemarques) || $scope.dispoType ==false)  {

              //init for the first click
              if (!$scope.dispos[$scope.monthYearStart]) {
                $scope.dispos[$scope.monthYearStart] = {}
              };
              if (!$scope.dispos[$scope.monthYearStart][$scope.week]) {
                $scope.dispos[$scope.monthYearStart][$scope.week] = {}
              };
              if(!$scope.dispos[$scope.monthYearStart][$scope.week].dispos){
                $scope.dispos[$scope.monthYearStart][$scope.week].dispos = []
              }
              if (!$scope.dispos[$scope.monthYearEnd]) {
                $scope.dispos[$scope.monthYearEnd] = {}
              };
              if (!$scope.dispos[$scope.monthYearEnd][$scope.week]) {
                $scope.dispos[$scope.monthYearEnd][$scope.week] = {}
              };
              if(!$scope.dispos[$scope.monthYearEnd][$scope.week].dispos){
                $scope.dispos[$scope.monthYearEnd][$scope.week].dispos = []
              }
              //if the week finished in differents months, do some stuff
              if (moment($scope.viewStart).month() != moment($scope.viewEnd).month() ) {
                  //...so there are no shifts nor remarques yet -> forgot
                  if (!$scope.dispos[$scope.monthYearEnd][$scope.week]) {
                     $scope.forgotShiftsWeek = true;
                     $scope.forgotRemarques = true;
                  }
                  //if you start with ending month, there is no starting month
                  if(!$scope.dispos[$scope.monthYearStart]){
                      $scope.dispos[$scope.monthYear][$scope.week].shiftsWeek = $scope.shiftsWeek
                      $scope.dispos[$scope.monthYear][$scope.week].remarques = $scope.remarques
                      $scope.forgotShiftsWeek = false;
                     $scope.forgotRemarques = false;
                  }
                  //if there is a starting month, copy shifts and remarques to the same week of the next month
                  if ($scope.dispos[$scope.monthYearStart][$scope.week].shiftsWeek) {
                    $scope.dispos[$scope.monthYear][$scope.week].shiftsWeek 
                        = angular.copy($scope.dispos[$scope.monthYearStart][$scope.week].shiftsWeek)
                    $scope.forgotShiftsWeek = false;
                  };
                  //same as above
                  if ($scope.dispos[$scope.monthYearStart][$scope.week].remarques) {
                       $scope.dispos[$scope.monthYear][$scope.week].remarques 
                        = angular.copy($scope.dispos[$scope.monthYearStart][$scope.week].remarques)          
                       $scope.forgotRemarques = false;
                  };

              };
              dispo.villes = angular.copy($scope.villes)
              $scope.dispos[$scope.monthYear][$scope.week].dispos.push(dispo)
              $scope.weekDispos.push(dispo)
              console.log( $scope.dispos)
          };
        },//end select
        /*
          add cities to dispo cell
        */
        eventAfterRender: function(evento, element) {
         if (evento.villes != null  && evento.title != "Absent") {
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
    console.log($scope.monthYearStart, $scope.monthYearEnd,number)
    if(!number){
      $scope.forgotShiftsWeek = true
      return
    }
    $scope.shiftsWeek = number;
    $scope.forgotShiftsWeek = false
    if (!$scope.dispos[$scope.monthYear]) {
      $scope.dispos[$scope.monthYear] = {}
    };
    if (!$scope.dispos[$scope.monthYear][$scope.week]) {
      $scope.dispos[$scope.monthYear][$scope.week] = {}
    };
    $scope.dispos[$scope.monthYear][$scope.week].shiftsWeek = number

    if (moment($scope.viewStart).month() != moment($scope.viewEnd).month() ) {
       if (!$scope.dispos[$scope.monthYearEnd]) {
          $scope.dispos[$scope.monthYearEnd] = {}
        };
        if (!$scope.dispos[$scope.monthYearEnd][$scope.week]) {
          $scope.dispos[$scope.monthYearEnd][$scope.week] = {}
        };
      $scope.dispos[$scope.monthYearEnd][$scope.week].shiftsWeek = number
    }; 
  }
  $scope.inputRemarques =function (remarques){
   
    if (!remarques ||  remarques == '') {
       remarques = 'Pas de remarques';
     }
   
    $scope.remarques = remarques;
    $scope.forgotRemarques = false

    if (!$scope.dispos[$scope.monthYear]) {
      $scope.dispos[$scope.monthYear] = {}
    };
    if (!$scope.dispos[$scope.monthYear][$scope.week]) {
      $scope.dispos[$scope.monthYear][$scope.week] = {}
    };

   
    if (moment($scope.viewStart).month() != moment($scope.viewEnd).month() ) {

     if (!$scope.dispos[$scope.monthYearEnd]) {
        $scope.dispos[$scope.monthYearEnd] = {}
      };
      if (!$scope.dispos[$scope.monthYearEnd][$scope.week]) {
        $scope.dispos[$scope.monthYearEnd][$scope.week] = {}
      };
      $scope.dispos[$scope.monthYearEnd][$scope.week].remarques = remarques

    }; 

   $scope.dispos[$scope.monthYearStart][$scope.week].remarques = remarques
   $scope.dispos[$scope.monthYearEnd][$scope.week].remarques = remarques
   console.debug($scope.dispos[$scope.monthYearStart]);
    console.debug($scope.dispos[$scope.monthYearStart][$scope.week]);
    console.debug($scope.dispos[$scope.monthYearStart]);
    

    console.debug(remarques);

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
      for(var month in $scope.user.dispos){
        if (monthYear == month &&  $.inArray(monthYear, $scope.alreadySeen) == -1 ) {
          $scope.alreadySeen.push(monthYear)

          for(var week in $scope.user.dispos[monthYear]){
            if ($scope.user.dispos[monthYear][week].dispos) {
               for (var i = $scope.user.dispos[monthYear][week].dispos.length - 1; i >= 0; i--) {
               $scope.weekDispos.push($scope.user.dispos[monthYear][week].dispos[i])
            };
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
   console.log($scope.dispos)
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
$scope.checkForgots = function(){
       //show forgot city modal
      if ($scope.forgotCity) {
         var modalInstance = $modal.open({
          template: '<div class="modal-header"> '
         + '<h3 class="modal-title">Erreur</h3> </div>'
         + '  <div class="modal-body"> <p>Sélectionne une ville!</p>'
                
          +  '</div><div class="modal-footer">'

           +     '<button class="btn btn-primary" ng-click="cancel()">ok</button></div>',
          controller: function($scope, $modalInstance){
              $scope.cancel = function(){ 
                  $modalInstance.dismiss('cancel'); 
              }
           },
          size: "sm"
      });
      };
        //show forgot shifts modal
      if ($scope.forgotShiftsWeek) {
         var modalInstance = $modal.open({
          template: '<div class="modal-header"> '
         + '<h3 class="modal-title">Erreur</h3> </div>'
         + '  <div class="modal-body"> <p>Mets tes shifts par semaine!</p>'
                
          +  '</div><div class="modal-footer">'

           +     '<button class="btn btn-primary" ng-click="cancel()">ok</button></div>' ,
          controller: function($scope, $modalInstance){
              $scope.cancel = function(){ 
                  $modalInstance.dismiss('cancel'); 
              }
           },
          size: "sm"
      });
      };
        //show forgot remarques modal
      if ($scope.forgotRemarques ) {
         var modalInstance = $modal.open({
          template: '<div class="modal-header"> '
         + '<h3 class="modal-title">Erreur</h3> </div>'
         + '  <div class="modal-body"> <p>Mets tes remarques!</p>'
                
          +  '</div><div class="modal-footer">'

           +     '<button class="btn btn-primary" ng-click="cancel()">ok</button></div>',
          controller: function($scope, $modalInstance){
              $scope.cancel = function(){ 
                  $modalInstance.dismiss('cancel'); 
              }
           },
          size: "sm"
      });
      };
      if ($scope.forgotRemarques || $scope.forgotShiftsWeek) {
        return true;
      };
}
    $(document).ready(function(){
      //for checking on week change
      $("body").on('mouseup',".fc-prev-button",function(e){
        console.log($scope.monthYearEnd, $scope.monthYearStart)
        if($scope.dispos[$scope.monthYearEnd] || $scope.dispos[$scope.monthYearStart]){
          if ($scope.dispos[$scope.monthYearEnd][$scope.week] || $scope.dispos[$scope.monthYearStart][$scope.week] ) {
            if ($scope.dispos[$scope.monthYearEnd][$scope.week].dispos.length > 0   ||  $scope.dispos[$scope.monthYearStart][$scope.week].dispos.length >0  ) {  
              // if ($scope.checkForgots()) {
              //     $("#calendar").fullCalendar('next')
              //     return
              // };
            };
          };
        }
      })
      $("body").on('mouseup',".fc-next-button",function(e){
        if($scope.dispos[$scope.monthYearEnd] || $scope.dispos[$scope.monthYearStart]){
          if ($scope.dispos[$scope.monthYearEnd][$scope.week] || $scope.dispos[$scope.monthYearStart][$scope.week] ) {
            if ($scope.dispos[$scope.monthYearEnd][$scope.week].dispos.length > 0  ||  $scope.dispos[$scope.monthYearStart][$scope.week].dispos > 0  ) {
              //  if ($scope.checkForgots()) {
              //    $("#calendar").fullCalendar('prev')
              //   return
              // };
            };
          };
        }
      })
    })
  });
