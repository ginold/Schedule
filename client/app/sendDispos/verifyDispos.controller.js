'use strict';

angular.module('velociteScheduleApp')
  .controller('VerifyDisposCtrl', function ($scope, $state, Auth, $http, $modal) {
  	$scope.dispos = $state.params; //used in ng-click sendDispos(dispos)
  	$scope.noDispos = true;


    $scope.verify = function(dispos){
		$scope.month = dispos[Object.keys(dispos)[0]]; //returns the containings of the month object.
	    var weeks = [];	// nb shift, remarques & dispos per week
	    var names = []; //ex 10 - 17 juin
	    var index = 0;
	    //if some dispos have been entered
	    if($scope.dispos.dispos != null){
	    	for (var month in $scope.month) {
    		for (var week in $scope.month[month]){
    			if ($scope.month[month][week].dispos.length == 0) {
    				$scope.noDispos = true;
    			}else{
    				$scope.noDispos = false;
    				weeks[index] = $scope.month[month][week];
	    			names[index] = week;
	    			index++;
    			}
    		}
    	};
			$scope.weeks = weeks;
			$scope.names = names;		
		//if not, show info
	    }else{
	    	$scope.noDispos = true;
	    }
    	
    }
    $scope.verify($scope.dispos)


    /*
    	update the user with given availbilities
    	@dispos - availbilites object
    */
    $scope.sendDispos = function(dispos){
    	$scope.user = Auth.getCurrentUser();
    	var dispo = dispos[Object.keys(dispos)[0]]; //one level lower in object
    	
    	$http({
            method: 'PUT',
            url: "/api/users/"+$scope.user._id+"/dispos",// in server->user->index.js & user.controller
            data: { dispos : dispo, id : $scope.user._id }
        })
    	.success(function(data, status){   
          	$scope.$emit("dispoUpdate");    
             console.log(data);
             console.log('sucess updating dispos');

            var modalInstance = $modal.open({
	            templateUrl: 'app/sendDispos/disposSent.html',//par rapport a l index.html
	            controller: function($scope, $modalInstance){
				    $scope.cancel = function(){ $modalInstance.dismiss('cancel'); }
				 },
	            size: "sm"
	       	});
		})
	    .error(function(err){
	      	console.log('error while updating dipos!')
	        console.log(err);
	    }) 

    }
    $scope.back = function(){
    	$state.go("^");
    }
	
})