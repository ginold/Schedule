'use strict';

describe('Directive: doublonsCity', function () {

  // load the directive's module and view
  beforeEach(module('velociteScheduleApp'));
  beforeEach(module('app/doublonsCity/doublonsCity.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<doublons-city></doublons-city>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the doublonsCity directive');
  }));
});