(function () {
  var ns = $.namespace('pskl.service');

  ns.BeforeUnloadService = function (piskelController) {
    this.piskelController = piskelController;
  };

  ns.BeforeUnloadService.prototype.init = function () {
    if (pskl.utils.Environment.detectNative()) {
      // eslint-disable-next-line no-undef
      Neutralino.events.on('windowClose', this.onNativeWindowClose.bind(this));
    }

    window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
  };

  ns.BeforeUnloadService.prototype.onNativeWindowClose = function () {
    var msg = this.onBeforeUnload();
    if (msg) {
      if (!window.confirm(msg)) {
        return false;
      }
    }
    // eslint-disable-next-line no-undef
    Neutralino.app.exit();
  };

  ns.BeforeUnloadService.prototype.onBeforeUnload = function (evt) {
    // Attempt one last backup. Some of it may fail due to the asynchronous
    // nature of IndexedDB.
    pskl.app.backupService.backup();
    if (pskl.app.savedStatusService.isDirtyAny()) {
      var confirmationMessage = 'Your current sprite has unsaved changes. Are you sure you want to quit?';

      evt = evt || window.event;
      if (evt) {
        evt.returnValue = confirmationMessage;
      }
      return confirmationMessage;
    }
  };

})();
