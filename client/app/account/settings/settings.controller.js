'use strict';

angular.module('velociteScheduleApp')
  .controller('SettingsCtrl', function ($scope, User, Auth) {
    $scope.errors = {};

   
    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
		};
/////////////////////////////////////////////////

    var date = new Date();
    var days = ['di','lu','ma','me','je','ve','sa'] //0 = dimanche, 1 = lundi with .getDay()
    var months = ['Janvier','Février','Mars','Avril',"Mai",'Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

    $scope.monthNum = date.getMonth();
    $scope.year = date.getFullYear();
    $scope.users = User.query();

$scope.getCoursierDay =function(event){

  var date = event.currentTarget.attributes['data-day'].nodeValue;
  console.log(moment(date, "D-M-YYYY")._d)
  console.log(event.currentTarget.attributes['data-coursierName'])
}



$scope.renderCalendar= function(month, year){
  var monthInt = parseInt(month);
  $scope.monthNum =  monthInt+1;
  $scope.calendar = {
      year : year, //selected year
      month: months[month], //selected month ('janvier','fevrier')
      monthNames: months,// array of mont hames
      daysNames : getDaysArray(year, month), // get day name for each day of month
      days : new Date(year, monthInt+1,0).getDate()//number of days in month

    }
}
$scope.renderCalendar($scope.monthNum,$scope.year)

    
function getDaysArray(year, month) {
      var date = new Date(year, month, 1);
      var result = [];
      while (date.getMonth() == month) {
        result.push(days[date.getDay()]);
        date.setDate(date.getDate()+1);
      }
      return result;
}
    console.log($scope.calendar)

  })
  .filter('range', function() {
    return function(input, total) {
      total = parseInt(total);
      for (var i=0; i<total; i++)
        input.push(i);
      return input;
    };
});
