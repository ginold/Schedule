'use strict';

angular.module('velociteScheduleApp')
  .factory('shiftService', function ($http) {

  	return{
  		getShift: function(shiftId, callback){
  			$http.get("/api/shifts/"+shiftId).success(function(shift){        
           callback(shift);
        })
  		},
  		getShifts :function(callback){
  			$http.get("/api/shifts/").success(function(shifts){        
           callback(shifts);
        })
  		},
      formatHoursMinutes : function(shift){
        if(shift.length > 1){
          for (var i = shift.length - 1; i >= 0; i--) {
            if(typeof shift[i].debut != 'undefined'){
              shift[i].debut = moment(shift[i].debut).format("H")+"h:"+ moment(shift[i].debut).format("mm")
              shift[i].fin =   moment(shift[i].fin).format("H")+"h:"+ moment(shift[i].fin).format("mm")
            }
          };
        }else{
          if (typeof shift.debut != 'undefined') {
            shift.debut = moment(shift.debut).format("H")+"h:"+ moment(shift.debut).format("mm")
            shift.fin = moment(shift.fin).format("H")+"h:"+ moment(shift.fin).format("mm")
          };
           
        } 

      },
      formatCities : function(shifts){
        for (var i = shifts.length - 1; i >= 0; i--) {
          for (var j = shifts[i].villes.length - 1; j >= 0; j--) {
            if (shifts[i].villes[j] == "yverdon") {
               shifts[i].villes[j] = 'YD'
            };
            if (shifts[i].villes[j] == "lausanne") {
              shifts[i].villes[j] = "LA"
              
            };
            if (shifts[i].villes[j] =="neuchâtel") {
              shifts[i].villes[j] = "NE"
            };
          };
        };
      },
      containsAll: function(needles, haystack){ 
        for(var i = 0 , len = needles.length; i < len; i++){
           if($.inArray(needles[i], haystack) == -1) return false;
        }
        return true;
      }

  	}
    


});
