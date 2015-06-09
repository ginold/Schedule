'use strict';

describe('Controller: ShiftDetailsCtrl', function () {

  // load the controller's module
  beforeEach(module('velociteScheduleApp'));

  var ShiftDetailsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ShiftDetailsCtrl = $controller('ShiftDetailsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
