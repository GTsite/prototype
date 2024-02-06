/* eslint-disable no-underscore-dangle, no-undef, indent */

const VenueFinderListCol = require('../36_venue-finder_utils/00_venue-finder-list-class-3').default;

(function (window, $) {
  'use strict';

  //#region global
  const ns = 'gtc.',
    name = 'gtcVfLstViewRow',
    CSSCLS = {
      BASE: 'gtc-block gtc-block-itm',
      WRAP: 'gtc-block-itm__wrap',
      HIDDEN: 'gtc-block-itm-hidden',
      LIST: {
        BASE: 'gtc-block-itm__lst',
        ITEM: {
          ICONDEFERRED: 'gtc-block-itm__ico-def',
          BASE: 'gtc-block-itm__lst-col gtc-block-itm__col',
          SUB: {
            BASE: 'gtc-block-itm__lst-prop',
            TYPES: {
              TXT: 'gtc-block-itm__lst-prop--txt',
              TXTMULTILINE: 'gtc-block-itm__lst-prop--txt-mul',
              TXTBASETXT: 'gtc-block-itm__lst-prop--txt-bse',
              TXTCONTENT: 'gtc-txt gtc-txt--short',
              TXTCONTENTSVG: 'gtc-txt gtc-txt--svg',
              TXTCONTENTSVGSUB: 'gtc-txt gtc-txt--svg-sub',
              TXTCONTENTSVGRTING: 'gtc-txt gtc-txt--svg-rting',
              NUM: 'gtc-block-itm__lst-prop--num',
              NUMWOUNIT: 'gtc-block-itm__lst-prop--num-raw',
              NUMEL: 'gtc-txt gtc-txt--num',
              NUMLBL: 'gtc-txt--num__lbl',
              NUMUNIT: 'gtc-txt--num__unit',
              CHECK: 'gtc-block-itm__lst-prop--check',
              CHECKEL: 'gtc-checkbox gtc-checkbox--nyla gtc-checkbox--venue',
              CHECKELACTIVE: 'gtc-checkbox--checked',
              CHECKINP: 'gtc-checkbox__inp',
              CHECKVIS: 'gtc-checkbox__vis',
              CHECKLBL: 'gtc-checkbox__lbl',
              IMG: 'gtc-block-itm__lst-prop--image',
              IMGPIC: 'gtc-picture',
              IMPICIMG: 'gtc-image'
            }
          }
        }
      },
      ROOMBOX: {
        BASE: 'gtc-block-itm-rmb'
      },
      DETAIL: {
        BASE: 'gtc-block-itm-dtl',
        CONTAINER: 'gtc-block-itm-dtl__cnt',
        PANE: {
          BASE: 'gtc-tabs__pane',
          ACCPANE: 'gtc-accordion__pane',
          ACCTOGGLE: 'gtc-accordion__toggle'
        }
      },
      LOADOVERLAY: 'gtc-block-itm__lod',
      DETAILBLOCKCLSBTN: 'gtc-block__detail-closer'
    };
  //#endregion
  /**
   * @fileoverview
   * @version 1.0
   *
   * @namespace gtc.gtcVfLstViewRow
   * @desc Provides a custom widgt for a list row of the VenueFinder List View.
   */
  $.widget(ns + name, {
    //#region prppsc
    options: {
      labels: {},
      cols: null,
      data: null,
      itemIdKey: 'ItemId',
      shortListedKey: 'IsShortListed',
      generalBtnClass: null,
      checkIconSvgId: null,
      starIconSvgId: null,
      parent: null,
      renderRooms: false,
      childNS: {
        hotels: 'gtcPdfVenuHotel',
        venues: 'gtcPdfVenuVenue'
      },
      state: {
        detailsLoaded: false,
        baseEventsAdded: false,
        loadingData: false
      }
    },
    wrap: null,
    list: null,
    items: null,
    loading: null,
    toggle: null,
    //#endregion
    //#region private
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @returns {object} A new instance of the gtcVfLstViewRow.
     * @description Inherited default create function.
     */
    _create: function () {
      const that = this,
        opts = that.options;
      that._super();
      that._initData(that, opts);
      that._initOptions(that, opts);
      that._initElements(that, opts);
      that._addEventHandler(that, opts);
      return that;
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @description Initializes the data.
     */
    _initData: (that, opts) => {
      if (!opts.data || typeof opts.data !== 'object') opts.data = {};
      if (!opts.cols || !opts.cols.length) opts.cols = [];
      if (opts.renderRooms && (!opts.data.ConferenceRoomList || !opts.data.ConferenceRoomList.length)) opts.renderRooms = false;
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @description Initializes the options.
     */
    _initOptions: (that, opts) => {
      opts.state.detailsLoaded = false;
      opts.state.baseEventsAdded = false;
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @description Creates and initializes the elements present.
     */
    _initElements: (that, opts) => {
      //render the base element
      that.element.addClass(CSSCLS.BASE);
      //render the wrap
      that.wrap = $(`<a class="${CSSCLS.WRAP}" href='${opts.data.DetailUrl.substring(0, opts.data.DetailUrl.lastIndexOf('?vview'))}'></a>`);
      //render the list
      that.list = $(`<ul class="${CSSCLS.LIST.BASE}"></ul>`);
      that.wrap.append(that.list);
      //render the columns
      that._createCells(that, opts);
      if (opts.renderRooms) that._createRooms(that, opts);
      //append stuff
      that.element.append(that.wrap);
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @description Creates the cell elements to be displayed.
     */
    _createCells: (that, opts) => {
      that.items = [];
      for (let i = 0, iLen = opts.cols.length; i < iLen; ++i) {
        const col = opts.cols[i];
        let curHtml = `<li class="${col.class} ${CSSCLS.LIST.ITEM.BASE}">`;
        //that part would usualyl be done through child widgets, but we have neither the time nor the need to be that flexible.
        curHtml += that._getColHtml(that, opts, col);
        //add tag "Sustainable choice" if there is one
        if (opts.data.Tags && opts.data.Tags['sustainable choice']) {
          curHtml += `<div class="m-tags-wrapper"><div class="a-sustainable-tag"><span class="line-clamp _1 break-word">${opts.data.Tags['sustainable choice']}</span></div></div>`
        }
        curHtml += '</li>';
        that.items.push($(curHtml));
      }
      //render
      if (that.items.length) that.list.append(that.items);
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @description Attempts to render the room-list.
     */
    _createRooms: (that, opts) => {
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
      const roomElement = $(`<div class="${CSSCLS.ROOMBOX.BASE}"></div>`);
      config.data.item = opts.data;
      config.data.itemIndex = 0;
      config.data.displayIndex = 1;
      roomElement.gtcPdfVenuVenue(config).data(opts.childNS.venue);
      that.wrap.append(roomElement);
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @param {Object<VenueFinderListCol>} col Column instance.
     * @returns {string} The HTML for the col or "";
     * @description Selects the appropriate render type for the given colun and returns the html
     */
    _getColHtml: (that, opts, col) => {
      const types = VenueFinderListCol.types();
      switch (col.type) {
        case types.IMAGE:
          return that._getImgHtml(that, opts, col);
        case types.CHECKBOX:
          return that._getCheckHtml(that, opts, col);
        case types.NUMBERUNIT:
          return that._getNumHtml(that, opts, col, true);
        case types.NUMBER:
          return that._getNumHtml(that, opts, col, false);
        case types.TEXT:
          return that._getTextHtml(that, opts, col, false);
        case types.TEXTMULTI:
          return that._getTextHtml(that, opts, col, true);
        case types.TEXTMULTIISSVG:
          if (opts.data.isHotel) return that._getHotelTextHtml(that, opts, col, true, true);
          return that._getTextHtml(that, opts, col, true, true);
        case types.NONE:
        default:
          return '';
      }
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @param {Object<VenueFinderListCol>} col Column instance.
     * @returns {string} Html for the img type or ""
     * @description Creates the HTML for the img type.
     */
    _getImgHtml: (that, opts, col) => {
      const accArr = col.accessor.split(';');
      let data = opts.data[accArr[0]], title = opts.data[accArr[1]];
      //data
      if (data && data.length && typeof data === 'string') data = data.trim();
      else {
        data = '';
        opts.data[accArr[0]] = data;
      }
      //title
      if (title && title.length && typeof title === 'string') title = title.trim();
      else {
        title = '';
        opts.data[accArr[1]] = title;
      }
      return `<div class="${CSSCLS.LIST.ITEM.SUB.BASE} ${CSSCLS.LIST.ITEM.SUB.TYPES.IMG}" data-text="${encodeURIComponent(data)}"><picture class="${CSSCLS.LIST.ITEM.SUB.TYPES.IMGPIC}"><img src="${data}" alt="${title}" class="${CSSCLS.LIST.ITEM.SUB.TYPES.IMPICIMG}" /></picture></div>`;
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @param {Object<VenueFinderListCol>} col Column instance.
     * @returns {string} Html for the checkbox type or ""
     * @description Creates the HTML for the checkbox type.
     */
    _getCheckHtml: (that, opts, col) => {
      let data = opts.data[col.accessor];
      if (!data || typeof data !== 'boolean') {
        opts.data[col.accessor] = false;
        data = opts.data[col.accessor];
      }
      const id = new Date().getTime().toString() + '_' + GTC.Utils.randomNumber(0, Number.MAX_SAFE_INTEGER || 9999999).toString();
      return `<div class="${CSSCLS.LIST.ITEM.SUB.BASE}" data-text="${encodeURIComponent(data)}"><div class="${CSSCLS.LIST.ITEM.SUB.TYPES.CHECKEL} ${opts.generalBtnClass && opts.generalBtnClass.length ? ' ' + opts.generalBtnClass : ''}${CSSCLS.LIST.ITEM.SUB.TYPES.CHECK} ${data === true ? ' ' + CSSCLS.LIST.ITEM.SUB.TYPES.CHECKELACTIVE : ''}"><input class="${CSSCLS.LIST.ITEM.SUB.TYPES.CHECKINP}" type="checkbox" ${data === true ? 'checked="checked"' : ''} id='${id}' />${opts.parent.renderSvgItemDeferred('<div class="' + CSSCLS.LIST.ITEM.SUB.TYPES.CHECKVIS + '"></div>', false, opts.checkIconSvgId)}<label class="${CSSCLS.LIST.ITEM.SUB.TYPES.CHECKLBL}" for='${id}'></label></div></div>`;
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @param {Object<VenueFinderListCol>} col Column instance.
     * @param {bool} unit Whether or not a unit should be added.
     * @description Creates the HTML for the numeric type.
     */
    _getNumHtml: (that, opts, col, unit) => {
      let data = opts.data[col.accessor];
      if ((typeof data === 'string' && data.length) || !isNaN(data)) data = parseInt(typeof data === 'string' ? data.trim() : data);
      else {
        if (col.accessor === 'NumberOfHotelRooms') {
          opts.data[col.accessor] = '-';
        }
        opts.data[col.accessor] = '';
        data = opts.data[col.accessor];
      }
      let html = `<div class="${CSSCLS.LIST.ITEM.SUB.BASE} ${CSSCLS.LIST.ITEM.SUB.TYPES.NUM}${!unit ? ' ' + CSSCLS.LIST.ITEM.SUB.TYPES.NUMWOUNIT : ''}" data-text="${encodeURIComponent(data)}"><span class="${CSSCLS.LIST.ITEM.SUB.TYPES.NUMEL}">${data}</span>`;
      if (unit) html += `<span class="${CSSCLS.LIST.ITEM.SUB.TYPES.NUMEL}" data-unit-id="${col.unit.type}">${GTC.Utils.htmlDecode(col.unit.symbol)}</span>`;
      html += '</div>';
      return html;
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @param {Object<VenueFinderListCol>} col Column instance.
     * @param {bool} multiLine Whether or not the control is a multiline control.
     * @param {bool} specialClass Whether or not the special text class should be added.
     * @returns {string} Html for the text type.
     * @description Creates the HTML for the text type.
     */
    _getTextHtml: (that, opts, col, multiLine, specialClass) => {
      let data = opts.data[col.accessor];
      if (data && data.length && typeof data === 'string') data = data.trim();
      else {
        opts.data[col.accessor] = '';
        data = opts.data[col.accessor];
      }
      return `<div class="${CSSCLS.LIST.ITEM.SUB.BASE} ${CSSCLS.LIST.ITEM.SUB.TYPES.TXT}${multiLine ? ' ' + CSSCLS.LIST.ITEM.SUB.TYPES.TXTMULTILINE : ''}${specialClass ? ' ' + CSSCLS.LIST.ITEM.SUB.TYPES.TXTBASETXT : ''}" data-text="${encodeURIComponent(data)}"><span class="${CSSCLS.LIST.ITEM.SUB.TYPES.TXTCONTENT}">${data}</span></div>`;
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @param {Object<VenueFinderListCol>} col Column instance.
     * @param {bool} multiLine Whether or not the control is a multiline control.
     * @param {bool} specialClass Whether or not the special text class should be added.
     * @description Creates the HTML for the special hotel text type containing star icons directly after the text.
     */
    _getHotelTextHtml: (that, opts, col, multiLine, specialClass) => {
      let data = opts.data[col.accessor];
      //get data
      if (data && data.length && typeof data === 'string') data = data.trim();
      else {
        opts.data[col.accessor] = '';
        data = opts.data[col.accessor];
      }
      //load item deferred
      let stars = `<span class='${CSSCLS.LIST.ITEM.SUB.TYPES.TXTCONTENTSVGRTING}'>{stars-loading}${opts.data.IsSuperior ? '<span class="' + CSSCLS.LIST.ITEM.SUB.TYPES.TXTCONTENTSVGSUB + '">' + GTC.VenueFilters.superiorityIndicator() + '</span>' : ''}</span>`;
      //append the stars
      if (opts.data.isHotel && opts.data.HotelRating > 0) {
        let starsHtml = '';
        for (let i = 0, iLen = opts.data.HotelRating; i < iLen; ++i) {
          let currentStar = `<span class='${CSSCLS.LIST.ITEM.SUB.TYPES.TXTCONTENTSVG}'></span>`;
          currentStar = opts.parent.renderSvgItemDeferred(currentStar, false, opts.starIconSvgId);
          starsHtml += currentStar;
        }
        stars = stars.replace('{stars-loading}', starsHtml);
      } else stars = '';
      return `<div class="${CSSCLS.LIST.ITEM.SUB.BASE} ${CSSCLS.LIST.ITEM.SUB.TYPES.TXT}${multiLine ? ' ' + CSSCLS.LIST.ITEM.SUB.TYPES.TXTMULTILINE : ''}${specialClass ? ' ' + CSSCLS.LIST.ITEM.SUB.TYPES.TXTBASETXT : ''}" data-text="${encodeURIComponent(data)}"><span class="${CSSCLS.LIST.ITEM.SUB.TYPES.TXTCONTENT}">${data}${stars}</span></div>`;
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @description Attempts to load the detail block with all the neccessary steps.
     */
    _loadDetails: (that, opts) => {
      if (opts.state.detailsLoaded || opts.state.loadingData) return void (0);
      opts.state.loadingData = true;
      that._toggleLoading(that, true);
      const error = function (...args) {
        //TODO: Add proper failure handling, tell the user that an error occurred and he/shit/it has to reload the page.
        GTC.Utils.Debug(true, args);
        that._toggleLoading(that, false);
        //readd event handlers so the user can try again.
        that._addEventHandler(that, opts);
        opts.state.loadingData = false;
      };
      GTC.Utils.request.postJSON({
        data: { itemId: opts.data[opts.itemIdKey], language: $('html').attr('lang') },
        url: GTC.Utils.urls.blockDetails() + opts.data.DetailUrl.substring(opts.data.DetailUrl.lastIndexOf('?v')),
        onDone: (data) => {
          if (!data || !data.length) error(data);
          else {
            opts.state.detailsLoaded = true;
            
            // ADDED only for local development            
            if (__IS_LOCAL__) { 
              const newData = data.replace(/\/-\/media/gi, "https://www.geneve.com/-/media");
              data = newData;
            }

            data = $(data);            
            that._loadDetailsSuccessInit(that, opts, data);
          }
        },
        onFail: function (...args) { error(args); }
      });
      return void (0);
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @param {$.object} target Reference to the checkbox button.
     * @description Add currently selected Item to shortlist
     */
    _toggleItemShortListing: (that, opts, target) => {
      //display loading
      that._toggleLoading(that, true);
      //request
      GTC.Shortlist.toogleShortlistItem(opts.data[opts.itemIdKey], !opts.data[opts.shortListedKey], () => {
        opts.data[opts.shortListedKey] = !opts.data[opts.shortListedKey];
        //check or uncheck checkbox button
        if (target.hasClass(CSSCLS.LIST.ITEM.SUB.TYPES.CHECKELACTIVE)) target.removeClass(CSSCLS.LIST.ITEM.SUB.TYPES.CHECKELACTIVE);
        else target.addClass(CSSCLS.LIST.ITEM.SUB.TYPES.CHECKELACTIVE);
        that._toggleLoading(that, false);
      }, () => that._toggleLoading(that, false));
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {$.object} dEl Details element.
     * @description Attempts to resolve the view classes and propertes for the details block, in case the current viewport is xs or sm.
     */
    _detailsBlockCorrectView: (dEl) => {
      if (!dEl || !dEl.length) return;
      const vp = GTC.Utils.Viewport;
      if (vp !== 'sm' && vp !== 'xs') return;
      //toggle the accordion elements if the current viewport is sm||xs
      const tabsPanes = dEl.find(`.${CSSCLS.DETAIL.PANE.BASE}`);
      for (let i = 1, iLen = tabsPanes.length; i < iLen; ++i) {
        const pane = tabsPanes.eq(i);
        if (!pane.length) continue;
        pane.attr('aria-hidden', false);
        pane.find(`.${CSSCLS.DETAIL.PANE.ACCPANE}`).attr('aria-hidden', true);
        pane.find(`.${CSSCLS.DETAIL.PANE.ACCTOGGLE}`).attr('aria-expanded', false);
      }
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @param {$.object} data The reference to the jQuery details object.
     * @description Initializes the detail content after being loaded and redered.
     */
    _loadDetailsSuccessInit: (that, opts, data) => {
      //init toggle
      try {
        data.addClass(CSSCLS.DETAIL.BASE).attr('aria-hidden', true).children().eq(0).addClass(GTC.Utils.CSSCLS.CONTAINER.FLUID + ' ' + CSSCLS.DETAIL.CONTAINER).removeClass(GTC.Utils.CSSCLS.CONTAINER.BASE);
        //remove old event handlers
        that._removeEventHandler(that, opts);
        that.element.append(data);
        //initialize the toggle, tiny bit too much complcation here
        that.wrap.data('target', data.attr('id')).addClass(CSSCLS.WRAP + data.attr('id'));
        GTC.Utils.refreshViewportValue(true);
        //GTC.BlockDetails.setPostioningClass(that.element);
        that.toggle = new GTC.Toggle({
          BEM: GTC.Utils.CssNsp,
          SEL: `${CSSCLS.WRAP + data.attr('id')}`,
          GROUP: null,
          TOGGLE_ANIM: 'slide',
          SELF_CLOSING: true
        });
        //init map
        gtcInitMap(data);
        that._addEventHandler(that, opts);
        that._detailsBlockCorrectView(data);
        //set states
        that.wrap.trigger('click');
      } catch (e) {
        GTC.Utils.Debug(true, [`Error when initializeing venue finder detail list view for id: ${opts.data[opts.itemIdKey]}.`, e]);
      } finally {
        opts.state.loadingData = false;
        that._toggleLoading(that, false);
      }
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {bool} show Whether or not to show the loading.
     * @description Toggles the loading overlay for this widget.
     */
    _toggleLoading: (that, show) => {
      if (show) {
        if (!that.loading) {
          that.loading = $(`<div class="${GTC.Utils.CSSCLS.LOADING.BRIGHT} ${CSSCLS.LOADOVERLAY}"><div class="${GTC.Utils.CSSCLS.LOADING.OVERLAY}"></div><div class="${GTC.Utils.CSSCLS.LOADING.SPIN}"></div></div>`);
          that.element.append(that.loading);
          //cancel click events on the loading overlay.
          that._on(that.loading, { click: function () { return false; } });
        }
        that.loading.removeClass(CSSCLS.HIDDEN);
      } else {
        if (that.loading) that.loading.addClass(CSSCLS.HIDDEN);
      }
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @description Adds the required event handlers.
     */
    _addEventHandler: (that, opts) => {
      if (!opts.state.baseEventsAdded) {
        //shortlist
        that._on(that.list.find(`.${CSSCLS.LIST.ITEM.SUB.TYPES.CHECKEL.replace(/ /g, '.')}`), {
          click: function (e) {
            that._toggleItemShortListing(that, opts, $(e.currentTarget));
            return false;
          }
        });
        that._on(that.list.find(`.${CSSCLS.LIST.ITEM.SUB.TYPES.CHECKEL.replace(/ /g, '.')}`).parent(), {
          click: function (e) {
            if ($.isFunction(e.preventDefault)) e.preventDefault();
            return false;
          }
        });
        opts.state.baseEventsAdded = true;
      }
      if (!opts.state.detailsLoaded) that._on(that.wrap, {
        click: 'loadDetails'
      });
      else that._on(that.element.find(`.${CSSCLS.DETAILBLOCKCLSBTN}`), {
        click: function () { that.wrap.trigger('click'); }
      });
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @description Removes event handlers for loading data.
     */
    _removeEventHandler: (that) => {
      that._off(that.wrap, 'click');
    },
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @description Destroys the widget.
     */
    _destroy: function() {
      const that = this;
      that.wrap = that.list = that.items = that.loading = null;
      that.element.removeClass(CSSCLS.BASE).children().remove();
    },
    //#endregion
    //#region globals
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options
     * @description Loads or toggles the details from the server.
     */
    loadDetails: function () {
      const that = this, opts = that.options;
      if (opts.state.detailsLoaded) that.element.trigger('click');
      else that._loadDetails(that, opts);
      return false;
    },
    /**
     * Destroys the widget.
     */
    /**
     * @namespace gtc.gtcVfLstViewRow
     * @function
     * @private
     * @description Destroys the widget.
     */
    destroy: function() {
      const that = this;
      that._destroy();
    }
    //#endregion
  });
}(window, $));