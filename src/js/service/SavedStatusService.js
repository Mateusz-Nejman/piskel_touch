(function () {
  var ns = $.namespace('pskl.service');

  ns.SavedStatusService = function (piskelController, historyService) {
    this.piskelController = piskelController;
    this.historyService = historyService;
    this.publishStatusUpdateEvent_ = this.publishStatusUpdateEvent_.bind(this);
    this.stateIndexes = [];
  };

  ns.SavedStatusService.prototype.init = function () {
    $.subscribe(Events.TOOL_RELEASED, this.publishStatusUpdateEvent_);
    $.subscribe(Events.PISKEL_RESET, this.publishStatusUpdateEvent_);
    $.subscribe(Events.PISKEL_SAVED, this.onPiskelSaved.bind(this));
    $.subscribe(Events.PISKEL_ADDED, this._piskelAdded.bind(this));
    $.subscribe(Events.PISKEL_REMOVED, this._piskelRemoved.bind(this));

    const ids = this.piskelController.getPiskelIds();

    ids.forEach(i => {
      this._piskelAdded(null, i);
    });
  };

  ns.SavedStatusService.prototype.clearStates = function () {
    this.stateIndexes = [];
  };

  ns.SavedStatusService.prototype.onPiskelSaved = function () {
    const state = this.getState();
    state.stateIndex = this.historyService.getCurrentStateId();
    this.setState(state);
    this.publishStatusUpdateEvent_();
  };

  ns.SavedStatusService.prototype.publishStatusUpdateEvent_ = function () {
    $.publish(Events.PISKEL_SAVED_STATUS_UPDATE);
  };

  ns.SavedStatusService.prototype.isDirty = function (index = null) {
    if (index == null) {
      index = this.piskelController.getSelectedPiskel();
    }
    const state = this._getState(index);
    return (state.stateIndex != this.historyService.getCurrentStateId(index));
  };

  ns.SavedStatusService.prototype.isDirtyAny = function () {
    const ids = this.piskelController.getPiskelIds();
    let dirty = false;

    ids.forEach(index => {
      if (this.isDirty(index)) {
        dirty = true;
      }
    });

    return dirty;
  };

  ns.SavedStatusService.prototype.getState = function () {
    return this._getState(this.piskelController.getSelectedPiskel());
  };

  ns.SavedStatusService.prototype.setState = function (state) {
    const arrayIndex = this.stateIndexes.findIndex(s => s.index == state.index);

    if (arrayIndex >= 0) {
      this.stateIndexes[arrayIndex] = state;
    }
  };

  ns.SavedStatusService.prototype._piskelAdded = function (e, index) {
    this.stateIndexes.push({
      stateIndex: this.historyService.getCurrentStateId(),
      index: index
    });
  };

  ns.SavedStatusService.prototype._piskelRemoved = function (e, index) {
    const arrayIndex = this.stateIndexes.findIndex(s => s.index == index);

    if (arrayIndex >= 0) {
      this.stateIndexes.splice(arrayIndex, 1);
    }
  };

  ns.SavedStatusService.prototype._getState = function (index) {
    const arrayIndex = this.stateIndexes.findIndex(s => s.index == index);

    if (arrayIndex >= 0) {
      return this.stateIndexes[arrayIndex];
    }
  };
})();
