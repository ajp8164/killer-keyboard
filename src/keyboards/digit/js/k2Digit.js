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
