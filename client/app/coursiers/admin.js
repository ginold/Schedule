'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('coursiers', {
        url: '/coursiers',
        templateUrl: 'app/coursiers/coursiers.html',
        controller: 'AdminCtrl'
      }).state('coursiers.details', {
        url: '/:coursierId',
        templateUrl: 'app/coursierDetails/coursierDetails.html',
        controller: 'CoursierDetailsCtrl'
      })
  });