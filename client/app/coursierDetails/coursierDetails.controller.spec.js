'use strict';

describe('Controller: CoursierDetailsCtrl', function () {

  // load the controller's module
  beforeEach(module('velociteScheduleApp'));

  var CoursierDetailsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CoursierDetailsCtrl = $controller('CoursierDetailsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
