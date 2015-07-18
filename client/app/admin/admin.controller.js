'use strict';

angular.module('velociteScheduleApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User, calendarService) {
    var date = new Date()
    var monthYear = moment(date).format("MM-YYYY")
    $scope.monthNames = calendarService.getMonths()// jan fev mars...
    $scope.years = [2015, 2016, 2017,2018]
    $scope.currentMonth = date.getMonth()
    $scope.currentYear = date.getFullYear()
    $scope.year = $scope.currentYear
    $scope.checkDispos = ''


    //Get all users and format 'coursier depuis'
    $http.get("api/users").success(function(users){
      $scope.total  = users.length
      for (var i = users.length - 1; i >= 0; i--) {
        users[i].createdOn = moment(users[i].createdOn).format("D MMMM YYYY")
        if (!users[i].departOn) {
          users[i].departOn = "présent"
        }else{
            users[i].departOn = moment(users[i].departOn).format("dddd D MMMM YYYY")
        }
      };
      $scope.users = users
      $scope.checkGivenDispos($scope.currentMonth, $scope.currentYear)
    })


   $scope.checkGivenDispos = function(month, year){
     var date = new Date(year, month, 1)
     var monthYear = moment(date).format("MM-YYYY")
     var users = $scope.users
      for (var i = users.length - 1; i >= 0; i--) {
         if (users[i].dispos) {
           if(users[i].dispos.hasOwnProperty(monthYear)){
              $scope.users[i].gaveDispos = true;
           }
           if(!users[i].dispos.hasOwnProperty(monthYear) || Object.keys(users[i].dispos[monthYear]).length == 0){

            $scope.users[i].gaveDispos = false;
           }
       }else{
           $scope.users[i].gaveDispos = false;
       }
      };
      $scope.users = users
     for (var i =  $scope.users.length - 1; i >= 0; i--) {
        console.debug($scope.users[i].gaveDispos, $scope.users[i].name);
     };
   }


    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };
  });
