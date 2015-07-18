'use strict';

angular.module('velociteScheduleApp')
  .controller('MonthYearCtrl', function ($scope, $http,calendarService) {
    $scope.months = calendarService.getMonths();
    var date = new Date()
    $scope.years = [2014, 2015, 2016, 2017,2018]
    $scope.currentMonth = date.getMonth()
    $scope.currentYear = date.getFullYear()
    $scope.year = $scope.currentYear
    $scope.monthYears = {}

    $scope.isAnterior =function(monthYear){
    	var monthDate = moment(monthYear.name, "MM-YYYY")
    	var currMonthDate = moment(date)
    	if ( moment(currMonthDate).isBefore(monthDate) || moment(currMonthDate).isSame(monthDate,"month") ) {
    		return false
    	}else{
    		return true;
    	}
    } 

  
    $scope.openMonth = function (month){
    	$http({
            method: 'PUT',
            url: "/api/monthYears/"+month._id+"/open",
            data: {
              active : true
            }
          })
    	for (var i = $scope.monthYears.length -1; i >= 0; i--) {

    		if($scope.monthYears[i]._id == month._id){
    			$scope.monthYears[i].active = true;
    			return
    		}
    	};
    }
    $scope.closeMonth = function (month){
    	$http({
            method: 'PUT',
            url: "/api/monthYears/"+month._id+"/close",
            data: {
              active : false
            }
          })
    	for (var i = $scope.monthYears.length - 1; i >= 0; i--) {
    		if($scope.monthYears[i]._id == month._id){
    			$scope.monthYears[i].active = false;
    			return
    		}
    	};
    }


    $scope.initMonthYears = function(year){
    	for (var i = 0; i < $scope.months.length ; i++) {
    		var monthYear = moment(new Date(year, i, 1)).format("MM-YYYY")
    		$http({
            method: 'POST',
            url: "/api/monthYears",
            data: {
            	year : year,
            	active : false,
            	monthNum : i,
            	monthName : $scope.months[i],
            	name : monthYear
            }
          }).success(function(data, status){    
             console.log(data);
             console.log(status);
          }).error(function(err){
            console.log(err);
          }) 
    	};
    	$scope.getMonthYears(year)
   	}
   	$scope.getMonthYears = function(year){
       $http.get("api/monthYears/year/"+year).success(function(monthYears, status) {
			if (monthYears.length == 0) {
				$scope.initMonthYears($scope.year)
			}else{
				$scope.monthYears = monthYears
			}
    	}).error(function(err){
    		console.debug(err);
    	})
     }
     $scope.getMonthYears($scope.currentYear)



    	

})
