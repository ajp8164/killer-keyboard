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
