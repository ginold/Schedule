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
    /*
      loads the only coursiers that the shift 
      doesnt have yet.
    */
   	$scope.loadCoursiers = function () {
      $scope.coursiers = []
  		$http.get("api/users").success(function (coursiers) {
  			$.each(coursiers, function(i, coursier){
          $.each($scope.shift.coursiers, function (j, coursierToDel) {
            if (coursier._id == coursierToDel._id) {
              delete coursiers[i];
            };
          })
        })
  			$scope.showAddCoursiers = true;
        $scope.coursiers = coursiers;
  		});
   	}

    /*
      update the shift with new coursiers
    */
   	$scope.addCoursiers = function (coursiers) {
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
