'use strict';

angular.module('k2')
  /*
   * Handle an SVG image by allowing it to be re-styled.
   * 
   * Example:
   *   <div class="svg-image" src="img/k2-previous.svg"></div>
   *
   * The result provides a node as follows allowing the color of the image to be changed using a CSS selector [svg path].
   * 
   *   <svg><path>...</path></svg>
   *
   */
  .directive('svgImage', ['$http', function($http) {
    return {
      restrict: 'C',
      link: function(scope, element) {
        var imgURL = element.attr('src');
        // if you want to use ng-include, then
        // instead of the above line write the bellow:
        // var imgURL = element.attr('ng-include');
        var request = $http.get(imgURL, {
          'Content-Type': 'application/xml'
        });

        var manipulateImgNode = function(data, elem) {
          // Find the svg node.
          var $svg = undefined;
          var svgElems = angular.element(data);
          for(var i = 0; i< svgElems.length; i++) {
            if (svgElems[i].nodeName == "svg") {
              $svg = svgElems[i];
              break;
            }
          }
          if ($svg == undefined) {
            return elem; // Couldn't find svg data.
          }
          var imgClass = elem.attr('class');
          if (typeof(imgClass) !== 'undefined') {
            var classes = imgClass.split(' ');
            for (var i = 0; i < classes.length; ++i) {
              $svg.classList.add(classes[i]);
            }
          }
          $svg.removeAttribute('xmlns:a');
          return $svg;
        };

        request.success(function(data) {
          element.replaceWith(manipulateImgNode(data, element));
        });
      }
    };
  }]);
