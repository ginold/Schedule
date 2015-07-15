'use strict';

angular.module('velociteScheduleApp')
  .controller('SendDisposCtrl', function ($scope, $modal,calendarService) {

  //var $doc = angular.element(document);
  var index = 0; //for event delete
  //checkbox default  checked
  $scope.laus_check = false;
  $scope.yv_check = false;
  $scope.neuch_check = false;

  $scope.months = calendarService.getMonths();
  $scope.monthYear;
  $scope.dispos = {};
  $scope.villes = [];
  $scope.forgotCity = false;
  $scope.forgotShiftsWeek = false
  $scope.weekDispos =  []; // everyday dispo per week
  $scope.eventSources = [$scope.weekDispos];
  $scope.dispoType  = true; // true = disponible, false = absent


  /* config calendar */
  $scope.calendarConfig = {    
    calendarDispos:{
      height: 660,
      firstDay: 1, //monday
      lang : 'fr',
      selectHelper: true,
      selectable:true, //time range
      editable: false,
      timezone: 'local',
      minTime: "06:00:00", 
     	maxTime: "21:00:00",
      header:{
        left: 'month agendaWeek',
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
          var monthYear = moment(view.start._d).format("MM-YYYY");
          //init name of the displayed month
          //$scope.monthYear = moment(view.start._d).format("MM-YYYY")

          //useful for displaying month names in veryfiDispos.html
          // for example 28 juin - 2 juillet
          if (monthEnd == monthStart) {
             $scope.week = weekStart+" - "+weekEnd+" "+$scope.months[monthStart]
          }else{
             $scope.week = weekStart+" "+$scope.months[monthStart]+" - "+weekEnd+" "+$scope.months[monthEnd]
          }
            $scope.monthYear = monthYear         
      },
      select: function(start, end) {
        console.log('start week '+moment(start).startOf('week').toDate())
        console.log('end week '+moment(end).endOf('week').toDate())
        //select a city and a nb of shifts/week first
        if ($scope.villes.length != 0 && typeof $scope.shiftsWeek != 'undefined') {
          $scope.monthYear = moment(start._d).format("MM-YYYY");
          var startHour = start._d.getHours()+":"+start._d.getMinutes();
          var endHour = end._d.getHours()+":"+end._d.getMinutes();

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
         }
         //create the dispo variable
         var dispo =  { index : index, title: title, start: startTime,
          end: endTime, stick: true, villes : villes, allDay : allDay, 
          className: className+" data-id="+index
         };
         index++;
      
        //push to dispos for the user

        //init for the first click

         if (typeof $scope.dispos[$scope.monthYear] != "undefined") {
            if (typeof $scope.dispos[$scope.monthYear][$scope.week] !="undefined") {
              //everything is already init, so we can push    
                $scope.forgotCity = false;
                //push to calendar for all dispos
                dispo.villes = angular.copy($scope.villes)
                $scope.weekDispos.push(dispo); 
                $scope.dispos[$scope.monthYear][$scope.week].dispos.push(dispo)
                $scope.dispos[$scope.monthYear][$scope.week].shiftsWeek = $scope.shiftsWeek;
                $scope.dispos[$scope.monthYear][$scope.week].remarques = $scope.remarques 
            }else{//forgot to define WEEK
                $scope.forgotCity = false;
                $scope.forgotShiftsWeek = false;
                dispo.villes = angular.copy($scope.villes)
                $scope.dispos[$scope.monthYear][$scope.week] = {}
                $scope.dispos[$scope.monthYear][$scope.week].dispos = [];
                $scope.dispos[$scope.monthYear][$scope.week].dispos.push(dispo)
                $scope.dispos[$scope.monthYear][$scope.week].shiftsWeek = $scope.shiftsWeek;
                $scope.dispos[$scope.monthYear][$scope.week].remarques = $scope.remarques 
                $scope.weekDispos.push(dispo); 
                console.log($scope.dispo)
                //you forgot to select a city
   
   
            } 
        }else{//[$scope.monthYear] != "undefined",set month & week everything -> push
          $scope.forgotCity = false;
          $scope.forgotShiftsWeek = false;
          dispo.villes = angular.copy($scope.villes)
          $scope.dispos[$scope.monthYear] = {}
          $scope.dispos[$scope.monthYear][$scope.week] = {}
          $scope.dispos[$scope.monthYear][$scope.week].dispos = [];
          $scope.dispos[$scope.monthYear][$scope.week].dispos.push(dispo)
          $scope.dispos[$scope.monthYear][$scope.week].shiftsWeek = $scope.shiftsWeek;
          $scope.dispos[$scope.monthYear][$scope.week].remarques = $scope.remarques 
          $scope.weekDispos.push(dispo); 
        }//you forgot to select a city
       }else{//FORGOT TO SELECT A CITY or SHIFTS/WEEK
          if ($scope.villes.length == 0) {
            $scope.forgotCity = true;
          }else{
             $scope.forgotCity = false;
          }
          if (typeof $scope.shiftsWeek == "undefined") {
            $scope.forgotShiftsWeek = true;
          }else{
            $scope.forgotShiftsWeek = false;
          }
       }         
      console.log($scope.dispos)
        
      },//end select

      eventClick: function(calEvent, jsEvent, view){
        var modalInstance = $modal.open({
          templateUrl: 'app/modalRemoveDispo/modalRemoveDispo.html',//par rapport a l index.html
          controller: 'ModalRemoveDispoCtrl',
          size: "sm",
          resolve: {// what we send to the modal  as 'index'
            index : function(){
              return calEvent.index;
            }
          }
        });//after closing OK the modal, we receive the result
         modalInstance.result.then(function (index) {
            $scope.deleteEvent(index);
         })     
      },
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
$scope.inputShiftsWeek = function(number){
  $scope.shiftsWeek = number;
}
$scope.inputRemarques =function (remarques){
  $scope.remarques = remarques;
}

  //todo - delete id
	$scope.deleteEvent = function(index){
    
      for (var i = $scope.weekDispos.length - 1; i >= 0; i--) {
       if ($scope.weekDispos[i].index == index) {
          $scope.weekDispos.splice(i,1)
       };
      };  
      for (var month in $scope.dispos) {
        for(var week in $scope.dispos[month]){
          for (var i = $scope.dispos[month][week].dispos.length - 1; i >= 0; i--) {
            if($scope.dispos[month][week].dispos[i].index == index){
              $scope.dispos[month][week].dispos.splice(index, 1)
            }
          };
          
        }
      };  
    	
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


  /*
    handle 1, 2 and 3 keypress 
    for quick city checkbox
  */
$(document).keypress(function(e) {
  // console.debug(e);
  //   if (event.keyCode == 49) {
  //     if ($scope.laus_check) {
  //       $scope.laus_check = false
  //     }else{
  //       $scope.laus_check = true;
  //     }
  //   };
  //   if (event.keyCode == 50) {
  //    if ($scope.yv_check) {
  //     $scope.yv_check= false;
  //    }else{
  //     $scope.yv_check = true
  //    }
  //   };
  //   if (event.keyCode == 51) {
  //    if ($scope.neuch_check) {
  //     $scope.neuch_check = false;
  //    }else{
  //     $scope.neuch_check = true
  //    }
      
    //};
    console.debug($scope.neuch_check, $scope.yv_check, $scope.laus_check);
});


  

  });
