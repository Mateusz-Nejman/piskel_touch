/**
 *  detection method from:
 *  http://videlais.com/2014/08/23/lessons-learned-from-detecting-node-webkit/
 */

(function () {

  var ns = $.namespace('pskl.utils');

  ns.Environment = {
    detectElectron : function () {
      if (typeof window !== 'undefined' && typeof window.process !== 'undefined' && window.process.type === 'renderer') {
        return true;
      }

      if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
        return true;
      }

      if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
        return true;
      }

      return false;
    },

    isIntegrationTest : function () {
      return window.location.href.indexOf('integration-test') !== -1;
    },

    isDebug : function () {
      return window.location.href.indexOf('debug') !== -1;
    },

    isHttps : function () {
      return window.location.href.indexOf('https://') === 0;
    },
  };

})();
