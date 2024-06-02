(function () {
  var ns = $.namespace('pskl.model');

  /**
     * @constructor
     * @param {pskl.controller.piskel.PiskelController} piskel
     * @param {pskl.service.HistoryService} history
     */
  ns.Tab = function (piskel, history) {
    this.setData(piskel, history);
  };

  ns.Tab.setData = function (piskel, history) {
    this.piskel = piskel;
    this.history = history;
  };

  ns.Tab.setActive = function() {
    pskl.app.PiskelController.setPiskel(this.piskel);//TODO history
  };
})();
