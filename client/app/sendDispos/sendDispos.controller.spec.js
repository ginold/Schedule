'use strict';

describe('Controller: SendDisposCtrl', function () {

  // load the controller's module
  beforeEach(module('velociteScheduleApp'));

  var SendDisposCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SendDisposCtrl = $controller('SendDisposCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
