(function () {
  var ns = $.namespace('pskl.controller');

  ns.TabsController = function (piskelController, historyService) {
    this.historyService = historyService;
    this.piskelController = piskelController;
    this.tabControllers = [];
    this.selectedTab = null;
    this.tabsContainer = document.querySelector('#tabsContainer');
    this.addCurrent();
    this.setCurrent(this.piskelController.getSelectedPiskel());
  };

  ns.TabsController.prototype.addCurrent = function() {
    const ids = this.piskelController.getPiskelIds();
    ids.forEach(this.add.bind(this));
  };

  ns.TabsController.prototype.addEmpty = function() {
    //TODO
  };

  ns.TabsController.prototype.add = function(index) {
    const newTab = document.createElement('div');
    newTab.classList.add('tab');
    newTab.classList.add('tab' + index);
    const previewContainer = document.createElement('div');
    previewContainer.classList.add('tabPreview');
    previewContainer.classList.add('tabPreview' + index);
    const canvasBackground = document.createElement('div');
    canvasBackground.classList.add('canvas-background');
    previewContainer.append(canvasBackground);
    newTab.append(previewContainer);
    newTab.addEventListener('click', this._onTabSelect.bind(this, index));
    this.tabsContainer.append(newTab);
    this.tabControllers.push({
      controller: new pskl.controller.preview.TabPreviewController(this,
        previewContainer, index),
      index: index
    });
  };

  ns.TabsController.prototype.setCurrent = function(index) {
    this.piskelController.selectPiskel(index);
    const ids = this.piskelController.getPiskelIds();

    ids.forEach(i => {
      if (index == i) {
        document.querySelector('.tab' + i).classList.add('active');
      } else {
        document.querySelector('.tab' + i).classList.remove('active');
      }
    });
  };

  ns.TabsController.prototype.render = function (delta) {
    this.tabControllers.forEach(element => {
      element.controller.render(delta);
    });
  };

  ns.TabsController.prototype.isSelected = function (index) {
    return this.piskelController.getSelectedPiskel() == index;
  };

  ns.TabsController.prototype._onTabSelect = function (index) {
    this.setCurrent(index);
  };
})();
