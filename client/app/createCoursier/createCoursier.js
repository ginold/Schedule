'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('createCoursier', {
        url: '/createCoursier',
        templateUrl: 'app/createCoursier/createCoursier.html',
        controller: 'CreateCoursierCtrl'
      });
  });