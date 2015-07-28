'use strict';

describe('Service: calendarService', function () {

  // load the service's module
  beforeEach(module('velociteScheduleApp'));

  // instantiate service
  var calendarService;
  beforeEach(inject(function (_calendarService_) {
    calendarService = _calendarService_;
  }));

  it('should do something', function () {
    expect(!!calendarService).toBe(true);
  });

});
