'use strict';
//  scope:{notificationCount:"="},
angular.module('quizRT')
  .directive('notificationData', ['$rootScope', '$http','$location', function($rootScope, $http,$location) {
    return {
      restrict: 'E',
      template: '<a ng-click="showModal()">{{notificationCount}}</a>',
      link: function postLink(scope, element, attrs) {

        $rootScope.$on('sent:a:frndreq', function(event, data) {
        scope.notificationCount+=1;
        });
        $http.get('/notifications')
          .success(function(data, status, headers, config) {
            scope.notificationCount = data.length;
            scope.$root.notificationCount = data.length;
            scope.notificationData = data;
            console.log(data);

          });
        scope.showModal = function() {
            //show the modal
            $rootScope.notificationSocket.emit('respond:to:frndreq', scope.notificationData);

          }

          element.bind('click', function() {
              $location.path('/notifications');
          });
          // element.bind('click', function() {
          //
          //   console.log(scope.notificationData);
          // });
          // attrs.$observe('notificationData',function(newVal){
          //   var newSign = parseFloat(newVal);
          //   if(newSign>0){
          //     element[0].style.color='Green';
          //   }else{
          //       element[0].style.color='Red';
          //   }
          // });
      }
    };
  }]);
