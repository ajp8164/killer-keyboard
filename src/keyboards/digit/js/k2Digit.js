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
		leftButton: {
			html: '<div class="k2-digit-key-left k2-digit-key-decimal">.</div>',
			action: function() {
				$rootScope.$emit('K2Key', keys.DECIMAL);
			},
			style: {}
		},

		// Delete button.
		rightButton: {
			html: '<div class="k2-digit-key-right k2-digit-key-delete"><div class="svg-image" src="k2/img/k2-digit-delete.svg"></div></div>',
			action: function() {
				$rootScope.$emit('K2Key', keys.DELETE);
			},
			style: {}
		}
	};

  function link(scope, settings) {
    // General settings
    scope.k2Name = settings.name;
    scope.showLetters = settings.showLetters;
    scope.roundButtons = settings.roundButtons;
    scope.numberAction = settings.action;
    scope.width = settings.width;
    scope.align = settings.align;

    scope.leftStyle = '';
    scope.leftFontSize = '';
    scope.rightStyle = '';
    scope.rightFontSize = '';
    scope.button0Style = '';
    scope.button0FontSize = '';
    scope.button0WrapperStyle = '';
    scope.button1Style = '';
    scope.button1FontSize = '';
    scope.button1WrapperStyle = '';
    scope.button2Style = '';
    scope.button2FontSize = '';
    scope.button2WrapperStyle = '';

    // Styles
    scope.theme = settings.theme || 'stable';
    if (typeof settings.leftButton != 'undefined' && typeof settings.leftButton.style == 'object') {
      if (typeof settings.leftButton.style.color != 'undefined') {
        scope.leftStyle += 'color: ' + settings.leftButton.style.color + ';';
      }
      if (typeof settings.leftButton.style.borderColor != 'undefined') {
        scope.leftStyle += 'border-color: ' + settings.leftButton.style.borderColor + ' !important;';
      }
      if (typeof settings.leftButton.style.fontSize != 'undefined') {
        scope.leftFontSize = 'font-size: ' + settings.leftButton.style.fontSize + ' !important;';
      }
    }
    if (typeof settings.rightButton != 'undefined' && typeof settings.rightButton.style == 'object') {
      if (typeof settings.rightButton.style.color != 'undefined') {
        scope.rightStyle += 'color: ' + settings.rightButton.style.color + ';';
      }
      if (typeof settings.rightButton.style.borderColor != 'undefined') {
        scope.rightStyle += 'border-color: ' + settings.rightButton.style.borderColor + ' !important;';
      }
      if (typeof settings.rightButton.style.fontSize != 'undefined') {
        scope.rightFontSize = 'font-size: ' + settings.rightButton.style.fontSize + ' !important;';
      }
    }
    if (typeof settings.accessoryBar.button0 != 'undefined' && typeof settings.accessoryBar.button0.style == 'object') {
      if (typeof settings.accessoryBar.button0.style.color != 'undefined') {
        scope.button0Style += 'color: ' + settings.accessoryBar.button0.style.color + ';';
      }
      if (typeof settings.accessoryBar.button0.style.borderColor != 'undefined') {
        scope.button0Style += 'border-color: ' + settings.accessoryBar.button0.style.borderColor + ' !important;';
      }
      if (typeof settings.accessoryBar.button0.style.fontSize != 'undefined') {
        scope.button0FontSize = 'font-size: ' + settings.accessoryBar.button0.style.fontSize + ' !important;';
      }
      if (typeof settings.accessoryBar.button0.style.right != 'undefined') {
        scope.button0WrapperStyle = 'position: absolute; right: ' + settings.accessoryBar.button0.style.right;
      }
    }
    if (typeof settings.accessoryBar.button1 != 'undefined' && typeof settings.accessoryBar.button1.style == 'object') {
      if (typeof settings.accessoryBar.button1.style.color != 'undefined') {
        scope.button1Style += 'color: ' + settings.accessoryBar.button1.style.color + ';';
      }
      if (typeof settings.accessoryBar.button1.style.borderColor != 'undefined') {
        scope.button1Style += 'border-color: ' + settings.accessoryBar.button1.style.borderColor + ' !important;';
      }
      if (typeof settings.accessoryBar.button1.style.fontSize != 'undefined') {
        scope.button1FontSize = 'font-size: ' + settings.accessoryBar.button1.style.fontSize + ' !important;';
      }
      if (typeof settings.accessoryBar.button1.style.right != 'undefined') {
        scope.button1WrapperStyle = 'position: absolute; right: ' + settings.accessoryBar.button1.style.right;
      }
    }
    if (typeof settings.accessoryBar.button2 != 'undefined' && typeof settings.accessoryBar.button2.style == 'object') {
      if (typeof settings.accessoryBar.button2.style.color != 'undefined') {
        scope.button2Style += 'color: ' + settings.accessoryBar.button2.style.color + ';';
      }
      if (typeof settings.accessoryBar.button2.style.borderColor != 'undefined') {
        scope.button2Style += 'border-color: ' + settings.accessoryBar.button2.style.borderColor + ' !important;';
      }
      if (typeof settings.accessoryBar.button2.style.fontSize != 'undefined') {
        scope.button2FontSize = 'font-size: ' + settings.accessoryBar.button2.style.fontSize + ' !important;';
      }
      if (typeof settings.accessoryBar.button2.style.right != 'undefined') {
        scope.button2WrapperStyle = 'position: absolute; right: ' + settings.accessoryBar.button2.style.right;
      }
    }

    // Left action
    scope.showLeftAction = false;
    if (typeof settings.leftButton != 'undefined') {
      scope.leftHtml = settings.leftButton.html;
      scope.showLeftAction = true;

      scope.leftAction = function(event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          settings.leftButton.action(scope);
        }
      }
    }
    
    // Right action
    scope.showRightAction = false;
    if (typeof settings.rightButton != 'undefined') {
      scope.rightHtml = settings.rightButton.html;
      scope.showRightAction = true;
      
      scope.rightAction = function(event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          settings.rightButton.action(scope);
        }
      }
    }

    // Accessory bar actions
    scope.showButton0Action = false;
    if (typeof settings.accessoryBar.button0 != 'undefined') {
      scope.button0Html = settings.accessoryBar.button0.html;
      scope.showButton0Action = true;
      
      scope.button0Action = function(event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          settings.accessoryBar.button0.action(scope);
        }
      }
    }

    scope.showButton1Action = false;
    if (typeof settings.accessoryBar.button1 != 'undefined') {
      scope.button1Html = settings.accessoryBar.button1.html;
      scope.showButton1Action = true;
      
      scope.button1Action = function(event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          settings.accessoryBar.button1.action(scope);
        }
      }
    }

    scope.showButton2Action = false;
    if (typeof settings.accessoryBar.button2 != 'undefined') {
      scope.button2Html = settings.accessoryBar.button2.html;
      scope.showButton2Action = true;
      
      scope.button2Action = function(event) {
        if (!event.currentTarget.classList.contains('disabled')) {
          settings.accessoryBar.button2.action(scope);
        }
      }
    }
  };

  function keyListener(key) {
    switch (key) {
      case keys.DELETE:
        // Remove right-most character.
        k2i.setKeyboardValue(k2i.getKeyboardValue().slice(0, -1));
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
