(function () {
  var ns = $.namespace('pskl.controller.preview');

  // Preview is a square of PREVIEW_SIZE x PREVIEW_SIZE
  var PREVIEW_SIZE = 52;
  var RENDER_MINIMUM_DELAY = 300;

  ns.TabPreviewController = function (tabsController, container, index) {
    this.piskelController = tabsController.piskelController;
    this.container = container;
    this.tabsController = tabsController;
    this.index = index;

    this.elapsedTime = 0;
    this.currentIndex = 0;
    this.lastRenderTime = 0;
    this.renderFlag = true;

    this.renderer = new pskl.rendering.frame.BackgroundImageFrameRenderer(this.container);
    this.previewActionsController = new ns.PreviewActionsController(this, container);

    this.init();
  };

  ns.TabPreviewController.prototype.init = function () {
    var width = Constants.ANIMATED_PREVIEW_WIDTH + Constants.RIGHT_COLUMN_PADDING_LEFT;
    document.querySelector('.right-column').style.width = width + 'px';

    $.subscribe(Events.FRAME_SIZE_CHANGED, this.onFrameSizeChange_.bind(this));
    $.subscribe(Events.USER_SETTINGS_CHANGED, this.onUserSettingsChange_.bind(this));
    $.subscribe(Events.PISKEL_SAVE_STATE, this.setRenderFlag_.bind(this, true));
    $.subscribe(Events.PISKEL_RESET, this.setRenderFlag_.bind(this, true));
    this.previewActionsController.init();

    this.updateZoom_();
    this.updateContainerDimensions_();
  };

  ns.TabPreviewController.prototype.onUserSettingsChange_ = function (evt, name, value) {
    if (!this.tabsController.isSelected(this.index)) {
      return;
    }
    if (name === pskl.UserSettings.SEAMLESS_MODE) {
      this.onFrameSizeChange_();
    } else {
      this.updateZoom_();
      this.updateContainerDimensions_();
    }
  };

  ns.TabPreviewController.prototype.updateZoom_ = function () {
    const zoom = this.calculateZoom_();
    this.renderer.setZoom(zoom);
    this.setRenderFlag_(true);
  };

  ns.TabPreviewController.prototype.getZoom = function () {
    return this.calculateZoom_();
  };

  ns.TabPreviewController.prototype.getCoordinates = function(x, y) {
    var containerRect = this.container.getBoundingClientRect();
    x = x - containerRect.left;
    y = y - containerRect.top;
    var zoom = this.getZoom();
    return {
      x : Math.floor(x / zoom),
      y : Math.floor(y / zoom)
    };
  };

  ns.TabPreviewController.prototype.render = function (delta) {
    this.elapsedTime += delta;
    var index = this.getNextIndex_(delta);
    if (this.shouldRender_() || this.currentIndex != index) {
      this.currentIndex = index;
      var frame = pskl.utils.LayerUtils.mergeFrameAt(this.piskelController.getLayers(), index);
      this.renderer.render(frame);
      this.renderFlag = false;
      this.lastRenderTime = Date.now();
    }
  };

  ns.TabPreviewController.prototype.getNextIndex_ = function (delta) {
    var fps = this.piskelController.getFPS();
    if (fps === 0) {
      return this.piskelController.getCurrentFrameIndex();
    } else {
      var index = Math.floor(this.elapsedTime / (1000 / fps));
      var frameIndexes = this.piskelController.getVisibleFrameIndexes();
      if (frameIndexes.length <= index) {
        this.elapsedTime = 0;
        index = (frameIndexes.length) ? frameIndexes[0] : this.piskelController.getCurrentFrameIndex();
        return index;
      }
      return frameIndexes[index];
    }
  };

  /**
     * Calculate the preview zoom depending on the framesheet size
     */
  ns.TabPreviewController.prototype.calculateZoom_ = function () {
    var frame = this.piskelController.getCurrentFrame();
    var hZoom = PREVIEW_SIZE / frame.getHeight();
    var wZoom = PREVIEW_SIZE / frame.getWidth();

    return Math.min(hZoom, wZoom);
  };

  ns.TabPreviewController.prototype.onFrameSizeChange_ = function () {
    if (!this.tabsController.isSelected(this.index)) {
      return;
    }
    this.updateZoom_();
    this.updateContainerDimensions_();
  };

  ns.TabPreviewController.prototype.updateContainerDimensions_ = function () {
    var isSeamless = pskl.UserSettings.get(pskl.UserSettings.SEAMLESS_MODE);
    this.renderer.setRepeated(isSeamless);

    var width;
    var height;

    if (isSeamless) {
      height = PREVIEW_SIZE;
      width = PREVIEW_SIZE;
    } else {
      var zoom = this.getZoom();
      var frame = this.piskelController.getCurrentFrame();
      height = frame.getHeight() * zoom;
      width = frame.getWidth() * zoom;
    }

    var containerEl = this.container;
    containerEl.style.height = height + 'px';
    containerEl.style.width = width + 'px';

    var horizontalMargin = (PREVIEW_SIZE - height) / 2;
    containerEl.style.marginTop = horizontalMargin + 'px';
    containerEl.style.marginBottom = horizontalMargin + 'px';

    var verticalMargin = (PREVIEW_SIZE - width) / 2;
    containerEl.style.marginLeft = verticalMargin + 'px';
    containerEl.style.marginRight = verticalMargin + 'px';
  };

  ns.TabPreviewController.prototype.setRenderFlag_ = function (bool) {
    if (!this.tabsController.isSelected(this.index)) {
      return;
    }
    this.renderFlag = bool;
  };

  ns.TabPreviewController.prototype.shouldRender_ = function () {
    return this.renderFlag &&
              (Date.now() - this.lastRenderTime > RENDER_MINIMUM_DELAY);
  };
})();
