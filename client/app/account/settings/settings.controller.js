'use strict';

angular.module('velociteScheduleApp')
  .controller('SettingsCtrl', function ($scope, Auth) {
    $scope.errors = {};
    $scope.user = Auth.getCurrentUser();

    $scope.user.naissance = moment($scope.user.naissance).format("DD MMMM YYYY")
     $scope.user.createdOn = moment($scope.user.createdOn).format("DD MMMM YYYY")
    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Mot de passe changé.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Mot de passe incorrecte';
          $scope.message = '';
        });
      }
		};
})
