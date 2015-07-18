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
      getWeekDays : function(){
        return [ 
              {id:1, nom : 'Lundi', times: 1},
              {id:2, nom : 'Mardi', times: 1},
              {id:3, nom : 'Mercredi', times: 1},
              {id:4, nom : 'Jeudi', times: 1},
              {id:5, nom : 'Vendredi', times: 1},
              {id:6, nom : 'Samedi', times: 1}
            ]
      },
      getCompetences:function(){
        return ["Back-office","Spécial", "Coursier", "Dispatcheur", "CTiste"]
      },
      getCities : function(){
        return ["Lausanne", "Yverdon", "Neuchâtel"]
      },
      containsAll: function(needles, haystack){ 
        for(var i = 0 , len = needles.length; i < len; i++){
           if($.inArray(needles[i], haystack) == -1) return false;
        }
        return true;
      }

  	}
    


});
