'use strict';

describe('Directive: coursierDays', function () {

  // load the directive's module and view
  beforeEach(module('velociteScheduleApp'));
  beforeEach(module('app/coursierDayDirective/coursierDays.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<coursier-days></coursier-days>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the coursierDays directive');
  }));
});