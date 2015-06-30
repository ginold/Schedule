'use strict';

angular.module('velociteScheduleApp')
  .controller('CreateCoursierCtrl', function ($scope,Auth, $modal) {
  	//init false by default
    $scope.user = {
    	ag : false,
    	permis : false,
    	mobility : false
    };
    $scope.okModal = function(){
    	$modalInstance.dismiss('cancel');
    }

    $scope.createCoursier = function(user){
    	console.log(user)
    	 $scope.submitted = true;
    	 //if(form.$valid) {
	        Auth.createUser(user)
		        .then( function() {
		          // Account created, redirect to home
		           var modalInstance = $modal.open({
		            templateUrl: 'app/createCoursier/createCoursierModal.html',//par rapport a l index.html
		            controller: 'CreateCoursierCtrl',
		            size: "sm"
		          });
		        })
		        .catch( function(err) {
		        	console.log(err)
		        	var modalInstance = $modal.open({
		            template: "<h2>Erreur s'\est produite",//par rapport a l index.html
		            controller: 'CreateCoursierCtrl',
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
  });
