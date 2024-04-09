/**
 * @provide pskl.tools.drawing.NoiseTool
 *
 * @require pskl.utils
 */
(function () {
  var ns = $.namespace('pskl.tools.drawing');

  ns.NoiseTool = function () {
    ns.SimplePen.call(this);
    this.toolId = 'tool-noise';
    this.helpText = 'Pixelart Noise tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.NOISE_TOOL;
  };

  pskl.utils.inherit(ns.NoiseTool, ns.SimplePen);

  ns.NoiseTool.prototype.supportsDynamicPenSize = function () {
    return true;
  };

  /**
   * @override
   */
  ns.NoiseTool.prototype.applyToolAt = function (col, row, frame, overlay, event) {
    this.previousCol = col;
    this.previousRow = row;

    var penSize = pskl.app.penSizeService.getPenSize();
    var points = pskl.PixelUtils.resizePixel(col, row, penSize);
    points.forEach(function (point) {
      this.applyToolOnPixel(point[0], point[1], frame, overlay, event);
    }.bind(this));
  };

  ns.NoiseTool.prototype.applyToolOnPixel = function (col, row, frame, overlay, event) {
    var noiseColor = pskl.PixelUtils.getNoiseColor();
    this.draw(noiseColor, col, row, frame, overlay);
  };
})();
