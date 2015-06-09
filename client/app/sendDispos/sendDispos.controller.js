'use strict';

angular.module('velociteScheduleApp')
  .controller('SendDisposCtrl', function ($scope, $modal) {

	var date = new Date();
	var d = date.getDate();
	var m = date.getMonth();
	var y = date.getFullYear();
	  $scope.events =  []
    $scope.eventSources = [$scope.events];
    $scope.dispoType  = true; // true = disponible, false = absent
    var index = 0; //for event delete


     /* config calendar */
    $scope.calendarConfig = {
      calendarDispos:{
        height: 700,
     // eventDurationEditable: true,
        firstDay: 1, //monday
        lang : 'fr',
        selectHelper: true,
        selectable:true, //time range
        editable: true,
        minTime: "06:00:00", //
	     	maxTime: "21:00:00",
        header:{
          left: 'month agendaWeek',
          center: 'title',
          right: 'today prev,next'
        },
        defaultView: 'agendaWeek',

        dayClick: function(date, jsEvent, view) {
          console.log('Clicked on: ' + date.format());
          if (date.hasTime()) {
            console.log(date);
          };
   
        },
        select: function(start, end) {
         if ($scope.dispoType == true) {
            var className = "presentDispo"; //blue
            var title = "Dispo"
         }else{
            var className = "absentDispo"; //red
            var title = "Absent"
         }
          var eventer =  { 
            index : index,
          	title: title,
          	start: start,
          	end: end,
            stick: true,
            className: className+" data-id="+index
          }
         index++;

         $scope.events.push(eventer)
        
        },
        eventClick: function(calEvent, jsEvent, view){
          console.log(calEvent)
          var modalInstance = $modal.open({
            templateUrl: 'app/modalRemoveDispo/modalRemoveDispo.html',//par rapport a l index.html
            controller: 'ModalRemoveDispoCtrl',
            size: "sm",
            resolve: {
              index : function(){
                return calEvent.index;
              }
            }
          });
           modalInstance.result.then(function (index) {
              $scope.deleteEvent(index);
           })
            
        },  

        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
  	}//calendarConfig


  	//other options
  	$scope.deleteEvent = function(index){
      console.log('delete' +index)
      $scope.events.splice(index,1)	
    }
    $scope.toggleDispoType = function(){
      if ($scope.dispoType ==  true) {
        $scope.dispoType = false;
      }else{
        $scope.dispoType = true;
      }
    }

  });
