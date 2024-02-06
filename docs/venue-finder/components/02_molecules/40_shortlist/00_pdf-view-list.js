/* eslint-disable no-underscore-dangle, no-cond-assign, no-useless-escape, no-undef, function-paren-newline, no-unused-vars, no-multi-assign, dot-notation *//**
   * @fileoverview
   * @version 1.0
   *
   * @namespace gtc.pdfExportView
   * @desc: The shortlist pdf export base listview element.
   */
(function (window, $) {
  'use strict';

  //#region global
  const ns = 'gtc.',
    name = 'gtcPdfExportView',
    CSSCLS = {
      BASE: 'gtc-pdf-doc__sec-cnt-lst'
    };
  //#endregion
  //#region Widget
  /**
   * @class: pdfExportView
   */
  $.widget(ns + name, {
    //#region props
    /**
     * @namespace gtc.pdfExportView
     * @description Widget options and state.
     */
    options: {
      data: {
        list: null,
        displayIndexStartValue: -1,
        compareItemsTo: null
      },
      typeVenues: true,
      typeHotels: false,
      childNS: {
        hotels: 'gtcPdfVenuHotel',
        venues: 'gtcPdfVenuVenue'
      },
      state: {
        initialized: false
      }
    },
    children: null,
    //#endregion
    //#region private
    /**
     * @namespace gtc.pdfExportView
     * @function
     * @private
     * @returns {object} A new instance of the List view.
     * @description Creates the list view.
     */
    _create: function () {
      const that = this,
        opts = that.options;
      opts.state.initialized = false;
      that._super();
      that._initData(that, opts);
      that._initElements(that, opts);
      opts.state.initialized = true;
      return that;
    },
    /**
     * @namespace gtc.pdfExportView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the list view data.
     */
    _initData: (that, opts) => {
      if (!opts.data.list) opts.data.list = [];
      if (!opts.data.compareItemsTo) opts.data.compareItemsTo = [];
      if (!GTC.Utils.numeric.isNumber(opts.data.displayIndexStartValue) || opts.data.displayIndexStartValue < 0) opts.data.displayIndexStartValue = 1;
    },
    /**
     * @namespace gtc.pdfExportView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the list view options.
     */
    _initOptions: (that, opts) => { },
    /**
     * @namespace gtc.pdfExportView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the list view elements.
     */
    _initElements: (that, opts) => {
      that.element.addClass(CSSCLS.BASE);
      that._renderContent(that, opts);
    },
    /**
     * @namespace gtc.pdfExportView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options.
     * @param {int} idx Reference to self.options.
     * @returns {int} Display index > 0 or -1 if the value hasn't been found in the comparison source. 
     * @description Check whether or not the item with the specified idx has already been rendered.
     */
    _getReferenceDisplayIdxFor: (that, opts, idx) => {
      const item = opts.data.list[idx];
      if (opts.data.compareItemsTo && opts.data.compareItemsTo.length) for (let i = opts.data.compareItemsTo.length - 1; i > -1; --i) {
        if (item.ItemId === opts.data.compareItemsTo[i].ItemId && opts.data.compareItemsTo[i].displayIndex) return opts.data.compareItemsTo[i].displayIndex;
      }
      return -1;
    },
    /**
     * @namespace gtc.pdfExportView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the content elements.
     */
    _renderContent: (that, opts) => {
      if (that.children && that.children().length) that._destroyChildren(that);
      that.children = [];
      if (opts.data.list && opts.data.list.length) {
        const appendElements = [];

        const gtc = window.gtc || {};
        //create and extend the config
        const config = $.extend(true, {}, gtc.shortlistPdfEpxortConfig.venueConfig, {
          data: {
            item: null,
            itemIndex: -1,
            displayIndex: -1
          },
          parent: that
        });
        let displayIndex = opts.data.displayIndexStartValue;
        for (let i = opts.data.list.length - 1, iLen = 0; i >= iLen; --i) {
          appendElements.push($('<li></li>'));
          config.data.item = opts.data.list[i];
          config.data.itemIndex = i;

          //check if this item should reference back to another value
          const referenceIdx = that._getReferenceDisplayIdxFor(that, opts, i);
          if (referenceIdx > -1) {
            opts.data.list[i]['displayIndex'] = referenceIdx;
            config.data.displayIndex = referenceIdx;
          } else {
            opts.data.list[i]['displayIndex'] = displayIndex;
            config.data.displayIndex = displayIndex;
            //increase the index if we can't map it back
            displayIndex++;
          }
          if (opts.typeHotels) that.children.push(appendElements[appendElements.length - 1].gtcPdfVenuHotel(config).data(opts.childNS.hotels));
          else that.children.push(appendElements[appendElements.length - 1].gtcPdfVenuVenue(config).data(opts.childNS.venue));
        }
        that.element.append(appendElements);
      }
    },
    /**
     * @namespace gtc.pdfExportView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @param {bool} reset: Whether or not to reset the current listing.
     * @description Renders the child data for the content area.
     */
    _renderChildData: (that, opts, reset) => {
      that.cntEls = [];
      that._hideNoResultsView(that, opts);
      if (reset) that.cntLst.html('');
      if (opts.data.list && opts.data.list.length) {
        for (let i = opts.data.page === 1 ? 0 : (opts.data.page - 1) * opts.data.pageSize, iLen = opts.data.list.length; i < iLen; ++i) {
          that.cntEls.push($('<div></div>').pdfVenuBase({
            parent: that,
            data: opts.data.list[i],
            generalBtnClass: opts.generalBtnClass,
            cols: opts.cols,
            checkIconSvgId: opts.checkIconSvgId,
            starIconSvgId: opts.starIconSvgId
          }));
        }
        that.cntLst.append(that.cntEls);
        if (opts.data.lastPage) that._togglePageBtn(that, false);
        else that._togglePageBtn(that, true);
      } else {
        that._togglePageBtn(that, false);
        that._displayNoResultsView(that, opts);
      }
    },
    /**
     * @namespace gtc.pdfExportView
     * @function
     * @private
     * @description Destroys the widget.
     */
    _destroy: function() {
      const that = this;
      that._destroyChildren(that);
      that.element.html('').removeClass(CSSCLS.BASE);
    },
    /**
     * @namespace gtc.pdfExportView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @description Destroys the widgets children.
     */
    _destroyChildren: (that) => {
      if (that.children && that.children.length) for (let i = that.children.length - 1; i > -1; --i) {
        that.children[i].destroy();
        that.children.pop();
      }
      that.children = null;
    },
    //#endregion
    //#region publics
    /**
     * @namespace gtc.pdfExportView
     * @function
     * @description Destroys the widget.
     */
    destroy: function () {
      const that = this;
      that.options.state.initialized = false;
      that._destroy();
    }
    //#endregion
  });
  //#endregion
})(window, $);