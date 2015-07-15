'use strict';

angular.module('velociteScheduleApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    //Get all users and format 'coursier depuis'
    $http.get("api/users").success(function(users){

      for (var i = users.length - 1; i >= 0; i--) {
        users[i].createdOn = moment(users[i].createdOn).fromNow(true)
      };
      $scope.users = users
    })

    
   
    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };
  });
