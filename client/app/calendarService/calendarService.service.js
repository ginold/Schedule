'use strict';

angular.module('velociteScheduleApp')
  .factory('calendarService', function () {
  	var months =['Janvier','Février','Mars','Avril',"Mai",'Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  	return{
  		getMonths: function(){
  			return  months;
  		}
  	}
    


});
