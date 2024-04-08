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
    this.helpText = 'Random Dithering tool';
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
    var usePrimaryColor = Math.random() < 0.5;

    if (pskl.app.mouseStateService.isRightButtonPressed()) {
      usePrimaryColor = !usePrimaryColor;
    }

    var ditheringColor = usePrimaryColor ?
      pskl.app.selectedColorsService.getPrimaryColor() :
      pskl.app.selectedColorsService.getSecondaryColor();

    this.draw(ditheringColor, col, row, frame, overlay);
  };

})();
