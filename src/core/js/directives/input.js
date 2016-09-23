'use strict';

angular.module('k2')
/*
 * For all <input> nodes not using a K2 keyboard, create a click handler to signal closing the K2 keyboard to allow the
 * native keyboard to take over.
 */
  .directive('input', ['$rootScope','$timeout', 'k2i', function ($rootScope, $timeout, k2i) {
    return {
      restrict: 'E',
      link: function(scope, elem, attrs, ctrl) {
        // The keyboard must be in the view.
        if (document.querySelectorAll('.k2').length == 0) {
          return;
        }

        // Hide the keyboard if an input will trigger the native keyboard.
        // Native keyboard triggered on elements without k2-bind.
        if (attrs.k2Bind == undefined) {
          elem.on('click', function() {
            k2i.hideKeyboard(null, {animate: false});
          });
        }
      }
    };
  }]);
