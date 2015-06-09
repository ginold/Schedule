'use strict';

describe('Controller: ModalRemoveDispoCtrl', function () {

  // load the controller's module
  beforeEach(module('velociteScheduleApp'));

  var ModalRemoveDispoCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ModalRemoveDispoCtrl = $controller('ModalRemoveDispoCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
