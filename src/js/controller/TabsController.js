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
    document.querySelector('.addTabButton').addEventListener('click', this._newPiskel.bind(this));
    $.subscribe(Events.PISKEL_ADDED, this._refreshButtons.bind(this));
    $.subscribe(Events.PISKEL_REMOVED, this._piskelRemoved.bind(this));
  };

  ns.TabsController.prototype.addCurrent = function() {
    const ids = this.piskelController.getPiskelIds();
    ids.forEach(this.add.bind(this));
    this._refreshButtons();
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
    previewContainer.addEventListener('click', this._onTabSelect.bind(this, index));
    const closeButton = document.createElement('button');
    closeButton.classList.add('closeButton');
    closeButton.setAttribute('type', 'button');
    closeButton.textContent = 'x';
    closeButton.addEventListener('click', this._onTabClose.bind(this, index));
    newTab.append(closeButton);
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

  ns.TabsController.prototype._onTabSelect = function (index, event) {
    this.setCurrent(index);
    $.publish(Events.PISKEL_CHANGED, index);
  };

  ns.TabsController.prototype._onTabClose = function (index) {
    if (this.piskelController.closePiskel(index)) {
      document.querySelector('.tab' + index).remove();
      this._refreshButtons();
    }
  };

  ns.TabsController.prototype._newPiskel = function () {
    const id = this.piskelController.newPiskel();
    this.add(id);
    this._onTabSelect(id);
  };

  ns.TabsController.prototype._refreshButtons = function () {
    document.querySelector('.closeButton').setAttribute('style', 'display: none');
    const ids = this.piskelController.getPiskelIds();

    if (ids.length > 1) {
      document.querySelector('.closeButton').setAttribute('style', 'display: block');
    }
  };

  ns.TabsController.prototype._piskelRemoved = function(e, index) {
    const arrayIndex = this.tabControllers.findIndex(s => s.index == index);

    if (arrayIndex >= 0) {
      this.tabControllers.splice(arrayIndex, 1);
      document.querySelector('.tab' + index).remove();
      this._refreshButtons();
    }
  };
})();
