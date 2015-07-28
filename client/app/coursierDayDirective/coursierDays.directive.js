'use strict';

angular.module('velociteScheduleApp')
  .directive('coursierDay', function () {
      return{
        scope : {
          year : "=",
          day : "=",
          setShift : "=",
          monthNum : "=",
          returnAttributions: "=",
          checkDispo : "=",
          user: "=",
          monthYear : "="
        },
        templateUrl: 'app/coursierDayDirective/coursierDays.html',

        link : function  (scope, elem, attrs) {
          elem.addClass('coursierDay')

          scope.addDispoChange = function (newMonth, newYear) {
            elem.attr("date", (scope.day)+"-"+(newMonth+1)+"-"+newYear )  
            var dispo = scope.checkDispo(scope.day, newMonth, newYear, scope.user._id) 
             elem.removeClass("presentOff present absent city-bg-off city-bg-on noInfo noInfoOff Lausanne Yverdon Neuchâtel notDispoLausanne notDispoYverdon notDispoNeuchâtel")
                if(dispo){
                  if (dispo.type =="Dispo") {
                     elem.addClass("presentOff")
                    if (dispo.villes) {
                      scope.from = moment(dispo.start).format("H:mm")
                      scope.to = moment(dispo.end).format("H:mm")
                      scope.cities =  dispo.villes.join(", ");
                      $.each(dispo.villes, function  (i, ville) {
                         elem.addClass(ville)
                         elem.addClass("city-bg-off")
                      })
                    }
                  }else{
                     elem.addClass("absent")
                     $(".absent").removeClass('highDispo mediumDispo lowDispo busy')
                    }
                }else{
                   elem.addClass("noInfoOff")
                }
          }

          scope.getAttrShifts = function (attributions, monthYear){
             scope.daShifts = []
             if (attributions) {
                 if (attributions[scope.day]) {           
                  var daShifts = []
                  $.each(attributions[scope.day].shifts, function(i, shift){
                     if (shift.coursierAttributed._id  == scope.user._id) {
                          if (shift.title == 'Absent') {
                            elem.addClass("absent")
                            elem.removeClass('presentOff')
                          }else{
                             daShifts.push(shift);  
                          }
                      }
                    })
                    scope.daShifts = daShifts;        
                }
              };  
          }
          /*
            checks if the number of shifts/week has been exceeded
          */
          scope.checkShiftsPerWeek = function(dayOfWeek, day, month, year){
              var date = new Date(year, month, day)
              var monthYear = moment(date).format("MM-YYYY");
              var startWeek = moment(date).startOf('week')._d
              var endWeek = moment(date).endOf('week')._d
              var day = moment(date).format("D");
              elem.removeAttr('shiftsAttributed shiftsLeft shiftsWanted coursierId coursierName')
              for(var month in scope.user.dispos){
                if (monthYear == month) {
                  for(var week in scope.user.dispos[month]){
                     
                    if (scope.user.dispos[month][week].dispos.length > 0) {

                      var aDay = scope.user.dispos[month][week].dispos[0].start;
                       var startWeekDay = moment(aDay).startOf('week')._d
                    //if its during the week you clicked, get the weekly shifts of that week
                    if (moment(startWeekDay).isSame(startWeek)) {
                      var shiftsPerWeek = scope.user.dispos[month][week].shiftsWeek;
                      scope.remarques = scope.user.dispos[month][week].remarques;
                      var attributed = scope.getNumberOfAttributedShiftsWeek(scope.user._id, monthYear, startWeek, endWeek)
                      scope.setDispoBGInfo(startWeek, endWeek, shiftsPerWeek, attributed,moment(date)._d)
                    };
                    };
                  }
                };
              }
          }
          /*
            thanks to te gb color, tell the user how many shifts approx. are left for attribution
            or if it has already been exceeded
          */
          scope.setDispoBGInfo = function(startWeek, endWeek, wantedShifts, attributedShifts, date){
            if (moment(startWeek).isBefore(date) || moment(startWeek).isSame(date) ) {
              if (moment(date).isBefore(endWeek) || moment(date).isSame(endWeek)) {
                //set bg from mon till saturday
                if (date.getDay()  < 7 &&  date.getDay() >0) {  
                  if (!elem.hasClass("absent")) {
                    var shiftsLeft = (wantedShifts-attributedShifts)
                      if (attributedShifts>wantedShifts || attributedShifts == wantedShifts) {
                        elem.addClass("busyOff")
                      }else if( shiftsLeft <= 2 ){
                        elem.addClass("lowDispoOff")
                      }else if(shiftsLeft >=3 && shiftsLeft <=5){
                        elem.addClass("mediumDispoOff")
                      }else if(shiftsLeft >=6){
                        elem.addClass("highDispoOff")
                      }
                    $(".absent").removeClass('highDispo mediumDispo lowDispo busy')
                    elem.attr('shiftsAttributed', attributedShifts)
                    elem.attr('shiftsLeft', shiftsLeft)
                    elem.attr('shiftsWanted', wantedShifts)
                    elem.attr('coursierId', scope.user._id)
                    elem.attr('coursierName', scope.user.name);
                    //used in popover on cell
                    scope.shiftsLeft = shiftsLeft
                    scope.wantedShifts = wantedShifts
                    scope.attributedShifts = attributedShifts
                  };
                  
                };          
              };
            };
          }
          /*
              gets the number of already attributed shifts to the coursier
              for the given week. 
          */
          scope.getNumberOfAttributedShiftsWeek = function (coursierId, monthYear, startWeek, endWeek) {
              var attributed = 0;
              var startDay = parseInt(moment(startWeek).format("D"));
              var endDay = parseInt(moment(endWeek).format("D"));
              var startMonth = moment(startWeek).month()
              var endMonth =  moment(endWeek).month()
              var currentMonth =  scope.monthNum;
              //use only days within the month and not from the previous or next !
              if (startDay > endDay && startMonth < endMonth && endMonth == currentMonth ) {
                startDay = 1;
              }
              else if (startDay > endDay && startMonth < endMonth && startMonth == currentMonth){
                endDay = moment(startWeek).daysInMonth()             
              };
              // console.debug(startDay, endDay); 
              for(var day in  scope.attributions){
                //look for shifts during that week and count        
                if (day >=startDay && day <=endDay ) {
                   var shifts = scope.attributions[day].shifts;
                   for (var i = shifts.length - 1; i >= 0; i--) {
                     if(shifts[i].coursierAttributed._id == coursierId && !shifts[i].title){//title-> dont count the absent shift as a shift!
                      attributed++;
                     }
                   };
                };        
              }     
              return attributed
          }

          //update view on attribution passed !!!!!!!!!!!!!
           scope.$on("attrPassed", function(e, args){
            //set for the first attribution
            if (!scope.attributions) {
              scope.attributions = {}
            };
            if (!scope.attributions[args.monthYear]) {
              scope.attributions[args.monthYear] = {}
            };
            scope.attributions[args.monthYear]  = args.attributions[args.monthYear]
            //scope.addDispoMonthChange(scope.monthNum);
            scope.getAttrShifts(scope.attributions[args.monthYear], args.monthYear)
            scope.checkShiftsPerWeek(null, scope.day, scope.monthNum, scope.year)
           })
           //update on deletition
           scope.$on("delPassed",function(e, args){
            scope.attributions[args.day].shifts = args.shifts
           // scope.addDispoMonthChange(scope.monthNum);
            scope.getAttrShifts(scope.attributions, scope.monthYear)
            scope.checkShiftsPerWeek(null, scope.day, scope.monthNum, scope.year)
           })
          //WATCH MONTH
           scope.$watch("monthNum",function(newMonth,oldValue) {
             //  elem.removeClass('lowDispo mediumDispo highDispo lowDispoOff mediumDispoOff highDispoOff busy busyOff absent present Lausanne Yverdon Neuchâtel notDispoCity')
               var date = new Date(parseInt(scope.year), newMonth, scope.day)
               var dayOfWeek = date.getDay();
               var monthYear = moment(1+"-"+(newMonth+1)+"-"+scope.year, "D-M-YYYY").format("MM-YYYY")
               scope.attributions = scope.returnAttributions(monthYear)
               scope.shiftsLeft = scope.wantedShifts = scope.daShifts =scope.cities = scope.attributedShifts = scope.remarques = scope.from = scope.to = scope.villes = null
               scope.addDispoChange(newMonth, scope.year);
               scope.getAttrShifts(scope.attributions, monthYear)
               scope.checkShiftsPerWeek(dayOfWeek,scope.day,  newMonth, scope.year)
            });
           //WATCH YEAR
           scope.$watch("year",function(newYear,oldValue) {
            //  elem.removeClass('lowDispo mediumDispo highDispo lowDispoOff mediumDispoOff highDispoOff busy busyOff absent present Lausanne Yverdon Neuchâtel notDispoCity')
              var date = new Date(parseInt(newYear), scope.monthNum, scope.day)
              var dayOfWeek = date.getDay();
              var monthYear = moment(1+"-"+(scope.monthNum+1)+"-"+newYear,  "D-M-YYYY").format("MM-YYYY")
              scope.attributions = scope.returnAttributions(scope.monthYear)
              scope.shiftsLeft = scope.wantedShifts = scope.daShifts = scope.cities = scope.attributedShifts = scope.from = scope.to =scope.remarques = scope.villes = null
              scope.addDispoChange(scope.monthNum, newYear)
              scope.getAttrShifts(scope.attributions, monthYear)
              scope.checkShiftsPerWeek(dayOfWeek, scope.day, scope.monthNum, newYear)
            });
           scope.$watch("limitTo",function() {

              var date = new Date(parseInt(scope.year), scope.monthNum, scope.day)
              var dayOfWeek = date.getDay();
              var monthYear = moment(1+"-"+(scope.monthNum+1)+"-"+scope.year,  "D-M-YYYY").format("MM-YYYY")
              scope.attributions = scope.returnAttributions(monthYear)
              scope.shiftsLeft = scope.wantedShifts = scope.daShifts = scope.cities = scope.attributedShifts = scope.from = scope.to =scope.remarques = scope.villes = null
              scope.addDispoChange(scope.monthNum, scope.year)
              scope.getAttrShifts(scope.attributions, monthYear)
              scope.checkShiftsPerWeek(dayOfWeek, scope.day, scope.monthNum, scope.year)
            });
           scope.$watch("limitFrom",function() {
              var date = new Date(parseInt(scope.year), scope.monthNum, scope.day)
              var dayOfWeek = date.getDay();
              var monthYear = moment(1+"-"+(scope.monthNum+1)+"-"+scope.year,  "D-M-YYYY").format("MM-YYYY")
              scope.attributions = scope.returnAttributions(monthYear)
              scope.shiftsLeft = scope.wantedShifts = scope.daShifts = scope.cities = scope.attributedShifts = scope.from = scope.to =scope.remarques = scope.villes = null
              scope.addDispoChange(scope.monthNum, scope.year)
              scope.getAttrShifts(scope.attributions, monthYear)
              scope.checkShiftsPerWeek(dayOfWeek, scope.day, scope.monthNum, scope.year)
            });

          }
        }
   
  });