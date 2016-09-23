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
	 * FULL - Present the accessory bar and the keyboard keys.
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
	 * @param {function} callback When keyboard value is changed, this callback sets your model.
	 * @param {Object} opts Keyboard options.
	 * @returns {undefined}.
	 *
	 * Keyboard options:
	 * 
   *   name - The name of the keyboard to present ('default').
   *   animate - Whether or not the keyboard should animate in (true).
   *   mode - What parts the keyboard should present (FULL).
   *   value - The initial value of the keyboard ('').
   *   
	 * @example
	 *
	 *   k2.showKeyboard(angular.bind(scope, function(keyboardValue) {
	 *     this[kbModel] = keyboardValue;
   *   }), opts);
	 */
	root.showKeyboard = function(callback, opts) {
		return k2i.showKeyboard(callback, opts);
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
