(function () {
  var ns = $.namespace('pskl.utils');

  ns.FileUtilsDesktop = {
    chooseFilenameDialogOpen : function() {
      // eslint-disable-next-line no-undef
      return Neutralino.os.showOpenDialog('Open file', {
        filters: [
          {name: 'All supported', extensions: ['piskel', 'jpg', 'png', 'bmp']},
          {name: 'Images', extensions: ['jpg', 'png', 'bmp']},
          {name: 'Piskel files', extensions: ['piskel']},
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
      return Neutralino.filesystem.writeFile(filename, content);
    },
    saveToFileBinary : function(content, filename) {
      // eslint-disable-next-line no-undef
      return Neutralino.filesystem.writeBinaryFile(filename, content);
    },

    readFile : function(filename) {
      // eslint-disable-next-line no-undef
      return Neutralino.filesystem.readFile(filename);
    },

    readFileBinary: function(filename) {
      console.log(filename);
      return Neutralino.filesystem.readBinaryFile(filename);
    },

    addPiskelFromFile : function(filename) {
      const deferred = Q.defer();
      pskl.utils.FileUtilsDesktop.readFile(filename).then(function (content) {
        pskl.utils.PiskelFileUtils.decodePiskelFile(content, function (piskel) {
          piskel.savePath = filename;
          const index = pskl.app.piskelController.addPiskel(piskel);
          pskl.app.tabsController.add(index);
          deferred.resolve(index);
        });
      });

      return deferred.promise;
    },

    addPiskels : function(filenames, callback) {
      const promises = filenames.map(filename => pskl.utils.FileUtilsDesktop.addPiskelFromFile(filename));
      const ids = pskl.app.piskelController.getPiskelIds();
      Q.all(promises).fin(function explode() {
        pskl.app.piskelController.selectPiskel(ids[ids.length - 1]);
        callback();
      });
    },
  };
})();
