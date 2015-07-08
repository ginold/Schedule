'use strict';

angular.module('velociteScheduleApp')
  .controller('ShiftsCtrl', function ($scope, $http, $state, shiftService) {
    
    $http.get("/api/shifts").success(function(shifts){
    	//shiftService.formatHoursMinutes(shifts);
    	shiftService.formatCities(shifts);
    	$scope.shifts = shifts;
    })

});
