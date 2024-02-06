/* eslint-disable no-underscore-dangle, no-cond-assign, no-useless-escape, no-undef, function-paren-newline, no-unused-vars, no-multi-assign *//**
   * @fileoverview
   * @version 1.0
   *
   * @namespace gtc.gtcVfLstView
   * @desc: The venue finder list view parent widget.
   */

const VenueFinderListCol = require('../36_venue-finder_utils/00_venue-finder-list-class-3').default;

(function (window, $) {
  'use strict';

  //#region Classes
  /**
   * @class DeferredIcon
   * @classdesc Storage class for deferred icons.
   */
  class DeferredIcon {
    /**
     * Creates a new instance of the DeferrredIon class.
     * @param {string} type: Type id of the element.
     */
    constructor(type) {
      const that = this;
      that.id = '#' + type;
      that.loaded = false;
      that.html = null;
    }
    /**
     * Attempts to load the item via and and set the html.
     */
    loadItem() {
      const that = this, item = $(that.id);
      let html = item.html();
      //support ie's inabillity to innerHtml SVGs
      if (item.length && html === undefined) {
        html = new XMLSerializer().serializeToString(item[0]);
        html = html.substring(html.indexOf('<title>') - 4, html.indexOf('</symbol>'));
      }
      if (html && html.length) {
        that.html = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${item.attr('viewBox')}">${html}</svg>`;
        that.loaded = true;
      }
    }
  }
  //#endregion

  //#region global
  const ns = 'gtc.',
    name = 'gtcVfLstView',
    CSSCLS = {
      DEFERREDLOADING: 'gtc-venue-finder-glst__dfl',
      HIDDEN: 'gtc-venue-finder-glst-hidden',
      BASE: 'gtc-venue-finder-glst',
      BASESQUAREFEET: 'gtc-venue-finder-glst--sq',
      WRAP: 'gtc-wrap gtc-venue-finder-glst__wrap',
      NORESULSTS: {
        BASE: 'gtc-venue-finder-glst__nres',
        TEXT: 'gtc-shorttext__text gtc-venue-finder-glst__nres-txt'
      },
      COLCLASS: {
        BASE: 'gtc-wrap gtc-venue-finder-glst__col',
        NUMBEROFROOMS: 'gtc-venue-finder-glst__col_7',
        NUMBEROFMEETINGROOMS: 'gtc-venue-finder-glst__col_3',
        VENUETYPE: 'gtc-venue-finder-glst__col_2',
        LARGESTROOM: 'gtc-venue-finder-glst__col_4',
        THEATERCAPACITY: 'gtc-venue-finder-glst__col_6'
      },
      HEADER: {
        BASE: 'gtc-venue-finder-glst__hdr',
        WRAP: 'gtc-venue-finder-glst__lst gtc-venue-finder-glst__lst--hdr'
      },
      CONTENT: {
        BASE: 'gtc-venue-finder-glst__cnt',
        WRAP: 'gtc-venue-finder-glst__lst gtc-venue-finder-glst__lst--cnt'
      },
      FOOTER: {
        BASE: 'gtc-venue-finder-glst__ftr',
        WRAP: 'gtc-venue-finder-glst__lst gtc-venue-finder-glst__lst--ftr',
        LISTELEMENT: 'gtc-venue-finder-glst__lst-li gtc-venue-finder-glst__lst-li--ftr',
        LOADDATABTN: {
          BASE: 'gtc-section__btn gtc-btn gtc-btn--juna',
          LABEL: 'gtc-btn__label'
        }
      },
      LOADOVERLAY: 'gtc-venue-finder-glst__lod'
    };
  //#endregion
  //#region Widget
  /**
   * @class: gtcvfLstView
   */
  $.widget(ns + name, {
    //#region props
    /**
     * @namespace gtc.mapPopup
     * @description Widget options and state.
     */
    options: {
      data: {
        list: null,
        pageSize: null,
        page: 1,
        lastPage: false,
        displayingRooms: false
      },
      labels: {
        header: {
          sort: {
            ascending: '',
            descending: '',
            none: ''
          }
        },
        content: {
          noResults: ''
        },
        footer: {
          loadData: ''
        }
      },
      loadData: {
        enabled: false,
        callback: null
      },
      sortBtnClass: null,
      generalBtnClass: null,
      loadBtnClass: null,
      cols: null,
      sortIconSvgId: null,
      checkIconSvgId: null,
      starIconSvgId: null,
      sortAdapter: null,
      pageAdapter: null,
      immediateSort: false,
      updateLoadingPosition: true,
      scrollCalcTimeout: 16,
      deferredIconsTimeout: 750,
      state: {
        isLoading: false,
        initialized: false,
        loadingSpinnerHeight: null,
        /**
         * Deferred item loading props.
         */
        deferredIcons: {
          refs: null,
          map: null,
          timer: null
        }
      }
    },
    baseWrap: null,
    cnt: null,
    cntLst: null,
    cntEls: null,
    hdr: null,
    hdrLst: null,
    hdrColRef: null,
    ftr: null,
    ftrLst: null,
    noResultsView: null,
    loadDataBtn: null,
    loadIcon: null,
    //#endregion
    //#region private
    /**
     * @namespace gtc.gtcvfLstView
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
      that._initOptions(that, opts);
      that._initElements(that, opts);
      that._addEventHandler(that, opts);
      opts.state.initialized = true;
      return that;
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the list view data.
     */
    _initData: (that, opts) => {
      if (!opts.cols || !opts.cols.length) opts.cols = [];
      for (var i = 0, iLen = opts.cols.length; i < iLen; ++i) {
        const theaterColumn = opts.cols[i].title === 'Theater Capacity' ? 'js-theaterCol' : '';
        const className = `${CSSCLS.COLCLASS.BASE} ${CSSCLS.COLCLASS.BASE}_${i} ${theaterColumn}`;
        const col = new VenueFinderListCol(opts.cols[i].title || null, opts.cols[i].desc || null, opts.cols[i].accessor || '',
          opts.cols[i].sort || null, i, className, opts.cols[i].type);
        if (opts.cols[i].type === VenueFinderListCol.types().NUMBERUNIT) col.unit = opts.cols[i].unit;
        opts.cols[i] = col;
      }
      //prep the data so that everything fits as expected ==> the labels, the content, whatever.
      //assign some classes so it does fit indeed.
      opts.data.displayingRooms = false;
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the list view options.
     */
    _initOptions: (that, opts) => {
      //loading
      if (opts.loadData.enabled && (!opts.loadData.callback || !$.isFunction(opts.loadData.callback))) opts.loadData.enabled = false;
      opts.state.loadingSpinnerHeight = null;
      //go over the column sorting
      let isSortedAlready = false;
      for (var i = 0, iLen = opts.cols.length; i < iLen; ++i) {
        if (opts.cols[i].sort.sortable && opts.cols[i].sort.isSortedby) {
          if (!isSortedAlready) isSortedAlready = true;
          else opts.cols[i].sort.isSortedby = false;
        }
      }
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the list view elements.
     */
    _initElements: (that, opts) => {
      that.element.addClass(CSSCLS.BASE);
      that.baseWrap = $(`<div class="${CSSCLS.WRAP}"></div>`);
      that._renderHeader(that, opts);
      that._renderContent(that, opts);
      that._renderFooter(that, opts);
      that.showLoading();
      //append
      that.element.append(that.baseWrap);
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the base Header elements.
     */
    _renderHeader: (that, opts) => {
      that.hdr = $(`<header class="${CSSCLS.HEADER.BASE}"></div>`);
      that.hdrLst = $(`<ul class="${CSSCLS.HEADER.WRAP}"></ul>`);
      that.hdr.append(that.hdrLst).appendTo(that.baseWrap);
      that._createHeaderCols(that, opts);
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the header columns.
     */
    _createHeaderCols: (that, opts) => {
      that.hdrColRef = that.hdrLst.gtcVfLstViewHdrRow({
        parent: that,
        labels: opts.labels.header,
        cols: opts.cols,
        sortBtnClass: opts.sortBtnClass,
        sortIconSvgId: opts.sortIconSvgId,
        sortAdapter: opts.sortAdapter,
        immediateSort: opts.immediateSort
      });
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the base footer elements.
     */
    _renderFooter: (that, opts) => {
      that.ftr = $(`<header class="${CSSCLS.FOOTER.BASE}"></div>`);
      that.ftrLst = $(`<ul class="${CSSCLS.FOOTER.WRAP}"></ul>`);
      that.ftr.append(that.ftrLst).appendTo(that.baseWrap);
      that._renderLoadingButton(that, opts);
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates and renders the load more button.
     */
    _renderLoadingButton: (that, opts) => {
      that.loadDataBtn = $(`<li class="${CSSCLS.FOOTER.LISTELEMENT}"><button class="${CSSCLS.FOOTER.LOADDATABTN.BASE}" type="button"><span class="${CSSCLS.FOOTER.LOADDATABTN.LABEL}">${opts.labels.footer.loadData}</span></button><li>`);
      that.ftrLst.append(that.loadDataBtn);
      that.loadDataBtn = that.loadDataBtn.children().first();
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the content elements.
     */
    _renderContent: (that, opts) => {
      that.cnt = $(`<div class="${CSSCLS.CONTENT.BASE}"></div>`);
      that.cntLst = $(`<ul class="${CSSCLS.CONTENT.WRAP}"></ul>`);
      that.cnt.append(that.cntLst).appendTo(that.baseWrap);
      if (opts.data.list && !opts.data.list.length) that._renderChildData();
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @param {bool} reset: Whether or not to reset the current listing.
     * @param {bool} softReset: Whether or not to soft reset the current listing.
     * @description Renders the child data for the content area.
     */
    _renderChildData: (that, opts, reset, softReset) => {
      that.cntEls = [];
      that._hideNoResultsView(that, opts);
      if (reset || softReset) that.cntLst.html('');
      if (opts.data.list && opts.data.list.length) {
        for (let i = opts.data.page === 1 || softReset ? 0 : (opts.data.page - 1) * opts.data.pageSize, iLen = opts.data.list.length; i < iLen; ++i) {
          that.cntEls.push($('<div></div>').gtcVfLstViewRow({
            parent: that,
            data: opts.data.list[i],
            generalBtnClass: opts.generalBtnClass,
            cols: opts.cols,
            checkIconSvgId: opts.checkIconSvgId,
            starIconSvgId: opts.starIconSvgId,
            renderRooms: opts.data.displayingRooms
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
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {bool} show: Whether or not to show the button.
     * @description Toggles the paging/data loading button.
     */
    _togglePageBtn: (that, show) => {
      //since the button currently is the only thing in the footer.
      if (show) that.ftr.removeClass(CSSCLS.HIDDEN);
      else that.ftr.addClass(CSSCLS.HIDDEN);
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts: Reference to self.options.
     * @description Hides the no-results view in the content area.
     */
    _hideNoResultsView: (that) => {
      if (that.noResultsView) that.noResultsView.addClass(CSSCLS.HIDDEN);
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options.
     * @description Displays the no-results view in the content area.
     */
    _displayNoResultsView: (that, opts) => {
      if (!that.noResultsView) {
        that.noResultsView = $(`<div class="${CSSCLS.NORESULSTS.BASE}"><div class="${CSSCLS.WRAP}"><p class='${CSSCLS.NORESULSTS.TEXT}'>${opts.labels.content.noResults}</p></div></div>`);
        that.cnt.append(that.noResultsView);
      }
      that.noResultsView.removeClass(CSSCLS.HIDDEN);
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options.
     * @description Adds the required event handlers.
     */
    _addEventHandler: (that, opts) => {
      that._on(that.loadDataBtn, {
        click: function () { if ($.isFunction(opts.pageAdapter) && that.hasData()) opts.pageAdapter(); }
      });
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options.
     * @param {bool} reset Whether or not to reset the position.
     * @description Updates the loading item position, when the page is scrolled.
     */
    _updateLoadingPostion: (that, opts, reset) => {
      if (reset) that.loading.children().eq(1).css('top', '');
      else if (that.loading) {
        const min = that.options.state.loadingSpinnerHeight * 1.5, max = $(that.element).outerHeight(true) - (that.options.state.loadingSpinnerHeight * 1.5);
        const scrollElement = document.scrollingElement ? document.scrollingElement : document.documentElement;
        let newPos = (scrollElement.scrollTop - that.element.position().top) + ($(window).height() / 2);
        if (newPos < min) newPos = min;
        if (newPos > max) newPos = max;
        that.loading.children().eq(1).css('top', `${newPos}px`);
      }
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {string} icondId The id of the requested icon.
     * @param {object} addTo Element either jQuery or html to add the class to.
     * @returns {object} Element or string containing the svg item to be rendered or the deferred reference or null.
     * @description Updates the loading item position, when the page is scrolled.
     */
    _getDeferredIcon: (that, iconId, addTo) => {
      const opts = that.options;
      let icon, wasString = false;
      //render if we got the icon, load it otherwise.
      if (opts.state.deferredIcons.map && opts.state.deferredIcons.map.has(iconId)) {
        icon = opts.state.deferredIcons.map.get(iconId);
        if (icon.loaded) {
          //return icon.html;
          if (typeof addTo === 'string') return $(addTo).append(icon.html)[0].outerHTML;
          else return $(addTo).append(icon.html);
        }
      } else {
        if (!opts.state.deferredIcons.map) opts.state.deferredIcons.map = new Map();
        if (opts.state.deferredIcons.refs === null) opts.state.deferredIcons.refs = 0;
        //add the item
        if (typeof addTo === 'string') {
          addTo = $(addTo);
          wasString = true;
        }
        addTo.addClass(CSSCLS.DEFERREDLOADING).attr('data-icon-id', iconId);
        //count the references
        opts.state.deferredIcons.refs++;
        //start running the loading process.
        that._loadDeferredIcons(that, opts);
      }
      return wasString ? addTo[0].outerHTML : addTo;
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options.
     * @description Updates the loading item position, when the page is scrolled.
     */
    _loadDeferredIcons: (that, opts) => {
      //check if we need to start a process or have it running already
      if (!opts.state.deferredIcons.timer && opts.state.deferredIcons.refs > 0) opts.state.deferredIcons.timer = window.setTimeout(() => {
        //find the references to all elements within this element having the class
        const icons = that.element.find(`.${CSSCLS.DEFERREDLOADING}`);
        //if you found them ==> Render the icon
        for (let i = 0, iLen = icons.length; i < iLen; ++i) {
          const ico = $(icons[i]), type = ico.attr('data-icon-id');
          let deferrredIcon, canAdd = false;
          //Try to load the item from the list
          if (opts.state.deferredIcons.map.has(type)) {
            deferrredIcon = opts.state.deferredIcons.map.get(type);
            if (deferrredIcon.loaded) canAdd = true;
          } else {
            deferrredIcon = new DeferredIcon(type);
            deferrredIcon.loadItem();
            opts.state.deferredIcons.map.set(type, deferrredIcon);
            if (deferrredIcon.loaded) canAdd = true;
          }
          //render the item or defer it further
          if (canAdd) {
            ico.html(deferrredIcon.html).removeClass(CSSCLS.DEFERREDLOADING).removeAttr('data-icon-id');
            --opts.state.deferredIcons.refs;
          }
        }
        //call this method again
        opts.state.deferredIcons.timer = null;
        that._loadDeferredIcons(that, opts);
      }, opts.deferredIconsTimeout);
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @private
     * @description Destroys the widget.
     */
    _destroy: function() {
      //we would usually attempt to properly destroy all child widgets, but it's not neccessary for now, since the widget is only ever created once.
      const that = this;
      that.element.html('').removeClass(CSSCLS.BASE);
      opts.state.deferredIcons.map = null;
      that.baseWrap = that.cnt = that.cntLst = that.cntEls = that.cntEls = that.hdr = that.hdrLst = that.hdrColRef = that.ftr = that.ftrLst = that.noResultsView = that.loadDataBtn = that.loadIcon = null;
    },
    //#endregion
    //#region publics
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @description Destroys the widget.
     */
    destroy: function () {
      const that = this;
      that.options.state.initialized = false;
      that._destroy();
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @param {object} data Data to update the widhet with (data: array<object>, page: int, take: int)
     * @description Updates the widget child data. To be called when the filter data changes.
     */
    updateData: function (data) {
      const that = this, opts = that.options,
        reset = (data.page === 1 && opts.data.list && opts.data.list.length),
        softReset = ((opts.data.list && opts.data.list.length === data.data.length) && opts.data.page === data.page && opts.data.pageSize === data.take);
      that.showLoading();
      if (!opts.data.list || !opts.data.list.length) opts.data.list = [];
      opts.data.pageSize = data.take;
      opts.data.page = data.page;
      opts.data.lastPage = data.take * data.page >= data.total;
      //apply
      if (reset || !opts.data.list.length || data.page === 1) opts.data.list = data.data;
      else if (softReset) opts.data.list = data.data;
      else opts.data.list = opts.data.list.concat(data.data.slice(opts.data.list.length, data.data.length));
      //render or rerender
      that._renderChildData(that, that.options, reset, softReset);
      that.hideLoading();
      const $venueFinderListType = $(`.${CSSCLS.COLCLASS.VENUETYPE}`).children('.gtc-block-itm__lst-prop--txt');
      const $venueFinderListBlock = $('.gtc-venue-finder-glst__lst .gtc-block-itm');
      $venueFinderListType.each(function () {
        const type = decodeURI($(this).data('text').toLowerCase());
        const typeClass = type.split(' ').join('-');
        // add venue type class to block element
        $(this).parents('.gtc-block-itm').addClass('gtc-block-itm--' + typeClass);
      });
      $venueFinderListBlock.each(function () {
        // if venue finder list block is a hotel
        if ($(this).hasClass('gtc-block-itm--hotel')) {
          const numberOfMeetingRooms = $(this).find(`.${CSSCLS.COLCLASS.NUMBEROFMEETINGROOMS} .gtc-txt--num`).text();
          if (numberOfMeetingRooms === '0') {
            // replace number of meeting rooms 0 with '-' 
            $(this).find(`.${CSSCLS.COLCLASS.NUMBEROFMEETINGROOMS} .gtc-txt--num`).first().addClass('gtc-txt--dash');
            // replace largest room 0 with '-' 
            $(this).find(`.${CSSCLS.COLCLASS.LARGESTROOM} .gtc-txt--num`).first().addClass('gtc-txt--dash');
            // hide squaremeter
            $(this).find(`.${CSSCLS.COLCLASS.LARGESTROOM} .gtc-txt--num:not(.gtc-txt--dash)`).hide();
            // replace theater capacity 0 with '-' 
            $(this).find(`.${CSSCLS.COLCLASS.THEATERCAPACITY} .gtc-txt--num`).first().addClass('gtc-txt--dash');
          }
        } else {
          // all other venue types (e.g. restaurants, conference centers, ..)
          $(this).find(`.${CSSCLS.COLCLASS.NUMBEROFROOMS} .gtc-txt--num`).first().addClass('gtc-txt--dash');
        }
      });
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @returns {bool}: Whether or not the widget got data.
     * @description Checks whether or not the widget has data.
     */
    hasData: function () { return this.options.data.list && this.options.data.list.length; },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @description Shows the loading overlay item for the list.
     */
    showLoading: function () {
      const that = this;
      if (!that.loading) {
        that.loading = $(`<div class="${GTC.Utils.CSSCLS.LOADING.BRIGHT} ${CSSCLS.LOADOVERLAY}"><div class="${GTC.Utils.CSSCLS.LOADING.OVERLAY}"></div><div class="${GTC.Utils.CSSCLS.LOADING.SPIN}"></div></div>`);
        that.element.append(that.loading);
      }
      if (!that.options.state.isLoading) {
        that.loading.removeClass(CSSCLS.HIDDEN);
        that.options.state.isLoading = true;
      }
      //calculate the scroll position by
      //taking the offset and height of this element and subtracting that value from the page height
      if (that.options.updateLoadingPosition) {
        let timer = null;
        that._on($(document), {
          scroll: function () {
            clearTimeout(timer);
            timer = window.setTimeout(function () {
              timer = 0;
              that._updateLoadingPostion(that, that.options);
            }, that.options.scrollCalcTimeout);
          }
        });
        if (!that.options.state.loadingSpinnerHeight) that.options.state.loadingSpinnerHeight = that.loading.children().eq(1).outerHeight(true);
        that._updateLoadingPostion(that, that.options);
      }
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @description Hides the loading overlay item for the list.
     */
    hideLoading: function () {
      const that = this;
      if (that.options.state.isLoading) {
        that.options.state.isLoading = false;
        that.loading.addClass(CSSCLS.HIDDEN);
        //Unbnd scroll event
        if (that.options.updateLoadingPosition) that._off($(document), 'scroll');
        that._updateLoadingPostion(that, that.options, true);
      }
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @param {int<VenueFinderListUnit.types()>} newValue Type of the new unit.
     * @description Should be called when the measuring unit of the filter has changed. Toggles the unit view class.
     */
    toggleUnit: function (newValue) {
      const that = this;
      if (newValue === VenueFinderListUnit.types().NONE || newValue === VenueFinderListUnit.types().SQMETER) that.element.removeClass(CSSCLS.BASESQUAREFEET);
      else if (newValue === VenueFinderListUnit.types().SQFEET) that.element.addClass(CSSCLS.BASESQUAREFEET);
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @description Shows the element.
     */
    show: function () { this.element.removeClass(CSSCLS.HIDDEN); },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @description Hides the element.
     */
    hide: function () { this.element.addClass(CSSCLS.HIDDEN); },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @returns {bool}: Whether or not the elememnt is hidden.
     * @description Checks whether or not the element is hidden.
     */
    isHidden: function () { return this.element.hasClass(CSSCLS.HIDDEN) && this.element.is(':hidden'); },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @param {object} element The element to add the icon to as jQuery object or HTML string.
     * @param {bool} asjQueryObj Wether or not the presented item is a jQuery object and should be returned as such.
     * @param {string} iconId: The id of the icon to be used.
     * @returns {object} Either the rendered or temporary item or item string or null.
     * @description Attempts to render an svg item in a directly or in a deffered way, if neccessary.
     */
    renderSvgItemDeferred: function (element, asjQueryObj, iconId) {
      if (!element || !element.length || !iconId || !iconId.length) return null;
      //==> wait additional 5 second and autoclear the map.
      const that = this;
      return that._getDeferredIcon(that, iconId, element);
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @description Renders the room list for the venue elements, provided the items have rooms.
     */
    renderRoomList: function () {
      const that = this;
      if (!that.options.data.displayingRooms) {
        that.options.data.displayingRooms = true;
        that._renderChildData(that, that.options, true);
      }
    },
    /**
     * @namespace gtc.gtcvfLstView
     * @function
     * @description Remoes the room elements from items that have rooms.
     */
    removeRoomList: function () {
      const that = this;
      if (that.options.data.displayingRooms) {
        that.options.data.displayingRooms = false;
        that._renderChildData(that, that.options, true);
      }
    }
    //#endregion
  });
  //#endregion
})(window, $);