'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('coursierss', {
        url: '/coursiers',
        templateUrl: 'app/admin/coursiers.html',
        controller: 'AdminCtrl'
      }).state('coursierss.details', {
        url: '/:coursierId',
        templateUrl: 'app/coursierDetails/coursierDetails.html',
        controller: 'CoursierDetailsCtrl'
      })
  });