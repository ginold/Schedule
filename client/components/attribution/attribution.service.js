'use strict';

angular.module('velociteScheduleApp')
  .factory('Attributions', function ($resource, $http) {
    return {
      setShift: function (shifts, coursier, date){
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
            console.log('attrubition passed')
            console.log(data)
          }).error(function(err){
            console.log(err)
          })
      }
    }
	  
  });
