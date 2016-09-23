'use strict';

angular.module('k2')
  /*
   *
   */
  .directive('k2Settings', ['k2i', function (k2i) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs, ctrl) {
        // The keyboard must be declared in the view.
        if (document.querySelectorAll('.k2').length == 0) {
          return;
        }
        k2i.registerKeyboard(attrs.k2Settings);
      }
    }
  }]);
