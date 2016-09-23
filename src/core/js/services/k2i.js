'use strict';

angular.module('k2').factory('k2i', function($rootScope, $timeout, $templateRequest, lodash, platformInfo) {

  var root = {};

	root.modes = {
	  FULL: 'full',
	  ACCESSORY_BAR_ONLY: 'acc-bar-only',
	  KEYBOARD_KEYS_ONLY: 'keys-only'
	};

	$rootScope.k2Visible = false;

	var animationDuration = 400;
	var cancelKeyListener;
	var cancelTemplateListener;
	var keyboardFocusedElement = undefined;
	var keyboardHeight = [];
	var keyboardMode = root.modes.FULL;
	var keyboardRegistry = {};
	var keyboardScope = undefined;
	var keyboardSettings = undefined;
	var keyboardValue = '';
	var nativeKeyboardPresented = false;
	var resizeContentHeightAttr = '';
	var windowHeight = 0;

  var defaultHideOptions = {
  	animate: true
  };

	///////////////////////////////////////////////////////////////////////////////////
	///
	/// Accessory bar definitions
	/// 
	var noAccessoryBar = {};

	var tabBar = {
		button0: {
			html: '<div class="k2-key-tab-prev"><div class="svg-image" src="k2/img/k2-previous.svg"></div>',
			action: function(scope) {
				$rootScope.$emit('K2Tab', false, scope);
			},
			style: {
			}
		},
		button1: {
			html: '<div class="k2-key-tab-next"><div class="svg-image" src="k2/img/k2-next.svg"></div>',
			action: function(scope) {
				$rootScope.$emit('K2Tab', true, scope);
			},
			style: {
			}
		},
		button2: {
			html: '<div class="k2-key-tab-done">Done</div>',
			action: function(scope) {
				root.hideKeyboard();
			},
			style: {
				right: '5px'
			}
		}
	};

	var accessoryBar = {
		default: noAccessoryBar,
		tab: tabBar
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

  	// Whether or not tabbing should wrap top and bottom.
    infiniteTab: false,

  	// What parts the keyboard should present.
  	mode: root.modes.FULL,

  	// The initial value of the keyboard.
  	initialValue: '',

  	// Keyboard accessory bar.
		accessoryBar: noAccessoryBar,

		//
    resizeContent: {
      enable: true,
      element: '[k2-resizeable]'
    },

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
			settings.accessoryBar = accessoryBar[settings.accessoryBar || 'default'];
			keyboardRegistry[settings.name] = settings;
		}
	};

	root.getKeyboardValue = function() {
		return keyboardValue;
	};

	root.setKeyboardValue = function(value) {
		keyboardValue = value;
	};

	root.showKeyboard = function(callback, settings) {
		callback = callback || function(){};

		var userKeyboardSettings = settings || defaultKeyboardSettings;
		keyboardSettings = lodash.cloneDeep(defaultKeyboardSettings);
		var targetKeyboardSettings = keyboardRegistry[settings.name];
		lodash.merge(keyboardSettings, targetKeyboardSettings, userKeyboardSettings);

		// Trigger showing the keyboard.
		if (keyboardIsInDOM(keyboardSettings.name)) {
			// The requested keyboard is already in the DOM.
			initialize(callback, keyboardSettings);
			$rootScope.k2Visible = true;
		} else {

			// Link the keyboard with scope and bring it into the DOM.
			keyboardSettings.link(keyboardScope, keyboardSettings);

			if (cancelTemplateListener) {
				cancelTemplateListener();
			}

			// Wait for the requested keyboard to be added to the DOM.
		  cancelTemplateListener = $rootScope.$on('K2KeyboardInDOM', function(event, name, height) {
				initialize(callback, keyboardSettings);
				$rootScope.k2Visible = true;
        $rootScope.$emit('K2Ready', height);
		  });
		}
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

		if (!nativeKeyboardshouldBeUsed()) {
			keyboardFocusedElement.addClass('k2-focus');
		}

		// Use timeout to wait for the keyboard to finish rendering.
		$timeout(function() {
			if ($rootScope.k2Visible && !keyboardSettings.infiniteTab) {
				// Update the tab bar for current tab position.
		    $rootScope.$emit('K2UpdateTabBar', keyboardSettings);
		  }
		}, 0);
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
		}, 0);
	};

  root.initK2 = function(scope) {

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

    // Hide the native keyboard accessory bar.
    if (platformInfo.isCordova && Keyboard) {
      Keyboard.hideFormAccessoryBar(true);
    }
  };

	///////////////////////////////////////////////////////////////////////////////////
	///
	/// Private functions
	/// 

  // Cache templates.
  $templateRequest('k2/templates/k2.tpl.html');

  $rootScope.$on('K2Ready', function(event, height) {
  	windowHeight = $(window).height();
		keyboardHeight = height;
 		resizeContentHeightAttr = getResizeElement().style.height;
  });

  $rootScope.$on('K2Tab', tabListener);
	$rootScope.$on('K2UpdateTabBar', tabBarListener);

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

	function initialize(callback, keyboardSettings) {
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
	    callback(keyboardValue);
		});
	};

	// The timing and orchestration of this function allows our accessory bar to be displayed smoothly
	// with the native keyboard.
	function setupKeyboard(mode) {
		if (nativeKeyboardshouldBeUsed()) {
			// Prepare for native keyboard presentation.
			// Remove our keyboard immediately.
			showAccessoryBar(false);
			showKeyboardKeys(false);

			// Position the top of our keyboard below the window; disable animation during this operation.
			disableAnimation();
			positionKeyboardOutOfView();
			restoreContent();

			// Use timeout to allow the native keyboard to start animating into the view.
			$timeout(function() {
				nativeKeyboardPresented = true;

				// Setup keyboard and position the it into the view (the native keyboard has already resized our window).
				setKeyboardMode(mode);
				positionKeyboardInView();

				// Allow for keyboard positioning without animation before re-enabling it.
				$timeout(function() {
					enableAnimation();
		  		$rootScope.$apply();
				}, 0);
			}, 0);

		} else {

			var comingFromNativeKeyboard = nativeKeyboardPresented;
			nativeKeyboardPresented = false;

			// If coming from the native keyboard to our keyboard then we need to allow the native animation
			// and view resize to start before we show our keyboard.
			if (comingFromNativeKeyboard) {
				resizeContent();
				
				$timeout(function() {
					setKeyboardMode(mode);
					positionKeyboardInView();
				}, 0);
			} else {
				setKeyboardMode(mode);
				positionKeyboardInView();
			}
		}
	};

	function setKeyboardMode(mode, animate) {
		keyboardMode = mode;
		switch(keyboardMode) {
			case root.modes.ACCESSORY_BAR_ONLY:
				showAccessoryBar(true);
				showKeyboardKeys(false);
				break;
			case root.modes.KEYBOARD_KEYS_ONLY:
				showAccessoryBar(false);
				showKeyboardKeys(true);
				break;
			case root.modes.FULL:
			default:
				showAccessoryBar(true);
				showKeyboardKeys(true);
				break;
		}
	};

  function getKeyboardElement() {
		return angular.element(document.querySelectorAll('.k2'));
  };

	function positionKeyboardInView() {
		// Position the keyboard in view.
		var top = $(window).height()  - keyboardHeight[keyboardMode];
		getKeyboardElement().css('top', top + 'px');
	};

	function positionKeyboardOutOfView() {
		// Position the keyboard top at the bottom of the window (out of view).
		var top = windowHeight;
		getKeyboardElement().css('top', top + 'px');
	};

	function disableAnimation() {
		getKeyboardElement().removeClass('animation-slide-up');
	};

	function enableAnimation() {
		getKeyboardElement().addClass('animation-slide-up');
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

  function getResizeElement() {
		return document.querySelectorAll(keyboardSettings.resizeContent.element)[0];
  };

  function restoreContent() {
    if (keyboardSettings && keyboardSettings.resizeContent.enable) {
      getResizeElement().style.height = resizeContentHeightAttr;
    }
  };
  
  function resizeContent(callback) {
		if (keyboardSettings && keyboardSettings.resizeContent.enable) {
    	var elToResize = getResizeElement();
      var kbHeight = keyboardHeight[keyboardMode];
      elToResize.style.height = 'calc(100% - ' + kbHeight + 'px)';
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

      var settings = {
        name: '_any',  // Any keyboard will do, we just need the accessory bar (tab bar in this case).
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

      // Bind the model to the keyboard and show the keyboard.
      var settings = {
        name: nextElem.attr('k2-bind')
      };

      // Execute the elements click handler to run the input field click handler.
      // This executes users desired functionality when the field is selected without a touch click.
			nextElem.triggerHandler('click');

      // Ensure the field is visible in the resized view.
      root.scrollIntoView(nextElem);
    }, 0);
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

  return root;

});
