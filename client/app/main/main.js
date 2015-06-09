'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/planningCoursier',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  });