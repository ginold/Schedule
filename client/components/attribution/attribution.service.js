'use strict';

angular.module('velociteScheduleApp')
  .factory('AttributionsService', function ($resource, $http,$rootScope) {
    return {
      setShift: function (shifts, coursier, date, otherShift){
        if (shifts == null) {
          shifts = [otherShift]
        };
        console.debug('attribution service shift selected->');
        console.debug(shifts);
        var monthYear = moment(date).format("MM-YYYY");
        var day = moment(date).format("D")
        $http.put("api/attributions/:id/setShift",
            {
              shifts : shifts,
              coursier : coursier,
              date : date,
              monthYear : monthYear,
              day : day
            }
          ).success(function(data, status){
            var daShift = shifts[0]
            daShift.coursierAttributed = {
              _id : coursier._id
            }
            $rootScope.$broadcast("attribution", {shift: daShift, 
                                            monthYear : monthYear, day: day, 
                                            coursier : coursier, date: date, })
          }).error(function(err){
            console.log(err)
          })
      },
      formatShiftsForCalendar: function (shifts, callback) {

        var formatedShifts = []
        for (var i = shifts.length - 1; i >= 0; i--) {
          var day = shifts[i].date
          var startHours = moment(shifts[i].debut).hours()
          var endHours = moment(shifts[i].fin).hours()
          var startMinutes= moment(shifts[i].debut).minutes()
          var endMinutes = moment(shifts[i].fin).minutes()
         
          var start = moment(day).hours(startHours).minutes(startMinutes)
          var end = moment(day).hours(endHours).minutes(endMinutes)
          var color = function(ville){
            if (ville =="Lausanne") {
              return "#1F992F"
            };
          }

          var shift = {
            title : shifts[i].nom,
            start : start._d,
            end : end._d,
            ville : shifts[i].ville,
            backgroundColor: color(shifts[i].ville)
          }
          formatedShifts.push(shift)
        };
        callback(formatedShifts);
      },
      getMyMonthlyShifts: function  (coursierId, monthYear, attributions, callback) {
        var attr = attributions[0].monthYear;
        var myMonthlyShifts = []
        for(var month in attr){
          if (month == monthYear) {
            for(var day in attr[monthYear]){
              for (var i = attr[monthYear][day].shifts.length - 1; i >= 0; i--) {
                if(attr[monthYear][day].shifts[i].coursierAttributed._id == coursierId){
                  var date = moment(day+"-"+monthYear, "D-MM-YYYY");
                  attr[monthYear][day].shifts[i].date = date;
                  myMonthlyShifts.push(attr[monthYear][day].shifts[i])
                }
              };
            }
          };
        }
       
        callback(myMonthlyShifts)
      }
    }
	  
  });
