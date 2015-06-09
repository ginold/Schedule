'use strict';

angular.module('velociteScheduleApp')
  .controller('MainCtrl', function ($scope, $http) {

    $scope.eventSources = [];

     /* config calendar */
    $scope.calendarConfig = {
      calendarCoursier:{
        height: 500,
     //   eventDurationEditable: true,
        firstDay: 1, //monday
        lang : 'fr',
        selectHelper: true,
        selectable:true, //time range
        header:{
          left: 'month agendaWeek',
          center: 'title',
          right: 'today prev,next'
        },
        dayClick: function(date, jsEvent, view) {
          console.log('Clicked on: ' + date.format());
        },
        select: function(date, jsEvent, view) {
          console.log('select on: ' + date.format());
        },
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        console.log = (date.title + ' was clicked ');
    };
    /* alert on Drop */
     $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view){
        console.log = ('Event Droped to make dayDelta ' + delta);
    };
    /* alert on Resize */
    $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view ){
       console.log = ('Event Resized to make dayDelta ' + delta);
    };



  });
