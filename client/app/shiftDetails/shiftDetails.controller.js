'use strict';

angular.module('velociteScheduleApp')
  .controller('ShiftDetailsCtrl', function ($scope, $http, $state, shiftService) {
  	$scope.showAddCoursiers = false;
  	$scope.selectedCoursiers = [];
    $scope.villes = shiftService.getCities()
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
         // console.debug(shiftService.containsAll(shift.competences, coursier.competences));
          if (shiftService.containsAll($scope.shift.competences, coursier.competences)) {
            $scope.coursiers.push(coursier)
          };
        })
  			$scope.showAddCoursiers = true;
  		});
   	}
    $scope.loadCoursiers()

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
    $scope.editStart = function(start){
       $http({
            method: 'PUT',
            url: "/api/shifts/"+$scope.shift._id+"/editStart",
            data: {
              start:start
            }
          })
    }
    $scope.editEnd = function(end){
       $http({
            method: 'PUT',
            url: "/api/shifts/"+$scope.shift._id+"/editEnd",
            data: {
              end:end
            }
          })
    }
    $scope.editCity = function(city){
       $http({
            method: 'PUT',
            url: "/api/shifts/"+$scope.shift._id+"/editCity",
            data: {
              city:city
            }
          })
    }
    $scope.editName = function(name){
       $http({
            method: 'PUT',
            url: "/api/shifts/"+$scope.shift._id+"/editName",
            data: {
              name:name
            }
          })
    }
  
   	
});
