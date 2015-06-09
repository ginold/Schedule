'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider,$urlRouterProvider) {
    $stateProvider
      .state('shifts', {
        url: '/shifts',

        templateUrl: '/app/shifts/shifts.html',
        controller: 'ShiftsCtrl'
      })
      .state('shifts.details', {
        url: '/:shiftId',
        templateUrl: 'app/shiftDetails/shiftDetails.html',
        controller: function ($stateParams) {
            // If we got here from a url of /contacts/42
            console.log($stateParams)
        }
      })
    $urlRouterProvider.when('shifts/:id', '/');
    
  });