'use strict';

angular.module('velociteScheduleApp')
  .controller('ModalRemoveDispoCtrl', function ($scope, $modalInstance,index) {
  
   $scope.ok = function () {
    //console.log('modalRemoveClose '+index);//give  the result back to modalInstance.result.then(function (index))
    $modalInstance.close(index);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

});
