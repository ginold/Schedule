'use strict';

angular.module('velociteScheduleApp')
  .controller('ShiftDetailsCtrl', function ($scope, $http, $state, shiftService) {
  	$scope.showAddCoursiers = false;
  	$scope.selectedCoursiers = [];

  	shiftService.getShift($state.params.shiftId, function(shift){
  		$scope.shift = shift;
  	});

    $scope.back =function(){
    	$state.go("^");
    }
   	$scope.loadCoursiers = function () {
		var coursiersArray = [];
		var nonDuplicatedArray = []
		$http.get("api/users").success(function (coursiers) {
			var merge = coursiers.concat($scope.shift.coursiers)

			$scope.showAddCoursiers = true;
			$scope.coursiers = coursiersArray
		 	console.debug(coursiersArray);
		    console.log($scope.shift.coursiers)
		})

   	}
   	$scope.addCoursiers = function (coursiers) {
   		console.log(coursiers)
   		console.log($scope.shift.coursiers)
   		 $http({
            method: 'PUT',
            url: "/api/shifts/"+$scope.shift._id,
            data: {
            	coursiers:coursiers
            }
          }).success(function(data, status){ 
          	console.log(data)
          	console.log(status)
          })
   	}
   	
});
