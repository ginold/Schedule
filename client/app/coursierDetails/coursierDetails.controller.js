'use strict';

angular.module('velociteScheduleApp')
  .controller('CoursierDetailsCtrl', function ($scope,$http, $state, shiftService) {

    $http.get("api/users/"+$state.params.coursierId).success(function(coursier){
    	$scope.user = coursier;
        //if user has no departure date, set it to YES (will display "actif : oui ")
        if(!$scope.user.departOn){
            $scope.user.departOn = "Oui"
        }else{
            $scope.user.departOn = moment($scope.user.departOn).format("dddd D MMMM YYYY")
        }
    })
    $scope.addCompetences = false;
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
    $scope.deactivateCoursier = function(user){
        var departOn = new Date()
        user.departOn = departOn
       $http({
            method: 'PUT',
            url: "/api/users/deactivateCoursier",
            data: {
                coursier:  user
            }
          }).success(function(data, status){ 
            console.debug(data);
             $scope.user.departOn = moment(departOn).format("dddd D MMMM YYYY")
          }).error(function(err){
            console.debug(err);
          })

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
