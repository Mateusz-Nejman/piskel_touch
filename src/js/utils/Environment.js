/**
 *  detection method from:
 *  http://videlais.com/2014/08/23/lessons-learned-from-detecting-node-webkit/
 */

(function () {

  var ns = $.namespace('pskl.utils');

  ns.Environment = {
    detectNative : function () {
      return window.NL_ISNEUTRALINO !== undefined && window.NL_ISNEUTRALINO;
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
