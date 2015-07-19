'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('coursiers', {
        url: '/coursiers',
        templateUrl: 'app/admin/coursiers.html',
        controller: 'AdminCtrl'
      }).state('coursiers.details', {
        url: '/:coursierId',
        templateUrl: 'app/coursierDetails/coursierDetails.html',
        controller: 'CoursierDetailsCtrl'
      })
  });