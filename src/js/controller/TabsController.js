(function () {
  var ns = $.namespace('pskl.controller');

  ns.TabsController = function (historyService) {
    this.historyService = historyService;
    this.tabs = [];
    this.tabControllers = [];
    this.selectedTab = null;
    this.tabsContainer = document.querySelector('#tabsContainer');
    this.addCurrent();
  };

  ns.TabsController.prototype.addCurrent = function() {
    this.add(pskl.app.piskelController, this.historyService.get());
  };

  ns.TabsController.prototype.addEmpty = function() {
    //TODO
  };

  ns.TabsController.prototype.add = function(piskel, history) {
    const index = this._uuidv4();
    this.tabs.push({
      piskel: piskel,
      history: history,
      index: index
    });

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
    this.tabsContainer.append(newTab);
    this.tabControllers.push({
      controller: new pskl.controller.preview.TabPreviewController(this, piskel, previewContainer, index),
      index: index
    });

    this.setCurrent(index);
  };

  ns.TabsController.prototype.setCurrent = function(index) {
    this.selectedTab = index;
    const tab = this.tabs.find(t => t.index == index);
    pskl.app.piskelController.setPiskel(tab.piskel, { noSnapshot: true});
    this.historyService.set(tab.history);
  };

  ns.TabsController.prototype.render = function (delta) {
    this.tabControllers.forEach(element => {
      element.controller.render(delta);
    });
  };

  ns.TabsController.prototype.isSelected = function (index) {
    return index == this.index;
  };

  ns.TabsController.prototype._uuidv4 = function() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  };
})();
