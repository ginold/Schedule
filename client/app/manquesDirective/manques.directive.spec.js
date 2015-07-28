'use strict';

describe('Directive: manques', function () {

  // load the directive's module and view
  beforeEach(module('velociteScheduleApp'));
  beforeEach(module('app/manquesDirective/manques.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<manques></manques>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the manques directive');
  }));
});