/**
 * @provide pskl.tools.drawing.NoiseFillTool
 *
 * @require pskl.utils
 */
(function() {
  var ns = $.namespace('pskl.tools.drawing');
  ns.NoiseFillTool = function() {
    this.toolId = 'tool-noise-fill';
    this.helpText = 'Pixelart Noise fill tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.NOISE_FILL_TOOL;
  };
  pskl.utils.inherit(ns.NoiseFillTool, ns.BaseTool);
  /**
     * @override
     */
  ns.NoiseFillTool.prototype.applyToolAt = function(col, row, frame, overlay, event) {
    pskl.PixelUtils.paintNoiseSimilarConnectedPixelsFromFrame(frame, col, row);
    this.raiseSaveStateEvent({
      col : col,
      row : row,
      color : this.getNoiseColor()
    });
  };
  ns.NoiseFillTool.prototype.replay = function (frame, replayData) {
    pskl.PixelUtils.paintNoiseSimilarConnectedPixelsFromFrame(frame, replayData.col, replayData.row);
  };
})();
