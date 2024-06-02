(function () {
  var ns = $.namespace('pskl.service');

  ns.HistoryService = function (piskelController, shortcutService, deserializer, serializer) {
    // Use the real piskel controller that will not fire events when calling setters
    this.piskelController = piskelController.getWrappedPiskelController();

    this.shortcutService = shortcutService || pskl.app.shortcutService;
    this.deserializer = deserializer || pskl.utils.serialization.arraybuffer.ArrayBufferDeserializer;
    this.serializer = serializer || pskl.utils.serialization.arraybuffer.ArrayBufferSerializer;
    this.states = [];
  };

  // Force to save a state as a SNAPSHOT
  ns.HistoryService.SNAPSHOT = 'SNAPSHOT';

  // Default save state
  ns.HistoryService.REPLAY = 'REPLAY';

  // Period (in number of state saved) between two snapshots
  ns.HistoryService.SNAPSHOT_PERIOD = 50;

  // Interval/buffer (in milliseconds) between two state load (ctrl+z/y spamming)
  ns.HistoryService.LOAD_STATE_INTERVAL = 50;

  // Maximum number of states that can be recorded.
  ns.HistoryService.MAX_SAVED_STATES = 500;

  ns.HistoryService.prototype.init = function () {
    $.subscribe(Events.PISKEL_SAVE_STATE, this.onSaveStateEvent.bind(this));
    $.subscribe(Events.PISKEL_ADDED, this._piskelAdded.bind(this));

    const ids = this.piskelController.getPiskelIds();

    ids.forEach(index => {
      this.addPiskel(index);
    });

    var shortcuts = pskl.service.keyboard.Shortcuts;
    this.shortcutService.registerShortcut(shortcuts.MISC.UNDO, this.undo.bind(this));
    this.shortcutService.registerShortcut(shortcuts.MISC.REDO, this.redo.bind(this));

    this.saveState({
      type : ns.HistoryService.SNAPSHOT
    });
  };

  ns.HistoryService.prototype.onSaveStateEvent = function (evt, action) {
    this.saveState(action);
  };

  ns.HistoryService.prototype.saveState = function (action) {
    const historyState = this.getState();
    historyState.stateQueue = historyState.stateQueue.slice(0, historyState.currentIndex + 1);
    historyState.currentIndex = historyState.currentIndex + 1;

    var state = {
      action : action,
      frameIndex : action.state ? action.state.frameIndex : this.piskelController.currentFrameIndex,
      layerIndex : action.state ? action.state.layerIndex : this.piskelController.currentLayerIndex,
      fps : this.piskelController.getFPS(),
      uuid: pskl.utils.Uuid.generate()
    };

    var isSnapshot = action.type === ns.HistoryService.SNAPSHOT;
    var isAtAutoSnapshotInterval = historyState.currentIndex % ns.HistoryService.SNAPSHOT_PERIOD === 0;
    if (isSnapshot || isAtAutoSnapshotInterval) {
      var piskel = this.piskelController.getPiskel();
      state.piskel = this.serializer.serialize(piskel);
    }

    // If the new state pushes over MAX_SAVED_STATES, erase all states between the first and
    // second snapshot states.
    if (historyState.stateQueue.length > ns.HistoryService.MAX_SAVED_STATES) {
      var firstSnapshotIndex = this.getNextSnapshotIndex_(1);
      historyState.stateQueue.splice(0, firstSnapshotIndex);
      historyState.currentIndex = historyState.currentIndex - firstSnapshotIndex;
    }
    historyState.stateQueue.push(state);
    this.setState(historyState);
    $.publish(Events.HISTORY_STATE_SAVED);
  };

  ns.HistoryService.prototype.getCurrentStateId = function (index = null) {
    if (index == null) {
      index = this.piskelController.getSelectedPiskel();
    }
    const historyState = this._getState(index);
    var state = historyState.stateQueue[historyState.currentIndex];
    if (!state) {
      return false;
    }

    return state.uuid;
  };

  ns.HistoryService.prototype.undo = function () {
    const historyState = this.getState();
    this.loadState(historyState.currentIndex - 1);
  };

  ns.HistoryService.prototype.redo = function () {
    const historyState = this.getState();
    this.loadState(historyState.currentIndex + 1);
  };

  ns.HistoryService.prototype.isLoadStateAllowed_ = function (index) {
    const historyState = this.getState();
    var timeOk = (Date.now() - historyState.lastLoadState) > ns.HistoryService.LOAD_STATE_INTERVAL;
    var indexInRange = index >= 0 && index < historyState.stateQueue.length;
    return timeOk && indexInRange;
  };

  ns.HistoryService.prototype.getPreviousSnapshotIndex_ = function (index) {
    const historyState = this.getState();
    while (historyState.stateQueue[index] && !historyState.stateQueue[index].piskel) {
      index = index - 1;
    }
    return index;
  };

  ns.HistoryService.prototype.getNextSnapshotIndex_ = function (index) {
    const historyState = this.getState();
    while (historyState.stateQueue[index] && !historyState.stateQueue[index].piskel) {
      index = index + 1;
    }
    return index;
  };

  ns.HistoryService.prototype.loadState = function (index) {
    const historyState = this.getState();
    try {
      if (this.isLoadStateAllowed_(index)) {
        historyState.lastLoadState = Date.now();

        var snapshotIndex = this.getPreviousSnapshotIndex_(index);
        if (snapshotIndex < 0) {
          throw 'Could not find previous SNAPSHOT saved in history stateQueue';
        }
        var serializedPiskel = this.getSnapshotFromState_(snapshotIndex);
        var onPiskelLoadedCb = this.onPiskelLoaded_.bind(this, index, snapshotIndex);
        this.deserializer.deserialize(serializedPiskel, onPiskelLoadedCb);
      }
    } catch (error) {
      console.error('[CRITICAL ERROR] : Unable to load a history state.');
      this.logError_(error);
      historyState.stateQueue = [];
      historyState.currentIndex = -1;
      this.setState(historyState);
    }

    $.publish(Events.FORCE_REFRESH, null);
  };

  ns.HistoryService.prototype.logError_ = function (error) {
    if (typeof error === 'string') {
      console.error(error);
    } else {
      console.error(error.message);
      console.error(error.stack);
    }
  };

  ns.HistoryService.prototype.getSnapshotFromState_ = function (stateIndex) {
    const historyState = this.getState();
    var state = historyState.stateQueue[stateIndex];
    var piskelSnapshot = state.piskel;

    state.piskel = piskelSnapshot;

    return piskelSnapshot;
  };

  ns.HistoryService.prototype.onPiskelLoaded_ = function (index, snapshotIndex, piskel) {
    const historyState = this.getState();
    const origPiskel = this.piskelController.getPiskel();
    var originalSize = this.getPiskelSize_();
    piskel.setDescriptor(origPiskel.getDescriptor());
    // propagate save path to the new piskel instance
    piskel.savePath = origPiskel.savePath;
    this.piskelController.setPiskel(piskel);

    for (var i = snapshotIndex + 1 ; i <= index ; i++) {
      var state = historyState.stateQueue[i];
      this.setupState(state);
      this.replayState(state);
    }

    // Should only do this when going backwards
    var lastState = historyState.stateQueue[index + 1];
    if (lastState) {
      this.setupState(lastState);
    }

    historyState.currentIndex = index;
    this.setState(historyState);
    $.publish(Events.PISKEL_RESET);
    $.publish(Events.HISTORY_STATE_LOADED);
    if (originalSize !== this.getPiskelSize_()) {
      $.publish(Events.FRAME_SIZE_CHANGED);
    }
  };

  ns.HistoryService.prototype.getPiskelSize_ = function () {
    return this.piskelController.getWidth() + 'x' + this.piskelController.getHeight();
  };

  ns.HistoryService.prototype.setupState = function (state) {
    this.piskelController.setCurrentFrameIndex(state.frameIndex);
    this.piskelController.setCurrentLayerIndex(state.layerIndex);
    this.piskelController.setFPS(state.fps);
  };

  ns.HistoryService.prototype.replayState = function (state) {
    var action = state.action;
    var type = action.type;
    var layer = this.piskelController.getLayerAt(state.layerIndex);
    var frame = layer.getFrameAt(state.frameIndex);
    action.scope.replay(frame, action.replay);
  };

  ns.HistoryService.prototype.getState = function () {
    return this._getState(this.piskelController.getSelectedPiskel());
  };

  ns.HistoryService.prototype.setState = function (state) {
    const arrayIndex = this.states.findIndex(s => s.index == state.index);

    if (arrayIndex >= 0) {
      this.states[arrayIndex] = state;
    }
  };

  ns.HistoryService.prototype.addPiskel = function (index) {
    this.states.push({
      stateQueue: [],
      currentIndex: -1,
      lastLoadState: -1,
      index: index
    });
  };

  ns.HistoryService.prototype._piskelAdded = function (e, index) {
    this.addPiskel(index);
  };

  ns.HistoryService.prototype._piskelRemoved = function (index) {
    const arrayIndex = this.states.findIndex(s => s.index == index);

    if (arrayIndex >= 0) {
      return this.states.remove(this.states[arrayIndex]);
    }
  };

  ns.HistoryService.prototype._getState = function (index) {
    const arrayIndex = this.states.findIndex(s => s.index == index);

    if (arrayIndex >= 0) {
      return this.states[arrayIndex];
    }
  };

})();
