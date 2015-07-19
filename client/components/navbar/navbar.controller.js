'use strict';

angular.module('velociteScheduleApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {


    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
    $scope.toggleCollapse = function(){
      if (!$scope.isCollapsed) {
        $scope.isCollapsed = true
      };
    }
    //toggle planning between all coursiers and monthly personnal view
$scope.togglePlanning = function(planningAdmin){
  if (planningAdmin) {
     $scope.isAdmin = function(){
      return false;
     } 
      $scope.toggleButtonText = "Tous les coursiers"
      $scope.toggleHeaderText = "Mon planning"
  }else{
     $scope.isAdmin = function(){
      return true;
     }
      $scope.toggleButtonText = "Mon planning"
      $scope.toggleHeaderText = "Tous les coursiers"
  }
}
  });