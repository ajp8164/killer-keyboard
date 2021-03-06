'use strict';

angular.module('k2')
  /*
   * Handle adding tabindex attributes to all keyboard tab-able form fields.
   * TODO: this directive does not handle multiple forms on a single view.
   */
  .directive('form', ['$timeout', 'k2i', function ($timeout, k2i) {
    return {
      restrict: 'E',
      link: function(scope, elem, attrs, ctrl) {

        // Use timeout to wait for the DOM to render (e.g., ng-if's).
        $timeout(function() {
          // The keyboard must be in the view.
          if (document.querySelectorAll('.k2').length == 0) {
            // No k2 detected, initialize for this condition.
            return k2i.initNoK2();
          }

          // Add tabindex attributes to all tab-able fields.
          var procAttr = 'data-ett-processed';

          // Creates the onclick() function with the proper index.
          var createFocusOnClick = function(elem) {
            return function() {
              elem.on('click', function() {
                k2i.focus(elem);

                if (!elem.attr('k2-bind')) {
                  k2i.showKeyboard(null, {name: 'tab'});
                }
              });
            };
          };

          // Use $timeout to run the directive when the DOM is fully rendered
          $timeout(function() {
            var formElements = elem[0].querySelectorAll('input:not([' + procAttr + '="true"]):not([disabled]), select:not([' + procAttr + '="true"]), textarea:not([' + procAttr + '="true"])');
            for (var i = 0; i < formElements.length; i++) {
              // Add tab index attribute.
              formElements[i].setAttribute('k2-tabindex', i+1);

              // Add attribute to prevent adding multiple attributes on same element.
              formElements[i].setAttribute(procAttr, true);

              // When the element is clicked force the tabindex to be set correctly.
              createFocusOnClick(angular.element(formElements[i]))();
            }
          });
        });
      }
    }
  }]);
