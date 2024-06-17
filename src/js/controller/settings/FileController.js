(function () {
  var ns = $.namespace('pskl.controller.settings');
  var ens = $.namespace('pskl.controller.settings.exportimage');

  var PARTIALS = {
    DESKTOP : 'save-desktop-partial',
    FILEDOWNLOAD : 'save-file-download-partial'
  };

  var tabs = {
    'png' : {
      template : 'templates/settings/export/png.html',
      controller : ens.PngExportController
    },
    'gif' : {
      template : 'templates/settings/export/gif.html',
      controller : ens.GifExportController
    },
    'zip' : {
      template : 'templates/settings/export/zip.html',
      controller : ens.ZipExportController
    }
  };

  ns.FileController = function (piskelController) {
    this.piskelController = piskelController;

    this.tabsWidget = new pskl.widgets.Tabs(tabs, this, pskl.UserSettings.EXPORT_TAB);
    this.onSizeInputChange_ = this.onSizeInputChange_.bind(this);
  };

  pskl.utils.inherit(ns.FileController, pskl.controller.settings.AbstractSettingController);

  ns.FileController.prototype.init = function () {
    this.hiddenOpenInput = document.querySelector('[name="open-input"]');
    this.addEventListener('.browse-backups-button', 'click', this.onBrowseBackupsClick_);
    // different handlers, depending on the Environment
    this.addEventListener(this.hiddenOpenInput, 'change', this.onOpenChange_);
    this.addEventListener('.open-button', 'click', this.onOpenClick_);

    this.saveForm = document.querySelector('.save-form');
    this.insertSavePartials_();

    this.piskelName = document.querySelector('.piskel-name');
    this.descriptionInput = document.querySelector('#save-description');
    this.nameInput =  document.querySelector('#save-name');
    this.isPublicCheckbox = document.querySelector('input[name=save-public-checkbox]');
    this.updateDescriptorInputs_();

    this.saveDesktopButton = document.querySelector('#save-desktop-button');
    this.saveDesktopAsNewButton = document.querySelector('#save-desktop-as-new-button');
    this.saveFileDownloadButton = document.querySelector('#save-file-download-button');

    this.safeAddEventListener_(this.saveDesktopButton, 'click', this.saveToDesktop_);
    this.safeAddEventListener_(this.saveDesktopAsNewButton, 'click', this.saveToDesktopAsNew_);
    this.safeAddEventListener_(this.saveFileDownloadButton, 'click', this.saveToFileDownload_);

    this.addEventListener(this.saveForm, 'submit', this.onSaveFormSubmit_);

    if (pskl.app.storageService.isSaving()) {
      this.disableSaveButtons_();
    }

    $.subscribe(Events.BEFORE_SAVING_PISKEL, this.disableSaveButtons_.bind(this));
    $.subscribe(Events.AFTER_SAVING_PISKEL, this.enableSaveButtons_.bind(this));

    this.scaleInput = document.querySelector('.export-scale .scale-input');
    this.addEventListener(this.scaleInput, 'change', this.onScaleChange_);
    this.addEventListener(this.scaleInput, 'input', this.onScaleChange_);

    this.widthInput = document.querySelector('.export-resize .resize-width');
    this.heightInput = document.querySelector('.export-resize .resize-height');
    var scale = pskl.UserSettings.get(pskl.UserSettings.EXPORT_SCALE);
    this.sizeInputWidget = new pskl.widgets.SizeInput({
      widthInput : this.widthInput,
      heightInput : this.heightInput,
      initWidth : this.piskelController.getWidth() * scale,
      initHeight : this.piskelController.getHeight() * scale,
      onChange : this.onSizeInputChange_
    });

    this.onSizeInputChange_();
    this.tabsWidget.init(document.querySelector('.settings-section-file'));
  };

  ns.FileController.prototype.closeDrawer_ = function () {
    $.publish(Events.CLOSE_SETTINGS_DRAWER);
  };
  ns.FileController.prototype.onFileUploadChange_ = function (evt) {
    var files = this.hiddenOpenInput.files;
    var areImages = Array.prototype.every.call(files, function (file) {
      return file.type.indexOf('image') === 0;
    });
    if (areImages) {
      $.publish(Events.DIALOG_SHOW, {
        dialogId : 'import',
        initArgs : {
          rawFiles: files
        }
      });
      this.closeDrawer_();
    } else {
      this.closeDrawer_();
      console.error('Some files are not images');
    }
  };

  ns.FileController.prototype.onOpenChange_ = function (evt) {
    var files = this.hiddenOpenInput.files;
    if (files.length == 1) {
      if (this.isPiskel_(files[0])) {
        this.openPiskelFile_(files[0]);
      } else {
        this.onFileUploadChange_(evt);
      }
    } else {
      this.onFileUploadChange_(evt);
    }
  };

  ns.FileController.prototype.openDesktop_ = function (evt) {
    this.closeDrawer_();
    pskl.app.desktopStorageService.openPiskel();
  };

  ns.FileController.prototype.onOpenClick_ = function (evt) {
    this.hiddenOpenInput.click();
  };

  ns.FileController.prototype.onBrowseBackupsClick_ = function (evt) {
    $.publish(Events.DIALOG_SHOW, {
      dialogId : 'browse-backups'
    });
    this.closeDrawer_();
  };

  ns.FileController.prototype.openPiskelFile_ = function (file) {
    if (this.isPiskel_(file)) {
      $.publish(Events.DIALOG_SHOW, {
        dialogId : 'import',
        initArgs : {
          rawFiles: [file]
        }
      });
      this.closeDrawer_();
    } else {
      this.closeDrawer_();
      console.error('The selected file is not a piskel file');
    }
  };

  ns.FileController.prototype.isPiskel_ = function (file) {
    return (/\.piskel$/).test(file.name);
  };

  ns.FileController.prototype.onRestorePreviousSessionClick_ = function () {
    if (window.confirm('This will erase your current workspace. Continue ?')) {
      pskl.app.backupService.load();
      $.publish(Events.CLOSE_SETTINGS_DRAWER);
    }
  };


  ns.FileController.prototype.insertSavePartials_ = function () {
    this.getPartials_().forEach(function (partial) {
      this.saveForm.insertAdjacentHTML('beforeend', pskl.utils.Template.get(partial));
    }.bind(this));
  };

  ns.FileController.prototype.getPartials_ = function () {
    if (pskl.utils.Environment.detectNative()) {
      return [PARTIALS.DESKTOP];
    }

    return [PARTIALS.FILEDOWNLOAD];
  };

  ns.FileController.prototype.updateDescriptorInputs_ = function (evt) {
    var descriptor = this.piskelController.getPiskel().getDescriptor();
    this.descriptionInput.value = descriptor.description;
    this.nameInput.value = descriptor.name;
    if (descriptor.isPublic) {
      this.isPublicCheckbox.setAttribute('checked', true);
    }
  };

  ns.FileController.prototype.onSaveFormSubmit_ = function (evt) {
    evt.preventDefault();
    evt.stopPropagation();
  };

  ns.FileController.prototype.saveToFileDownload_ = function () {
    this.saveTo_('saveToFileDownload', false);
  };

  ns.FileController.prototype.saveToDesktop_ = function () {
    this.saveTo_('saveToDesktop', false);
  };

  ns.FileController.prototype.saveToDesktopAsNew_ = function () {
    this.saveTo_('saveToDesktop', true);
  };

  ns.FileController.prototype.saveTo_ = function (methodName, saveAsNew) {
    var piskel = this.piskelController.getPiskel();
    piskel.setDescriptor(this.getDescriptor_());
    pskl.app.storageService[methodName](piskel, !!saveAsNew).then(this.onSaveSuccess_);
  };

  ns.FileController.prototype.getDescriptor_ = function () {
    var name = this.nameInput.value;
    var description = this.descriptionInput.value;
    return new pskl.model.piskel.Descriptor(name, description, false);
  };

  ns.FileController.prototype.onSaveSuccess_ = function () {
    $.publish(Events.CLOSE_SETTINGS_DRAWER);
  };

  ns.FileController.prototype.disableSaveButtons_ = function () {
    this.setDisabled_(this.saveDesktopButton, true);
    this.setDisabled_(this.saveDesktopAsNewButton, true);
    this.setDisabled_(this.saveFileDownloadButton, true);
  };

  ns.FileController.prototype.enableSaveButtons_ = function () {
    this.setDisabled_(this.saveDesktopButton, false);
    this.setDisabled_(this.saveDesktopAsNewButton, false);
    this.setDisabled_(this.saveFileDownloadButton, false);
  };

  ns.FileController.prototype.setDisabled_ = function (element, isDisabled) {
    if (!element) {
      return;
    }

    if (isDisabled) {
      element.setAttribute('disabled', 'disabled');
    } else {
      element.removeAttribute('disabled');
    }
  };

  ns.FileController.prototype.safeAddEventListener_ = function (element, type, callback) {
    if (element) {
      this.addEventListener(element, type, callback);
    }
  };


  ns.FileController.prototype.destroy = function () {
    this.sizeInputWidget.destroy();
    this.tabsWidget.destroy();
    this.superclass.destroy.call(this);
  };

  ns.FileController.prototype.onScaleChange_ = function () {
    var value = parseFloat(this.scaleInput.value);
    if (!isNaN(value)) {
      if (Math.round(this.getExportZoom()) != value) {
        this.sizeInputWidget.setWidth(this.piskelController.getWidth() * value);
      }
      pskl.UserSettings.set(pskl.UserSettings.EXPORT_SCALE, value);
    }
  };

  ns.FileController.prototype.updateScaleText_ = function (scale) {
    scale = scale.toFixed(1);
    var scaleText = document.querySelector('.export-scale .scale-text');
    scaleText.innerHTML = scale + 'x';
  };

  ns.FileController.prototype.onSizeInputChange_ = function () {
    var zoom = this.getExportZoom();
    if (isNaN(zoom)) {
      return;
    }

    this.updateScaleText_(zoom);
    $.publish(Events.EXPORT_SCALE_CHANGED);

    this.scaleInput.value = Math.round(zoom);
    if (zoom >= 1 && zoom <= 32) {
      this.onScaleChange_();
    }
  };

  ns.FileController.prototype.getExportZoom = function () {
    return parseInt(this.widthInput.value, 10) / this.piskelController.getWidth();
  };
})();
