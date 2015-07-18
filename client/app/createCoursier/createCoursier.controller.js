'use strict';

angular.module('velociteScheduleApp')
  .controller('CreateCoursierCtrl', function ($scope,Auth, $modal,shiftService, $http) {
  	$scope.competences = shiftService.getCompetences()
  	$scope.invalidNo = false;


  	//init false by default
    $scope.user = {
    	ag : false,
    	permis : false,
    	mobility : false
    };

   	$http.get('api/users').success(function(users){
		$scope.user.numeroCoursier =  users.length+1
		$scope.users = users;
	})


    $scope.createCoursier = function(user){   	

    	console.log(user);
    	 $scope.submitted = true;
    	 //if(form.$valid) {
	        Auth.createUser(user)
		        .then( function() {
		          // Account created, redirect to home
		           var modalInstance = $modal.open({
		            templateUrl: 'app/createCoursier/createCoursierModal.html',//par rapport a l index.html
		            controller: function($scope, $modalInstance){
	                  $scope.cancel = function(){ $modalInstance.dismiss('cancel'); }
	                  },
		            size: "sm"
		          });
		        })
		        .catch( function(err) {
		        	console.log(err)
		        	var modalInstance = $modal.open({
		            template: "<h2>Erreur s'\est produite",//par rapport a l index.html
		            controller: function($scope, $modalInstance){
		                  $scope.cancel = function(){ $modalInstance.dismiss('cancel'); }
		                  },
		            size: "sm"
		          });
		          err = err.data;
		          $scope.errors = {};

		          // Update validity of form fields that match the mongoose errors
		          angular.forEach(err.errors, function(error, field) {
		            form[field].$setValidity('mongoose', false);
		            $scope.errors[field] = error.message;
		          });
		     	});
		  //} 
    }//create coursier

    $scope.okModal = function(){
    	$modalInstance.dismiss('cancel');
    }

  }).directive("validateNo", function() {
    return {
    	scope:{
    		numero : "=",
    		coursiers : "=",
    	},
        link: function(scope, elem, attrs) {
        	scope.$watch("numero",function(newNo, oldNo){
    		 	for (var i = scope.coursiers.length - 1; i >= 0; i--) {
               		if(scope.coursiers[i].numeroCoursier == newNo){
               			scope.$parent.invalidNo = true;
               			return;
               		}else{
               			scope.$parent.invalidNo = false;
               		}
          		 };
        	})//watch

        }
    }

})
