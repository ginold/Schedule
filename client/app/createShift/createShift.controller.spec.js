'use strict';

describe('Controller: CreateShiftCtrl', function () {

  // load the controller's module
  beforeEach(module('velociteScheduleApp'));

  var CreateShiftCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreateShiftCtrl = $controller('CreateShiftCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
