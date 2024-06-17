(function () {
  var ns = $.namespace('pskl.utils');

  var getFileInputElement = function (nwsaveas, accept) {
    var fileInputElement = document.createElement('INPUT');
    fileInputElement.setAttribute('type', 'file');
    fileInputElement.setAttribute('nwworkingdir', '');
    if (nwsaveas) {
      fileInputElement.setAttribute('nwsaveas', nwsaveas);
    }
    if (accept) {
      fileInputElement.setAttribute('accept', accept);
    }

    return fileInputElement;
  };

  ns.FileUtilsDesktop = {
    chooseFilenameDialogOpen : function() {
      // eslint-disable-next-line no-undef
      return Neutralino.os.showOpenDialog('Open file', {
        filters: [
          {name: 'Images', extensions: ['jpg', 'png', 'bmp']},
          {name: 'Piskel files', extensions: ['piskel']}
        ]
      });
    },
    chooseFilenameDialogSave : function(name) {
      // eslint-disable-next-line no-undef
      return Neutralino.os.showSaveDialog('Save to file', {
        defaultPath: name,
        filters: [
          {name: 'Piskel files', extensions: ['piskel']}
        ]
      });
    },

    /**
     * Save data directly to disk, without showing a save dialog
     * Requires Node-Webkit environment for file system access
     * @param content - data to be saved
     * @param {string} filename - fill path to the file
     * @callback callback
     */
    saveToFile : function(content, filename) {
      var deferred = Q.defer();
      var fs = window.require('fs');
      fs.writeFile(filename, content, function (err) {
        if (err) {
          deferred.reject('FileUtilsDesktop::savetoFile() - error saving file: ' + filename + ' Error: ' + err);
        } else {
          deferred.resolve();
        }
      });

      return deferred.promise;
    },
    saveToFileBinary : function(content, filename) {
      // eslint-disable-next-line no-undef
      return Neutralino.filesystem.writeBinaryFile(filename, content);
    },

    readFile : function(filename) {
      var deferred = Q.defer();
      var fs = window.require('fs');
      // NOTE: currently loading everything as utf8, which may not be desirable in future
      fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
          deferred.reject('FileUtilsDesktop::readFile() - error reading file: ' + filename + ' Error: ' + err);
        } else {
          deferred.resolve(data);
        }
      });
      return deferred.promise;
    }
  };
})();
