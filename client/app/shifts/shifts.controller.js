'use strict';

angular.module('velociteScheduleApp')
  .controller('ShiftsCtrl', function ($scope, $http, $state, shiftService) {
    
    $http.get("/api/shifts").success(function(shifts){
    	$scope.shifts = shifts;
    })

});
