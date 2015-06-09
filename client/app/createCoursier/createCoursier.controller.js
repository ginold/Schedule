'use strict';

angular.module('velociteScheduleApp')
  .controller('CreateCoursierCtrl', function ($scope,Auth, $modal) {
  	//init false by default
    $scope.user = {
    	ag : false,
    	permis : false,
    	mobility : false
    };


    $scope.createCoursier = function(user){
    	console.log(user)
    	 $scope.submitted = true;
    	 //if(form.$valid) {
	        Auth.createUser(user)
		        .then( function() {
		          // Account created, redirect to home
		           var modalInstance = $modal.open({
		            template: '<h2>Vous avez bien créé le coursier</h2>',//par rapport a l index.html
		            controller: 'CreateCoursierCtrl',
		            size: "sm"
		          });
		        })
		        .catch( function(err) {
		        	console.log(err)
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
  });
