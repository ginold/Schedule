'use strict';

angular.module('velociteScheduleApp')
  .controller('CreateShiftCtrl', function ($scope, User, $http, calendarService) {
  	//time picker for inputs
    $(document).ready(function(){
    	$('input[type="time"]').timepicker({
    		timeFormat : 'H\\:i',
    		disableTimeRanges: [['00:00am', '6:00am'], ['09:00pm', '00:00pm']]
    	});
    });
    // Use the User $resource to fetch all users
    $scope.users = User.query();
    $scope.shift ={};
    $scope.shift.coursiers = null;

     //months for periode de validite
    $scope.months = calendarService.getMonths();
   // console.log($scope.months)

    $scope.createShift = function(shift){
    	$http({
            method: 'POST',
            url: "/api/shifts",
            data: shift
          }).success(function(data, status){       
             console.log(data);
             console.log(status);

          }).error(function(err){
            console.log('nope');
          }) 
    }
    $scope.formatMinutes = function(minutes){
    	console.log(minutes)
    	if (minutes==0) {
    		return "00";
    	}else{
    		return minutes;
    	}
    }
    //todo
    $scope.checkAll = function(coursiers) {
    	console.log(coursiers)
    	if (coursiers == null || coursiers.length == 0) {
    		$scope.shift.coursiers = angular.copy($scope.users)
    	}else{
    		$scope.shift.coursiers = [];
    	}
    };


  });
