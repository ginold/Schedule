'use strict';

angular.module('velociteScheduleApp')
  .factory('calendarService', function () {
  	var months =['Janvier','Février','Mars','Avril',"Mai",'Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  	var days = ['di','lu','ma','me','je','ve','sa'] //0 = dimanche, 1 = lundi with .getDay()
    

  	return{
  		getMonths: function(){
  			return  months;
  		},
  		getDays :function(){
  			return days;
  		},
      getDate: function(){
        return moment().format("DD-MM-YYYY")
      },
      getMonthYear: function(){
        return moment().format("MM-YYYY")
      }

  	}
    


});
