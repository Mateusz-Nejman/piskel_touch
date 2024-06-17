(function () {
  var ns = $.namespace('pskl.utils');

  var stopPropagation = function (e) {
    e.stopPropagation();
  };

  ns.FileUtils = {
    readFile : function (file, callback) {
      var reader = new FileReader();
      reader.addEventListener('loadend', function() {
        callback(reader.result);
      });
      reader.readAsDataURL(file);
    },

    readFileAsArrayBuffer : function (file, callback) {
      var reader = new FileReader();
      reader.addEventListener('loadend', function() {
        callback(reader.result);
      });
      reader.readAsArrayBuffer(file);
    },

    readImageFile : function (file, callback) {
      ns.FileUtils.readFile(file, function (content) {
        var image = new Image();
        image.onload = callback.bind(null, image);
        image.src = content;
      });
    },

    downloadAsFile : function (content, filename) {
      var saveAs = window.saveAs || (navigator.msSaveBlob && navigator.msSaveBlob.bind(navigator));
      if (saveAs) {
        saveAs(content, filename);
      } else {
        if (pskl.utils.Environment.detectNative()) {
          const extension = filename.split('.').pop();

          if (extension != 'zip' && extension != 'png') {
            return;
          }

          const filters = {
            zip: [{name: 'Zip file', extensions: ['zip']}],
            png: [{name: 'PNG image', extensions: ['png']}]
          };
          // eslint-disable-next-line no-undef
          Neutralino.os.showSaveDialog('Save to file', {
            defaultPath: filename,
            filters: filters[extension]
          }).then(path => {
            content.arrayBuffer().then(data => {
              ns.FileUtilsDesktop.saveToFileBinary(data, path);
            });
          });
        } else {
          var downloadLink = document.createElement('a');
          content = window.URL.createObjectURL(content);
          downloadLink.setAttribute('href', content);
          downloadLink.setAttribute('download', filename);
          document.body.appendChild(downloadLink);
          downloadLink.addEventListener('click', stopPropagation);
          downloadLink.click();
          downloadLink.removeEventListener('click', stopPropagation);
          document.body.removeChild(downloadLink);
        }
      }
    }

  };
})();
