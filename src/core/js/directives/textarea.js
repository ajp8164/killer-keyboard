'use strict';

angular.module('k2')
/*
 * For all <textarea> nodes not using a K2 keyboard, create a click handler to signal closing the K2 keyboard to allow the
 * native keyboard to take over.
 */
  .directive('textarea', ['k2i', function (k2i) {
    return {
      restrict: 'E',
      link: function(scope, elem, attrs, ctrl) {
        // The keyboard must be declared in the view.
        if (document.querySelectorAll('.k2').length == 0) {
          return;
        }

        // If the textarea is not bound to our keyboard then hide it; the native keyboard is being used.
        if (attrs.k2Bind == undefined) {
          elem.on('click', function() {
            k2i.hideKeyboard(null, {animate: false});
          });
        }
      }
    }
  }]);
