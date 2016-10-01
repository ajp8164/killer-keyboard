'use strict';

angular.module('k2')
  /*
   * Handle the presence and initialization of the K2 keyboard in a view.
   */
  .directive('k2', ['$rootScope', '$templateCache', '$timeout', 'k2i',
    function ($rootScope, $templateCache, $timeout, k2i) {
      return {
        restrict: 'E',
        template: $templateCache.get('k2/templates/k2.tpl.html'),
        replace: true,
        scope: {
          ngShow: '=',
          ngHide: '='
        },
        link: function(scope, elem, attrs) {
          k2i.initK2(scope);

          scope.$watch(
            function() {
              var watchNode = document.querySelectorAll('.k2 .k2-template [k2-name] .k2-acc-bar');
              if (watchNode.length > 0) {
                var nameNode = document.querySelectorAll('.k2 .k2-template [k2-name]');
                return nameNode[0].attributes['k2-name'].value;
              } else {
                return '';
              }
            },
            function (newName, oldName) {
              if (newName && newName != oldName) {
                // Determine the height of the keyboard.
                var height = {};
                var kbElem = angular.element(document.querySelectorAll('.k2')[0]);

                var wasHidden = kbElem.hasClass('ng-hide');
                kbElem.removeClass('ng-hide');
                height[k2i.modes.ALL] = document.querySelectorAll('.k2')[0].clientHeight;
                height[k2i.modes.ACCESSORY_BAR_ONLY] = document.querySelectorAll('.k2 .k2-acc-bar')[0].clientHeight;
                height[k2i.modes.KEYBOARD_KEYS_ONLY] = height[k2i.modes.ALL] - height[k2i.modes.ACCESSORY_BAR_ONLY];
                if (wasHidden) {
                  kbElem.addClass('ng-hide');
                }

                $rootScope.$emit('K2KeyboardInDOM', newName, height);
              }
            }
          );
        }
      }
    }
  ]);
