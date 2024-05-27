(function () {
  var ns = $.namespace('pskl.service');

  ns.BeforeUnloadService = function (piskelController) {
    this.piskelController = piskelController;
  };

  ns.BeforeUnloadService.prototype.init = function () {
    if (pskl.utils.Environment.detectElectron()) {
      window.electron.handle('close', (event, data) => {
        const onClose = this.onElectronWindowClose();
        if (onClose) {
          window.electron.send('closeEmit', 'closeEmit');
          return true;
        }

        return false;
      });
    }

    window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
  };

  ns.BeforeUnloadService.prototype.onElectronWindowClose = function () {
    var msg = this.onBeforeUnload();
    if (msg !== undefined) {
      if (!window.confirm(msg)) {
        return false;
      }
    }

    return true;
  };

  ns.BeforeUnloadService.prototype.onBeforeUnload = function (evt) {
    // Attempt one last backup. Some of it may fail due to the asynchronous
    // nature of IndexedDB.
    pskl.app.backupService.backup();
    if (pskl.app.savedStatusService.isDirty()) {
      var confirmationMessage = 'Your current sprite has unsaved changes. Are you sure you want to quit?';

      evt = evt || window.event;
      if (evt) {
        evt.returnValue = confirmationMessage;
      }
      return confirmationMessage;
    }

    return undefined;
  };

})();
