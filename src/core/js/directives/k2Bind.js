'use strict';

angular.module('k2')
  /*
   * Handle the binding of the node ngModel to the keyboard.  The value of ngModel receives the keyboard input.
   * Supported nodes that want to use a K2 keyboard must includes the `k2-name` attribute.
   * 
   * Example: <input k2-name="digit">
   *
   * Supported nodes:
   *   <input>
   *   <textarea>
   */
  .directive('k2Bind', ['$timeout', 'k2i', function ($timeout, k2i) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs, ctrl) {
        // Bind the keyboard to the elements model.
        var kbModel = attrs.ngModel && (attrs.ngModel).match(/([^\.]+)$/g)[0];
        if (!kbModel) {
         return;
        }

        // Disable the native keyboard.
        elem[0].setAttribute('readonly', null);

        // Set the keyboard name.
        var settings = {
          name: attrs.k2Bind || 'default'
        };

        elem.on('click', function() {
          // Is there a keyboard with non-zero height?
          var kb = document.querySelectorAll('.k2:not(.ng-hide)')[0];
          var kbAlreadyShown = (kb != undefined) && (kb.clientHeight > 0);

          $timeout(function() {
            // Bind the model to the keyboard and show the keyboard.
            k2i.showKeyboard(angular.bind(scope.scope, function(keyboardValue) {
              this[kbModel] = keyboardValue;
            }), settings);
            // If the keyboard was not previously shown then scroll the element into the resized view.
            if (!kbAlreadyShown) {
              k2i.scrollIntoView(elem[0]);
            }
          }, 0);
        });
      }
    }
  }]);
