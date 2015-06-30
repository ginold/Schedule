'use strict';

angular.module('velociteScheduleApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('sendDispos', {
        url: '/sendDispos',
        templateUrl: 'app/sendDispos/sendDispos.html',
        controller: 'SendDisposCtrl'
      })
      .state('sendDispos.verify', {
        url: '/verify/',
        params : {dispos: null},
        templateUrl: 'app/sendDispos/verifyDispos.html',
        controller: 'VerifyDisposCtrl'
      });
  });