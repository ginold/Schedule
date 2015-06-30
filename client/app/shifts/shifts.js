'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('shifts', {
        url: '/shifts',
        templateUrl: 'app/shifts/shifts.html',
        controller: 'ShiftsCtrl'
      })
      .state('shifts.details', {
        url: '/:shiftId',
        templateUrl: 'app/shiftDetails/shiftDetails.html',
        controller: 'ShiftDetailsCtrl'
      })
    
  });