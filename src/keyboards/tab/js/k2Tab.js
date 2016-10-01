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
