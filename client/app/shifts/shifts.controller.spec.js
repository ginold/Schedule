'use strict';

describe('Controller: ShiftsCtrl', function () {

  // load the controller's module
  beforeEach(module('velociteScheduleApp'));

  var ShiftsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ShiftsCtrl = $controller('ShiftsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
