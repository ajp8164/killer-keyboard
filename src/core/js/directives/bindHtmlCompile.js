'use strict';

angular.module('k2')
  /*
   * Allows html text to that includes angular expressions to be inserted into the associated DOM node and evaluated
   * against the views scope.
   */
  .directive('bindHtmlCompile', ['$compile', function ($compile) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.$watch(function () {
          return scope.$eval(attrs.bindHtmlCompile);
        }, function (value) {
          element.html(value);
          $compile(element.contents())(scope);
        });
      }
    };
  }]);
