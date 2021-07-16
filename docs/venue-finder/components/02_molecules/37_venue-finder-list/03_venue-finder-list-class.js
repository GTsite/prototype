/* eslint-disable no-undef, prefer-const */

const VenueFilterSub = require('../36_venue-finder_utils/01_filter-class-1').default;

App.prototype.VenueFinderList = (function () {
  'use strict';

  //#region Props
  /**
   * Stores a local refrence to the singleton instance being created.
   */
  // ReSharper disable once JoinDeclarationAndInitializerJs
  let list;
  //#endregion
  //#region Publics
  /**
   * @class VenueFinderList
   * @classdesc: Provides the List View handling for the Venue Finder.
   * @extends App
   */
  class VenueFinderList extends App {
    constructor() {
      super();
      const that = this;
      //#region Base Values
      that.CSS_NSP = that.Utils.CssNsp;
      that.JS_NSP = that.Utils.JsNsp;
      //#endregion
      //#region Selectors
      that.LISTSELECTOR = '.js-gtc-venue-finder-glst';
      //#endregion
      that.list = null;
      that.listWidget = null;
      that.subscriptionId = null;
      that.subscriptionIdRqStarted = null;
      that.subscriptionIdRqCanceled = null;
      that.subscriptionIdRqEnded = null;
      //launch prop
      that.launch = that.run();
    }
    /**
     * Should be called the measuring unit of the filter has changed. Toggles the unit view class.
     * @param {int<VenueFinderListUnit.types()>} newValue: Type of the new unit.
     */
    toggleUnitClass(newValue) {
      const that = this;
      if (that.listWidget) that.listWidget.toggleUnit(newValue);
    }
    /**
     * Attempts to toggle the room list for the selected venues in the shortlist roomlist view.
     * @param {bool} active Whether to activate or deactive the list.
     */
    toggleShortlistRoomList(active) {
      const that = this;
      if (!that.Shortlist.isInit() || !that.isInitialized()) return;
      if (active) that.listWidget.renderRoomList();
      else that.listWidget.removeRoomList();
    }
    /**
     * @returns {bool}: Whether the element is hidden or uninitilized.
     */
    isHidden() { return !this.listWidget || this.listWidget.isHidden(); }
    /**
     * Displays the element, only applyable if initilized.
     */
    show() {
      if (this.listWidget) this.listWidget.show();
    }
    /**
     * Hides the element, only applyable if initilized.
     */
    hide() {
      if (this.listWidget) this.listWidget.hide();
    }
    /**
     * Checks whether or not the list widget has finished the initilization process.
     * @returns {bool} Wether or not the list widget finished initilization.
     */
    isInitialized() { return this && this.listWidget && this.listWidget.options.state.initialized; }
    //#region Initialization
    /**
     * Initializes the filters base functionality.
     */
    init() {
      const that = this;
      that.Utils.Debug(false, 'VenueFinderList: init');
      const gtc = window.gtc || {};
      //create and extend the config
      let config = $.extend(true, {}, gtc.venueListViewConfig, {
        sortAdapter: that.VenueFilters.sort,
        pageAdapter: that.VenueFilters.page
      });
      //initialize the widget with the current data and subscribe to the venue filter.
      that.listWidget = that.list.gtcVfLstView(config).data('gtcGtcVfLstView');
      if (!that.listWidget) throw Error('Widget not being initialized properly!');
      //subscribe to the data
      that.subscriptionId = that.VenueFilters.subscribe(VenueFilterSub.types().VENUES, that.listWidget.updateData, that.listWidget);
      //subscribe to the events
      that.subscriptionIdRqStarted = that.VenueFilters.subscribe(VenueFilterSub.types().REQSTARTED, function () { that.listWidget.showLoading(); }, that.listWidget);
      that.subscriptionIdRqCanceled = that.VenueFilters.subscribe(VenueFilterSub.types().REQCANCELED, function () { that.listWidget.hideLoading(); }, that.listWidget);
      that.subscriptionIdRqEnded = that.VenueFilters.subscribe(VenueFilterSub.types().REQENDED, function () { that.listWidget.hideLoading(); }, that.listWidget);
    }
    run() {
      const that = this;
      const gtc = window.gtc || {};
      that.Utils.Debug(false, 'VenueFinderList: run');
      //initialize only if we are in need of it
      that.list = $(that.LISTSELECTOR);
      if (that.list.length && gtc.venueListViewConfig) {
        //wait until we are ready
        $(window).on(`${that.Utils.NS}::VenueFinderList::ready`, () => {
          that.init();
        });
      }
    }
  }
  //#endregion
  //#endregion
  //#region init
  list = new VenueFinderList();
  return list;
  //#endregion
}());