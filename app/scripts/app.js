(function(window) {
  'use strict';

  var app = angular.module('tweetsToSoftware',
    [
      'app-templates',
      'angularMoment',
      'ngRoute',
      'ngSanitize',
      'truncate'
    ])
    .config(['$routeProvider', function($routeProvider){
      $routeProvider
          .when('/add-tweet',{
            templateUrl: 'admin.html',
            controller: 'adminController'
          })
          .when('/', {
            templateUrl: 'app.html',
            controller: 'mainController'
          })
          .otherwise({
            redirectTo: '/'
          });
    }]);

  app.factory('switterServer', function() {
    if (typeof(DEVELOPMENT) === 'undefined') {
      return '//dorado.cs.umanitoba.ca:8000'; // production environment
    } else {
      return '//dorado.cs.umanitoba.ca:7000'; // development environment
    }
  });

  app.factory('rootPrefix', function() {
    if (typeof(DEVELOPMENT) === 'undefined') {
      return '/switter';
    } else {
      return '';
    }
  });

  app.factory('currentParticipant', function() {
    var participantId = localStorage.getItem('switter-participant');

    if (!participantId) {
      while (!participantId) {
        participantId = prompt('Please, enter your participant number');
      }

      localStorage.setItem('switter-participant', participantId);
    }

    return participantId;
  });

  app.run(function(currentParticipant) {
    console.log('participant nubmer ' + currentParticipant);
  });

  window.app = app;
})(window);