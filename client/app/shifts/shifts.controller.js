'use strict';

angular.module('velociteScheduleApp')
  .controller('ShiftsCtrl', function ($scope,$rootScope, $http, $state) {
    
    $http.get("/api/shifts").success(function(shifts){
    	$scope.shifts = shifts;
    })

    $scope.shiftDetails = function(shiftId){
    	$state.go('shifts.details', {shiftId:shiftId}); //get it from shifts.html ng-click
     	$rootScope.$on('$stateChangeError', 
function(event, toState, toParams, fromState, fromParams, error){ console.log("fail") })
    }
    	
    
});
