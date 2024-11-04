'use strict';

angular.module('insight.system').controller('FooterController',
  function($scope, $route, $templateCache, gettextCatalog, amMoment,  Version) {

    $scope.defaultLanguage = defaultLanguage;

    var _getVersion = function() {
      Version.get({},
        function(res) {
          $scope.version = res.version;
        });
    };

    $scope.version = _getVersion();
	
    $scope.availableLanguages = [{
      name: 'English',
      isoCode: 'en',
    }, {
      name: 'Deutsch',
      isoCode: 'de_DE',
    }, {
      name: 'Español',
      isoCode: 'es',
    }, {
      name: '⽇本語',
      isoCode: 'ja',
    }, {
      name: 'Русский',
      isoCode: 'ru',
    }, {
      name: 'Français',
      isoCode: 'fr_FR',
    }, {
      name: 'Bahasa Indonesia',
      isoCode: 'id_ID',
    }, {
      name: 'Basa Jawa',
      isoCode: 'jv_ID',
    }];

    $scope.setLanguage = function(isoCode) {
      gettextCatalog.currentLanguage = $scope.defaultLanguage = defaultLanguage = isoCode;
      amMoment.changeLocale(isoCode);
      localStorage.setItem('insight-language', isoCode);
      var currentPageTemplate = $route.current.templateUrl;
      $templateCache.remove(currentPageTemplate);
      location.reload();
    };

  });
