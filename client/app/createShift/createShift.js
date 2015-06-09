'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('createShift', {
        url: '/createShift',
        templateUrl: 'app/createShift/createShift.html',
        controller: 'CreateShiftCtrl'
      });
  });