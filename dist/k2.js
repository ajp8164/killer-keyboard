'use strict';

angular.module('k2', []);

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
              k2i.scrollIntoView(elem);
            }
          });
        });
      }
    }
  }]);

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

'use strict';

angular.module('k2').factory('k2', function(k2i) {

  var root = {};

	/**
	 * @ngdoc enum
	 * @name mode
	 * @module k2
	 * @kind enum
	 *
	 * @description
	 * The presentation mode of the keyboard.
	 * 
	 * NONE - Hide all keyboard elements.
	 * ALL - Present the accessory bar and the keyboard keys.
	 * ACCESSORY_BAR_ONLY - Present only the accessory bar.
	 * KEYBOARD_KEYS_ONLY - Prersent only the keyboard keys.
	 */
  root.modes = k2i.modes;

	/**
	 * @ngdoc function
	 * @name showKeyboard
	 * @module k2
	 * @kind function
	 *
	 * @description
	 * Show a k2 keyboard.
	 *
	 * **Note:** The view must include a <k2> node.
	 *
	 * @param {function} keyBindFunc When keyboard value is changed, this function sets your model value.
	 * @param {Object} opts Keyboard options.
	 * @returns {undefined}.
	 *
	 * Keyboard options:
	 * 
   *   name - The name of the keyboard to present ('default').
   *   animate - Whether or not the keyboard should animate in (true).
   *   mode - What parts the keyboard should present (ALL).
   *   value - The initial value of the keyboard ('').
   *   
	 * @example
	 *
	 *   k2.showKeyboard(angular.bind(scope, function(keyboardValue) {
	 *     this[kbModel] = keyboardValue;
   *   }), opts);
	 */
	root.showKeyboard = function(keyBindFunc, opts) {
		return k2i.showKeyboard(keyBindFunc, opts);
	};

	/**
	 * @ngdoc function
	 * @name hideKeyboard
	 * @module k2
	 * @kind function
	 *
	 * @description
	 * Hide the k2 keyboard.
	 *
	 * **Note:** The view must include a <k2> node.
	 *
	 * @param {function} callback Called after the keyboard has been hidden.
	 * @param {Object} opts Keyboard options.
	 * @returns {undefined}.
	 *
	 * Keyboard options:
	 * 
   *   animate - Whether or not the keyboard should animate out (true).
   *   
	 * @example
	 *
	 *   k2.showKeyboard(angular.bind(scope, function(keyboardValue) {
	 *     this[kbModel] = keyboardValue;
   *   }), opts);
	 */
	root.hideKeyboard = function(callback, opts) {
		return k2i.hideKeyboard(callback, opts);
	};

  return root;

});

'use strict';

angular.module('k2').factory('k2i', function($rootScope, $timeout, $templateRequest, lodash, platformInfo) {

  var root = {};

	root.modes = {
	  NONE: 'none',
	  ALL: 'all',
	  ACCESSORY_BAR_ONLY: 'acc-bar-only',
	  KEYBOARD_KEYS_ONLY: 'keys-only'
	};

	$rootScope.k2Visible = false;

	var accessoryBarRegistry = {};
	var animationDuration = 400;
	var cancelKeyListener;
	var cancelTemplateListener;
	var keyboardFocusedElement = undefined;
	var keyboardHeight = [];
	var keyboardMode = root.modes.ALL;
	var keyboardRegistry = {};
	var keyboardScope = undefined;
	var keyboardSettings = undefined;
	var keyboardValue = '';
	var nativeKeyboardPresented = false;
	var resizableHeightAttr = undefined;
	var windowHeight = 0;

  var defaultHideOptions = {
  	animate: true
  };

	///////////////////////////////////////////////////////////////////////////////////
	///
	/// Default settings
	/// 
  var defaultKeyboardSettings = {
  	// The name of the keyboard to present.
  	name: 'default',

  	// Whether or not the keyboard should animate in/out.
  	animate: true,

  	// Animation type.
  	animation: 'slide-up',

  	// Keyboard theme.
  	theme: 'stable',

  	// Whether or not tabbing should wrap top and bottom.
    infiniteTab: false,

  	// What parts the keyboard should present.
  	mode: root.modes.ALL,

  	// The initial value of the keyboard.
  	initialValue: '',

  	// Keyboard accessory bar.
		accessoryBar: {},

		// Defines the content to resize when the keyboard is presented.
    resizeContent: {
      enable: true,
      element: '.k2-resizable'
    },

    // Action to perform when a keyboard key is pressed.
		action: function(key) {
			$rootScope.$emit('K2Key', key.toString());
		},

  	// Keyboard scope link.
  	link: function(){}
  };

	///////////////////////////////////////////////////////////////////////////////////
	///
	/// Public interface
	/// 

	root.registerKeyboard = function(settings) {
		if (settings.name) {
			// Merge existing keyboard settings with the callers settings.
			if (settings.name in keyboardRegistry) {
				lodash.merge(settings, keyboardRegistry[settings.name]);
			}
			settings.accessoryBar = accessoryBarRegistry[settings.accessoryBar || 'default'];
			keyboardRegistry[settings.name] = settings;
		}
	};

	root.registerAccessoryBar = function(settings) {
		if (settings.name) {
			// Merge existing accessory bar settings with the callers settings.
			if (settings.name in accessoryBarRegistry) {
				lodash.merge(settings, accessoryBarRegistry[settings.name]);
			}
			accessoryBarRegistry[settings.name] = settings;
		}
	};

	root.getKeyboardValue = function() {
		return keyboardValue;
	};

	root.setKeyboardValue = function(value) {
		keyboardValue = value;
	};

	root.showKeyboard = function(keyBindFunc, settings) {
		var userKeyboardSettings = settings || defaultKeyboardSettings;
		keyboardSettings = lodash.cloneDeep(defaultKeyboardSettings);
		var targetKeyboardSettings = keyboardRegistry[settings.name];
		lodash.merge(keyboardSettings, targetKeyboardSettings, userKeyboardSettings);

		if (resizableHeightAttr == undefined) {
			resizableHeightAttr = getResizableElement().css('height');
		}

		// Don't continue until we know the keyboard position has been reset.
		positionKeyboard(null, function() {

			// Trigger showing the keyboard.
			if (keyboardIsInDOM(keyboardSettings.name)) {
				// The requested keyboard is already in the DOM.
				initialize(keyBindFunc, keyboardSettings);
				$rootScope.k2Visible = true;
			} else {

				// Link the keyboard with scope and bring it into the DOM.
				keyboardSettings.link(keyboardScope, keyboardSettings);

				if (cancelTemplateListener) {
					cancelTemplateListener();
				}

				// Wait for the requested keyboard to be added to the DOM.
			  cancelTemplateListener = $rootScope.$on('K2KeyboardInDOM', function(event, name, height) {
					initialize(keyBindFunc, keyboardSettings);
					$rootScope.k2Visible = true;
	        $rootScope.$emit('K2Ready', height);
			  });
			}
		});
	};

	root.hideKeyboard = function(callback, opts) {
		callback = callback || function(){};

		var userOpts = opts || defaultHideOptions;
		opts = lodash.cloneDeep(defaultHideOptions);
		lodash.merge(opts, userOpts);

		if (!$rootScope.k2Visible) {
			return callback();
		}

		if (!opts.animate) {
			// If no animation then immediately collapse the keyboard by setting height to zero.
			var kb = document.querySelectorAll('.k2:not(.ng-hide)')[0];
			if (kb) {
				var kbHeight = kb.style.height;
				kb.style.height = 0;
				// Allow keyboard to animate out then restore height attribute.
				$timeout(function() {
					kb.style.height = kbHeight;
				}, 1000);
			}
		}

		// Trigger hiding the keyboard.
		$rootScope.k2Visible = false;

		// Reset our state if the native keyboard was closed.
		nativeKeyboardPresented = false;
		enableResizableAnimation();
		positionKeyboard(null, true);

		if (nativeKeyboardIsVisible()) {
			nativeKeyboardDisableAnimation(false);
			nativeKeyboard.hide();
		}
		
		// Callback after the keyboard animation has finished.
		var cancelHiddenListener = $rootScope.$on('K2Hidden', function() {
			callback();
			cancelHiddenListener();
		});
	};

	root.getTabIndex = function() {
		if (keyboardFocusedElement) {
			return parseInt(keyboardFocusedElement.attr('k2-tabindex'));
		} else {
			return -1;
		}
	};

	root.focus = function(element) {
		// Move focus.  Only add focus class if the field is bound to the keyboard.
		if (keyboardFocusedElement && !nativeKeyboardshouldBeUsed()) {
			keyboardFocusedElement.removeClass('k2-focus');
		}

		keyboardFocusedElement = element;
		keyboardFocusedElement[0].focus();

		if (!nativeKeyboardshouldBeUsed()) {
			keyboardFocusedElement.addClass('k2-focus');
		}

		// Use timeout to wait for the keyboard to finish rendering.
		$timeout(function() {
			// Update the tab bar for current tab position.
	    $rootScope.$emit('K2UpdateTabBar', keyboardSettings);
		});
	};

	root.scrollIntoView = function(element) {
		$timeout(function() {
		  var elementRect = element[0].getBoundingClientRect();
		  var absoluteElementY = elementRect.bottom;

		  var scrollableElem = document.querySelectorAll(keyboardSettings.resizeContent.element)[0];
		  var scrollableHeight = scrollableElem.clientHeight;
		  var scrollableRect = scrollableElem.getBoundingClientRect();
		  var absoluteDestY = scrollableRect.top + (scrollableHeight / 2);
		  var scrollTop = absoluteElementY - absoluteDestY;

		  $(keyboardSettings.resizeContent.element).animate({
		    scrollTop: scrollTop
		  }, { duration: animationDuration, queue: false });
		});
	};

  root.initK2 = function(scope) {
  	windowHeight = $(window).height();

  	// Set the keyboard scope from the directive.
  	keyboardScope = scope;

    function ngShow() {
      if (scope.ngShow === true) {
        doShow();
      } else if (scope.ngShow === false) {
        doHide();
      }
    };
    
    function ngHide() {
      if (scope.ngHide === true) {
        doHide();
      } else if (scope.ngHide === false) {
        doShow();
      }
    };

    scope.animation = defaultKeyboardSettings.animation;
    scope.$watch("ngShow", ngShow);
    scope.$watch("ngHide", ngHide);

    nativeKeyboardHideAccessoryBar(true);
  };

  root.initNoK2 = function() {
    nativeKeyboardHideAccessoryBar(false);
  };

	///////////////////////////////////////////////////////////////////////////////////
	///
	/// Private functions
	/// 

  // Cache templates.
  $templateRequest('k2/templates/k2.tpl.html');

  $rootScope.$on('K2Ready', function(event, height) {
		keyboardHeight = height;
  });

  $rootScope.$on('K2Tab', tabListener);
	$rootScope.$on('K2UpdateTabBar', tabBarListener);
	$rootScope.$on('K2Shown', tabBarListener);

	function keyboardIsInDOM(name) {
		if (name == '_any') {
			return document.querySelectorAll('.k2 .k2-template [k2-name]').length > 0;
		} else {
			return document.querySelectorAll('.k2 .k2-template [k2-name="' + name + '"]').length > 0;
		}
	};

  function doShow() {
  	resizeContent(function(kbHeight) {
      $rootScope.$emit('K2Shown', kbHeight);
  	});
  };

  function doHide() {
    restoreContent();
    $timeout(function() {
      $rootScope.$emit('K2Hidden');
    }, animationDuration);
  };

	function initialize(keyBindFunc, keyboardSettings) {
		// Setup keyboard for presentation.
		setupKeyboard(keyboardSettings.mode);

		// Reset state.
		keyboardValue = keyboardSettings.initialValue;

		// Create a listener bound to the users scope variable.
		if (cancelKeyListener) {
			cancelKeyListener();
		}
		cancelKeyListener = $rootScope.$on('K2Key', function(event, key) {
			keyboardSettings.keyListener(key);
	    keyBindFunc(keyboardValue);
		});
	};

	// The timing and orchestration of this function allows the k2 keyboard to interact smoothly with the
	// native keyboard.
	function setupKeyboard(mode) {

		// If the keyboard is already visible then disable resizable animation while the keyboard is presented.
		// This prevents the animation from the running when transitioning between k2 and native keyboard (which
		// is visually unappealing).
		if ($rootScope.k2Visible) {
			disableResizableAnimation();
			nativeKeyboardDisableAnimation(true);
		}

		if (nativeKeyboardshouldBeUsed()) {

			// Disable keyboard animation while we re-position (for accessory bar) based on new view size
			// after native keyboard is presented.
//			disableAnimation();

			// Prepare for native keyboard presentation.
			// Remove our keyboard immediately.  Callback waits for DOM to render and allows the native keyboard to
			// start animating into the view.
			setKeyboardMode(root.modes.NONE, function() {

				nativeKeyboardPresented = true;

				// Setup keyboard and position the it into the view (the native keyboard has already resized our window).
				setKeyboardMode(mode);

			 	// Resize view for using only an accessory bar.
				resizeContent();

				// Re-position the top of the keyboard based on the new window size (after the keyboard has resized the view).
				var top = window.innerHeight - keyboardHeight[root.modes.ACCESSORY_BAR_ONLY];
				positionKeyboard(top, true);

				// Allow for keyboard positioning without animation before re-enabling it.
//				$timeout(function() {
//					enableAnimation();
//		  		$rootScope.$apply();
//				});
			});
		} else {

			var comingFromNativeKeyboard = nativeKeyboardPresented;
			nativeKeyboardPresented = false;

//			if (comingFromNativeKeyboard) {
//				// Ensure the positioning of the top of our keyboard is not affected by previous native keyboard use.
//				disableAnimation();

//				$timeout(function() {
//					enableAnimation();
//				});
//			}

			// Allow the keyboard top be reset before changing mode, etc.
			$timeout(function() {
				// If coming from the native keyboard to our keyboard then we need to allow the native animation
				// and view resize to start before we show our keyboard.
				if (comingFromNativeKeyboard) {

					$timeout(function() {
					 	// Set up the keyboard and resize the view for the keyboard mode.
						setKeyboardMode(mode);
						resizeContent();
					});
				} else {
					setKeyboardMode(mode);
				}
			});
		}
	};

	function setKeyboardMode(mode, callback) {
		keyboardMode = mode;
		switch(keyboardMode) {
			case root.modes.NONE:
				showAccessoryBar(false);
				showKeyboardKeys(false);
				break;
			case root.modes.ACCESSORY_BAR_ONLY:
				showAccessoryBar(true);
				showKeyboardKeys(false);
				break;
			case root.modes.KEYBOARD_KEYS_ONLY:
				showAccessoryBar(false);
				showKeyboardKeys(true);
				break;
			case root.modes.ALL:
			default:
				showAccessoryBar(true);
				showKeyboardKeys(true);
				break;
		}
		// Allows the keyboard to render.
		if (callback) {
			$timeout(function() {
				callback();
			});
		}
	};

  function getKeyboardElement() {
		return angular.element(document.querySelectorAll('.k2'));
  };

	function positionKeyboard(top, functionOrBool) {
		var callback = function(){};
		var disableAnimation = false;
		if (typeof functionOrBool == 'function') {
			callback = functionOrBool;
			disableAnimation = true;
		} else {
			disableAnimation = functionOrBool;
		}

		// Short circuit if there is nothing to do.
		var currentTop = getKeyboardElement().css('top');
		if (!top && currentTop == '') {
			return callback();
		}

		if (disableAnimation) {
			// Disable keyboard animation.
			getKeyboardElement().removeClass('animation-slide-up');
		}

		if (top) {
			getKeyboardElement().css('top', top + 'px');
		} else {
			getKeyboardElement().css('top', '');
		}

		if (disableAnimation) {
			$timeout(function() {
				// Enable keyboard animation.
				getKeyboardElement().addClass('animation-slide-up');
				callback();
			});
		}
	};
/*
	function disableAnimation() {
		getKeyboardElement().removeClass('animation-slide-up');
	};

	function enableAnimation() {
		getKeyboardElement().addClass('animation-slide-up');
	};
*/
	function disableResizableAnimation() {
		getResizableElement().addClass('animation-none');
	};

	function enableResizableAnimation() {
		getResizableElement().removeClass('animation-none');
	};

	function showAccessoryBar(display, animate) {
		var ab = document.querySelectorAll('.k2 .k2-acc-bar');
		ab[0].style.display = (display ? '' : 'none');
	};

	function showKeyboardKeys(display, animate) {
		var rows = document.querySelectorAll('.k2 .k2-row');
		for (var i = 0; i < rows.length; i++) {
			rows[i].style.display = (display ? 'flex' : 'none');
		}
	};

  function nativeKeyboardshouldBeUsed() {
		return keyboardFocusedElement.attr('k2-bind') == null;
  };

  function getResizableElement() {
		return angular.element(document.querySelectorAll(keyboardSettings.resizeContent.element));
  };

  function restoreContent() {
    if (keyboardSettings && keyboardSettings.resizeContent.enable) {
      getResizableElement().css('height', resizableHeightAttr);
      resizableHeightAttr = undefined;
    }
  };
  
  function resizeContent(callback) {
		if (keyboardSettings && keyboardSettings.resizeContent.enable) {
    	var elToResize = getResizableElement();
      var kbHeight = keyboardHeight[keyboardMode];
      elToResize.css('height', 'calc(100% - ' + kbHeight + 'px)');
    }

    if (callback) {
      callback(kbHeight);
    }
  };

  function tabListener(event, next, scope) {
    // Select direction of tab.
    // next field
    var increment = 1;
    if (!next) {
      // previous field
      increment = -1;
    }

    // Try to find the next element by incrementing the tab index.
    var tabIndex = 1;
    if (keyboardFocusedElement) {
      tabIndex = parseInt(keyboardFocusedElement.attr('k2-tabindex')) + increment;
    }
    var nextElem = angular.element(document.querySelector('[k2-tabindex="' + tabIndex + '"]'));

    if (keyboardSettings.infiniteTab) {
      // If no next element was selected then wrap around to select the element with tab index 1.
      if (!nextElem) {
        if (next) {
          tabIndex = 1;
        } else {
          // Set tab index to the last tab-able element.
          tabIndex = angular.element(document.querySelectorAll('[k2-tabindex]')).length;
        }
        nextElem = angular.element(document.querySelector('[k2-tabindex="' + tabIndex + '"]'));
      }

      if (!nextElem) {
        // Could not find a next element.  Should not happen.
        return;
      }
    }

    // Focus the keyboard on the next element (even if it's not bound to the keyboard).
    root.focus(nextElem);

    // If the next element does not use a k2 keyboard then close it and focus on the next
    // element (expecting the native keyboard).
    if (!nextElem.attr('k2-bind')) {
      // We use our tab bar when the native keyboard is used.
      // Chnage the keyboard mode, refresh our resizable content, and rescroll the in-focus element.
      // This process allows the tabbing of fields between custom and native keyboards.

		  // Any keyboard will do, we just need the accessory bar (tab bar in this case, since we're inside the tab listener).
      var settings = {
        name: '_any',
				mode: root.modes.ACCESSORY_BAR_ONLY
      };

      root.showKeyboard(null, settings);
      root.scrollIntoView(nextElem);
      nextElem[0].focus();
      return;
    }

    $timeout(function() {
      // Strip the model variable name (everything from last '.' to end) from scope qualified string.
      var nextModelName = nextElem.attr('ng-model').match(/[^\.]+$/g)[0];

      // Execute the elements click handler to run the input field click handler.
      // This executes users desired functionality when the field is selected without a touch click.
			nextElem.triggerHandler('click');

      // Ensure the field is visible in the resized view.
      root.scrollIntoView(nextElem);
    });
  };

  function tabBarListener(event) {
    // See if there are more fields beyond the next element we're focusing.
    var moreNext = true;
    var morePrev = true;
    if (!keyboardSettings.infiniteTab) {
      var tabIndex = parseInt(keyboardFocusedElement.attr('k2-tabindex'));
      moreNext = angular.element(document.querySelector('[k2-tabindex="' + (tabIndex + 1) + '"]'))[0] != undefined;
      morePrev = angular.element(document.querySelector('[k2-tabindex="' + (tabIndex - 1) + '"]'))[0] != undefined;
    }

    // Style tab buttons as needed.
    var tabNextElement = angular.element(document.querySelector('.k2-key-tab-next')).parent().parent();
    if (moreNext) {
      tabNextElement.removeClass('disabled');
    } else {
      tabNextElement.addClass('disabled');
    }

    var tabPreviousElement = angular.element(document.querySelector('.k2-key-tab-prev')).parent().parent();
    if (morePrev) {
      // Apply disabled style to tab previous button.
      tabPreviousElement.removeClass('disabled');
    } else {
      tabPreviousElement.addClass('disabled');
    }
  };

	///////////////////////////////////////////////////////////////////////////////////
	///
	/// Native keyboard wrapper
	/// 

  function nativeKeyboardDisableAnimation(b) {
    if (platformInfo.isCordova && Keyboard) {
			Keyboard.disableAnimation(b);
		}
  };

  function nativeKeyboardHideAccessoryBar(b) {
    if (platformInfo.isCordova && Keyboard) {
	    Keyboard.hideFormAccessoryBar(b);
	  }
  };

  function nativeKeyboardHide() {
    if (platformInfo.isCordova && Keyboard) {
	    Keyboard.hide();
	  }
  };

  function nativeKeyboardIsVisible() {
    if (platformInfo.isCordova && Keyboard) {
			return Keyboard.isVisible;
		} else {
			return false;
		}
  };

  return root;

});

'use strict';

angular.module('k2').factory('platformInfo', function($window) {

  var ua = navigator ? navigator.userAgent : null;

  if (!ua) {
    console.log('Could not determine navigator. Using fixed string');
    ua = 'dummy user-agent';
  }

  // Fixes IOS WebKit UA
  ua = ua.replace(/\(\d+\)$/, '');

  var isNodeWebkit = function() {
    var isNode = (typeof process !== "undefined" && typeof require !== "undefined");
    if (isNode) {
      try {
        return (typeof require('nw.gui') !== "undefined");
      } catch (e) {
        return false;
      }
    }
  };

  // Detect mobile devices
  var ret = {
    isAndroid: !!ua.match(/Android/i),
    isIOS: /iPad|iPhone|iPod/.test(ua) && !$window.MSStream,
    isWP: !!ua.match(/IEMobile/i),
    isSafari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
    ua: ua,
    isCordova: !!$window.cordova,
    isNW: isNodeWebkit(),
  };

  ret.isMobile = ret.isAndroid || ret.isIOS || ret.isWP;
  ret.isChromeApp = $window.chrome && chrome.runtime && chrome.runtime.id && !ret.isNW;
  ret.isDevel = !ret.isMobile && !ret.isChromeApp && !ret.isNW;

  return ret;
});

'use strict';

angular.module('k2').run(function($rootScope, k2i) {

  var settings = {
    name: 'tab',
    link: link,
    theme: 'ios',
    buttonPrevious: {
      html: '<div class="k2-key-tab-prev"><div class="svg-image" src="k2/img/k2-chevron-up.svg"></div>',
      action: function(scope) {
        $rootScope.$emit('K2Tab', false, scope);
      },
      style: {
        left: '5px'
      }
    },
    buttonNext: {
      html: '<div class="k2-key-tab-next"><div class="svg-image" src="k2/img/k2-chevron-down.svg"></div>',
      action: function(scope) {
        $rootScope.$emit('K2Tab', true, scope);
      },
      style: {
      }
    },
    buttonDone: {
      html: '<div class="k2-key-tab-done">Done</div>',
      action: function(scope) {
        k2i.hideKeyboard();
      },
      style: {
        right: '5px'
      }
    }
  };

  function link(scope, settings) {
    if (typeof settings.buttonPrevious != 'undefined' && typeof settings.buttonPrevious.style == 'object') {
      if (typeof settings.buttonPrevious.style.color != 'undefined') {
        scope.buttonPreviousStyle += 'color: ' + settings.buttonPrevious.style.color + ';';
      }
      if (typeof settings.buttonPrevious.style.borderColor != 'undefined') {
        scope.buttonPreviousStyle += 'border-color: ' + settings.buttonPrevious.style.borderColor + ' !important;';
      }
      if (typeof settings.buttonPrevious.style.fontSize != 'undefined') {
        scope.buttonPreviousFontSize = 'font-size: ' + settings.buttonPrevious.style.fontSize + ' !important;';
      }
      if (typeof settings.buttonPrevious.style.right != 'undefined') {
        scope.buttonPreviousWrapperStyle = 'position: absolute; right: ' + settings.buttonPrevious.style.right;
      }
      if (typeof settings.buttonPrevious.style.left != 'undefined') {
        scope.buttonPreviousWrapperStyle = 'position: relative; left: ' + settings.buttonPrevious.style.left;
      }
    }
    if (typeof settings.buttonNext != 'undefined' && typeof settings.buttonNext.style == 'object') {
      if (typeof settings.buttonNext.style.color != 'undefined') {
        scope.buttonNextStyle += 'color: ' + settings.buttonNext.style.color + ';';
      }
      if (typeof settings.buttonNext.style.borderColor != 'undefined') {
        scope.buttonNextStyle += 'border-color: ' + settings.buttonNext.style.borderColor + ' !important;';
      }
      if (typeof settings.buttonNext.style.fontSize != 'undefined') {
        scope.buttonNextFontSize = 'font-size: ' + settings.buttonNext.style.fontSize + ' !important;';
      }
      if (typeof settings.buttonNext.style.right != 'undefined') {
        scope.buttonNextWrapperStyle = 'position: absolute; right: ' + settings.buttonNext.style.right;
      }
      if (typeof settings.buttonNext.style.left != 'undefined') {
        scope.buttonNextWrapperStyle = 'position: relative; left: ' + settings.buttonNext.style.left;
      }
    }
    if (typeof settings.buttonDone != 'undefined' && typeof settings.buttonDone.style == 'object') {
      if (typeof settings.buttonDone.style.color != 'undefined') {
        scope.buttonDoneStyle += 'color: ' + settings.buttonDone.style.color + ';';
      }
      if (typeof settings.buttonDone.style.borderColor != 'undefined') {
        scope.buttonDoneStyle += 'border-color: ' + settings.buttonDone.style.borderColor + ' !important;';
      }
      if (typeof settings.buttonDone.style.fontSize != 'undefined') {
        scope.buttonDoneFontSize = 'font-size: ' + settings.buttonDone.style.fontSize + ' !important;';
      }
      if (typeof settings.buttonDone.style.right != 'undefined') {
        scope.buttonDoneWrapperStyle = 'position: absolute; right: ' + settings.buttonDone.style.right;
      }
      if (typeof settings.buttonDone.style.left != 'undefined') {
        scope.buttonDoneWrapperStyle = 'position: relative; left: ' + settings.buttonDone.style.left;
      }
    }

    // Accessory bar actions
    scope.showButtonPreviousAction = false;
    if (typeof settings.buttonPrevious != 'undefined') {
      scope.buttonPreviousHtml = settings.buttonPrevious.html;
      scope.showButtonPreviousAction = true;
      
      scope.buttonPreviousAction = function(event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          settings.buttonPrevious.action(scope);
        }
      }
    }

    scope.showButtonNextAction = false;
    if (typeof settings.buttonNext != 'undefined') {
      scope.buttonNextHtml = settings.buttonNext.html;
      scope.showButtonNextAction = true;
      
      scope.buttonNextAction = function(event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          settings.buttonNext.action(scope);
        }
      }
    }

    scope.showButtonDoneAction = false;
    if (typeof settings.buttonDone != 'undefined') {
      scope.buttonDoneHtml = settings.buttonDone.html;
      scope.showButtonDoneAction = true;
      
      scope.buttonDoneAction = function(event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          settings.buttonDone.action(scope);
        }
      }
    }
  };

  k2i.registerAccessoryBar(settings);

});

'use strict';

angular.module('k2').run(function($rootScope, k2i) {

  var keys = {
    DECIMAL: '.',
    DELETE: 'DEL'
  };

	var settings = {
    // K2 settings
    // 
    name: 'digit',
    accessoryBar: 'tab',
		link: link,
    keyListener: keyListener,

    // Keyboard specific settings
    // 
		theme: 'ios',
    showLetters: false,
    roundButtons: false,
    width: '100%',
    align: 'center',

		// Decimal point button.
		buttonDecimal: {
			html: '<div class="k2-digit-key-left k2-digit-key-decimal">.</div>',
			action: function() {
				$rootScope.$emit('K2Key', keys.DECIMAL);
			},
			style: {}
		},

		// Delete button.
		buttonDelete: {
			html: '<div class="k2-digit-key-right k2-digit-key-delete"><div class="svg-image" src="k2/img/k2-digit-delete.svg"></div></div>',
			action: function() {
				$rootScope.$emit('K2Key', keys.DELETE);
			},
			style: {}
		}
	};

  function link(scope, settings) {
    // Link our accessory bar.
    settings.accessoryBar.link(scope, settings.accessoryBar);

    // General settings
    scope.k2Name = settings.name;
    scope.showLetters = settings.showLetters;
    scope.roundButtons = settings.roundButtons;
    scope.numberAction = settings.action;
    scope.width = settings.width;
    scope.align = settings.align;
    scope.theme = settings.theme;

    scope.leftStyle = '';
    scope.leftFontSize = '';
    scope.rightStyle = '';
    scope.rightFontSize = '';

    // Styles
    if (typeof settings.buttonDecimal != 'undefined' && typeof settings.buttonDecimal.style == 'object') {
      if (typeof settings.buttonDecimal.style.color != 'undefined') {
        scope.leftStyle += 'color: ' + settings.buttonDecimal.style.color + ';';
      }
      if (typeof settings.buttonDecimal.style.borderColor != 'undefined') {
        scope.leftStyle += 'border-color: ' + settings.buttonDecimal.style.borderColor + ' !important;';
      }
      if (typeof settings.buttonDecimal.style.fontSize != 'undefined') {
        scope.leftFontSize = 'font-size: ' + settings.buttonDecimal.style.fontSize + ' !important;';
      }
    }
    if (typeof settings.buttonDelete != 'undefined' && typeof settings.buttonDelete.style == 'object') {
      if (typeof settings.buttonDelete.style.color != 'undefined') {
        scope.rightStyle += 'color: ' + settings.buttonDelete.style.color + ';';
      }
      if (typeof settings.buttonDelete.style.borderColor != 'undefined') {
        scope.rightStyle += 'border-color: ' + settings.buttonDelete.style.borderColor + ' !important;';
      }
      if (typeof settings.buttonDelete.style.fontSize != 'undefined') {
        scope.rightFontSize = 'font-size: ' + settings.buttonDelete.style.fontSize + ' !important;';
      }
    }

    // Decimal action
    scope.showDecimalAction = false;
    if (typeof settings.buttonDecimal != 'undefined') {
      scope.buttonDecimalHtml = settings.buttonDecimal.html;
      scope.showDecimalAction = true;

      scope.buttonDecimalAction = function(event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          settings.buttonDecimal.action(scope);
        }
      }
    }
    
    // Delete action
    scope.showDeleteAction = false;
    if (typeof settings.buttonDelete != 'undefined') {
      scope.buttonDeleteHtml = settings.buttonDelete.html;
      scope.showDeleteAction = true;
      
      scope.buttonDeleteAction = function(event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          settings.buttonDelete.action(scope);
        }
      }
    }
  };

  function keyListener(key) {
    switch (key) {
      case keys.DELETE:
        // Remove right-most character.
        k2i.setKeyboardValue(k2i.getKeyboardValue().slice(0, -1));
        if (k2i.getKeyboardValue().charAt(k2i.getKeyboardValue().length-1) == '.') {
          // Remove the decimal point if it's the last character.
          k2i.setKeyboardValue(k2i.getKeyboardValue().slice(0, -1));
        }
        break;
      default:
        if (key != keys.DECIMAL || key == keys.DECIMAL && !k2i.getKeyboardValue().includes(keys.DECIMAL)) { // Allow only one decimal point.
          if (!k2i.getKeyboardValue().match(/\.[0-9]{2}/g)) { // Stop accepting characters after 2 decimal places.
            if (!(key == '0' && k2i.getKeyboardValue().match(/^0$/g))) { // Don't accept multiple leading zeros.

              if (key.match(/[1-9]/g) &&  k2i.getKeyboardValue().match(/^0$/g)) { // Don't leave a leading zero on the left side of decimal.
                k2i.setKeyboardValue('');
              }
              k2i.setKeyboardValue(k2i.getKeyboardValue() + key);
            }
          }
        }
    }
  };

  k2i.registerKeyboard(settings);

});

'use strict';

angular.module('k2').run(function($rootScope, k2i) {

	var settings = {
    // K2 settings
    // 
    name: 'tab',
    mode: k2i.modes.ACCESSORY_BAR_ONLY,
    accessoryBar: 'tab',
	  link: link,
    keyListener: function(){},
    action: function(){},

    // Keyboard specific settings
    // 
  	theme: 'ios'
  };

  function link(scope, settings) {
    // General settings
    scope.k2Name = settings.name;
    scope.theme = settings.theme;
  };

  k2i.registerKeyboard(settings);

});
