'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('planningCoursier', {
        url: '/planningCoursier',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
 
  });