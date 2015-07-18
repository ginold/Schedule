'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('monthYear', {
        url: '/monthYear',
        templateUrl: 'app/monthYear/monthYear.html',
        controller: 'MonthYearCtrl'
      });
  });