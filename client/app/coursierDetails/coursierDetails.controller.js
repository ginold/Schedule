'use strict';

angular.module('velociteScheduleApp')
  .controller('CoursierDetailsCtrl', function ($scope,$http, $state, shiftService) {
    $http.get("api/users/"+$state.params.coursierId).success(function(coursier){
    	$scope.user = coursier;
    })
    $scope.addCompetences = true;
     $scope.back =function(){
    	$state.go("^");
    }

    $scope.showCompetences = function(){
    	var competences = shiftService.getCompetences()
    	$.each($scope.user.competences, function(j, userComp){
    		$.each(competences,function(i,competence){
    			if (userComp == competence) {
    				 competences.splice(i,1)
    			};
    		})
    	})
    	$scope.competences = competences
    	$scope.addCompetences = true;

    }

    $scope.add = function(competences){
    	Array.prototype.push.apply(competences, $scope.user.competences);
    	 $http({
            method: 'PUT',
            url: "/api/users/addCompetences",
            data: {
            	competences:competences,
            	id: $scope.user._id
            }
          }).success(function(data, status){ 
          	$scope.user.competences = competences;
          	$scope.showCompetences()
          })
    }
  });
