/**
 * @provide pskl.tools.drawing.DitheringToolNew
 *
 * @require pskl.utils
 */
(function() {
    var ns = $.namespace('pskl.tools.drawing');
  
    ns.DitheringToolNew = function() {
      ns.SimplePen.call(this);
      this.toolId = 'tool-dithering-new';
      this.helpText = 'Color Dithering tool';
      this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.DITHERING_NEW;
    };
  
    pskl.utils.inherit(ns.DitheringToolNew, ns.SimplePen);
  
    ns.DitheringToolNew.prototype.supportsDynamicPenSize = function() {
      return true;
    };
  
    /**
     * @override
     */
    ns.DitheringToolNew.prototype.applyToolAt = function(col, row, frame, overlay, event) {
      this.previousCol = col;
      this.previousRow = row;
  
      var penSize = pskl.app.penSizeService.getPenSize();
      var points = pskl.PixelUtils.resizePixel(col, row, penSize);
      points.forEach(function (point) {
        this.applyToolOnPixel(point[0], point[1], frame, overlay, event);
      }.bind(this));
    };
  
    ns.DitheringToolNew.prototype.applyToolOnPixel = function(col, row, frame, overlay, event) {
      var ditheringColor = window.tinycolor(pskl.app.selectedColorsService.getPrimaryColor());
      ditheringColor.setAlpha(Math.random());
      console.log(pskl.app.selectedColorsService.getPrimaryColor());
      console.log(ditheringColor);

      this.draw(ditheringColor.toRgbString(), col, row, frame, overlay);
    };
  
  })();
  