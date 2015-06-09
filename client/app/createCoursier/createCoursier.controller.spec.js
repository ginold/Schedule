'use strict';

describe('Controller: CreateCoursierCtrl', function () {

  // load the controller's module
  beforeEach(module('velociteScheduleApp'));

  var CreateCoursierCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CreateCoursierCtrl = $controller('CreateCoursierCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
