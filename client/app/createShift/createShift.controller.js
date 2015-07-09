'use strict';

angular.module('velociteScheduleApp')
  .controller('CreateShiftCtrl', function ($scope, User, $http,$modal, calendarService, shiftService) {
  	//time picker for inputs
    $(document).ready(function(){
    	$('input[type="time"]').timepicker({
    		timeFormat : 'H\\:i',
    		disableTimeRanges: [['00:00am', '6:00am'], ['09:00pm', '00:00am']]
    	});
    });
    // Use the User $resource to fetch all users
    $scope.users = User.query();
    $scope.competences = shiftService.getCompetences()
    $scope.shift = {};
    $scope.shift.coursiers = null;
    $scope.selectedCompetences = [];
    $scope.isFalseHour = false;
    $scope.times = 1 ;
    //days of week with default times/day shift = 1
    $scope.days = [ 
      {id:1, nom : 'Lundi', times: 1},
      {id:2, nom : 'Mardi', times: 1},
      {id:3, nom : 'Mercredi', times: 1},
      {id:4, nom : 'Jeudi', times: 1},
      {id:5, nom : 'Vendredi', times: 1},
      {id:6, nom : 'Samedi', times: 1}
    ]
    $scope.cities = shiftService.getCities()
     //months for periode de validite
    $scope.months = calendarService.getMonths();
   // console.log($scope.months)

   /*
    sets the number of times a shift should be done per day
   */
   $scope.insertTimesPerDay = function(day, times){
    for (var i = 0; i < $scope.days.length; i++) {
      if (day == $scope.days[i].nom) {
        $scope.days[i].times = parseInt(times);
      };
    };
   }

  $scope.sortByCompetences = function  (competences) {
    console.log(competences)
    var competentUsers = []
    for (var i = $scope.users.length - 1; i >= 0; i--) {
     var ok = shiftService.containsAll(competences, $scope.users[i].competences); // true
      if (ok) {
        competentUsers.push($scope.users[i])
      };
    };
    $scope.competentUsers = competentUsers

  }
   /*
    create the shift with all its data
   */
    $scope.createShift = function(shift){
      console.debug(shift);
      if (shift.nom == null || shift.nom == '') {
         var modalInstance = $modal.open({
                templateUrl: 'app/createShift/shiftIncompleteModal.html',//par rapport a l index.html
                controller: function($scope, $modalInstance){
                  $scope.cancel = function(){ $modalInstance.dismiss('cancel'); }
                  },
                size: "sm"
            });  
      }else{
          $http({
            method: 'POST',
            url: "/api/shifts",
            data: shift
          }).success(function(data, status){    
            var modalInstance = $modal.open({
                templateUrl: 'app/createShift/shiftCreatedModal.html',//par rapport a l index.html
                controller: function($scope, $modalInstance){
                  $scope.cancel = function(){ $modalInstance.dismiss('cancel'); }
                  },
                size: "sm"
            });  
             console.log(data);
             console.log(status);
          }).error(function(err){
            console.log(err);
          }) 
      }
    
    }
    /*
      check if start hour isn't after ending or ending before start
    */
    $scope.checkHour = function(start, end){
      if (typeof start.getMonth !== 'function' || typeof end.getMonth 
        !== 'function') {
      var startHours = start.split(":");
      var endHours = end.split(":");
      if (startHours[0][0] == "0") {
        startHours[0] = startHours[0].substring(1, startHours[0].length)
      }
      if (endHours[0][0] == "0") {
        endHours[0] = endHours[0].substring(1, endHours[0].length)
 
      };
      var start = new Date()
      var end = new Date()
      start.setHours(startHours[0])
      start.setMinutes(startHours[1])
      end.setHours(endHours[0])
      end.setMinutes(endHours[1])


     $scope.shift.debut = start;
     $scope.shift.fin = end;

      

    }
      if (typeof start != 'undefined' && typeof end != 'undefined') {
        if (moment(start).isAfter(end, 'hour')) {
          $scope.isFalseHour = true;
        }else $scope.isFalseHour = false;
      };

    }



  });
