(function () {
  var ns = $.namespace('pskl.controller');

  ns.TouchButtonsController = function (historyService, drawingController) {
    this.historyService = historyService;
    this.drawingController = drawingController;

    this.tools = [
      {
        toolId: 'touch-copy',
        help: 'Copy seleciton'
      },
      {
        toolId: 'touch-cut',
        help: 'Cut seleciton'
      },
      {
        toolId: 'touch-delete',
        help: 'Delete seleciton'
      },
      {
        toolId: 'touch-paste',
        help: 'Paste seleciton'
      },
      {
        toolId: 'touch-undo',
        help: 'Undo'
      },
      {
        toolId: 'touch-zoom-in',
        help: 'Zoom In'
      },
      {
        toolId: 'touch-zoom-out',
        help: 'Zoom Out'
      },
      {
        toolId: 'touch-redo',
        help: 'Redo'
      },
    ];

    this.toolIconBuilder = new pskl.tools.ToolIconBuilder();
  };

  ns.TouchButtonsController.prototype.init = function () {
    this.container = document.querySelector('.touch-buttons-container');
    this.createToolsDom_();

    this.copyButton = document.querySelector('.icon-touch-copy');
    this.copyButton.addEventListener('click', this.copy.bind(this));

    this.cutButton = document.querySelector('.icon-touch-cut');
    this.cutButton.addEventListener('click', this.cut.bind(this));

    this.deleteButton = document.querySelector('.icon-touch-delete');
    this.deleteButton.addEventListener('click', this.delete.bind(this));

    this.pasteButton = document.querySelector('.icon-touch-paste');
    this.pasteButton.addEventListener('click', this.paste.bind(this));

    this.undoButton = document.querySelector('.icon-touch-undo');
    this.undoButton.addEventListener('click', this.undo.bind(this));

    this.redoButton = document.querySelector('.icon-touch-redo');
    this.redoButton.addEventListener('click', this.redo.bind(this));

    this.zoomInButton = document.querySelector('.icon-touch-zoom-in');
    this.zoomInButton.addEventListener('click', this.zoomIn.bind(this));

    this.zoomOutButton = document.querySelector('.icon-touch-zoom-out');
    this.zoomOutButton.addEventListener('click', this.zoomOut.bind(this));
  };

  ns.TouchButtonsController.prototype.copy = function(event) {
    $.publish(Events.CLIPBOARD_COPY, event);
  };

  ns.TouchButtonsController.prototype.cut = function(event) {
    $.publish(Events.CLIPBOARD_CUT, event);
  };

  ns.TouchButtonsController.prototype.delete = function(event) {
    $.publish(Events.CLIPBOARD_CUT, event);
  };

  ns.TouchButtonsController.prototype.paste = function(event) {
    $.publish(Events.CLIPBOARD_PASTE, event);
  };

  ns.TouchButtonsController.prototype.undo = function(event) {
    this.historyService.undo();
  };

  ns.TouchButtonsController.prototype.redo = function(event) {
    this.historyService.redo();
  };

  ns.TouchButtonsController.prototype.zoomIn = function(event) {
    this.drawingController.onMousewheel_({ wheelDeltaY: 150, clientX: 230, clientY: 50});
  };

  ns.TouchButtonsController.prototype.zoomOut = function(event) {
    this.drawingController.onMousewheel_({ wheelDeltaY: -150, clientX: 230, clientY: 50});
  };

  ns.TouchButtonsController.prototype.createToolsDom_ = function() {
    var html = this.tools.reduce(function (p, tool) {
      return p + this.createIcon(tool, 'left');
    }.bind(this), '');
    var toolsContainer = this.container.querySelector('.tools-wrapper');
    toolsContainer.innerHTML = html;
  };

  ns.TouchButtonsController.prototype.createIcon = function (tool, tooltipPosition) {
    tooltipPosition = tooltipPosition || 'right';
    var tpl = pskl.utils.Template.get('drawingTool-item-template');
    return pskl.utils.Template.replace(tpl, {
      cssclass : ['tool-icon', 'icon-' + tool.toolId].join(' '),
      toolid : tool.toolId,
      title : this.getTooltipText(tool),
      tooltipposition : tooltipPosition
    });
  };

  ns.TouchButtonsController.prototype.getTooltipText = function(tool) {
    var descriptors = tool.tooltipDescriptors;
    return pskl.utils.TooltipFormatter.format(tool.help, tool.shortcut, descriptors);
  };
})();
