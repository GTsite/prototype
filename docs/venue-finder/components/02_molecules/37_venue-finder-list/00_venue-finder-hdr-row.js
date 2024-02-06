/* eslint-disable no-underscore-dangle, no-undef */
/**
 * @fileoverview
 * @version 1.0
 *
 * @namespace gtc.gtcVfLstViewHdrRow
 * @desc: Provides a custom widgt for a list row of the VenueFinder List View header
 */

const VenueFinderListSort = require('../36_venue-finder_utils/00_venue-finder-list-class-1').default;

(function (window, $) {
  'use strict';

  //#region global
  const ns = 'gtc.',
    name = 'gtcVfLstViewHdrRow',
    CSSCLS = {
      SORTING: {
        SORTABLE: 'gtc-venue-finder-glst__col-sen',
        BASE: 'gtc-venue-finder-glst__col-srt',
        ASC: 'gtc-venue-finder-glst__col-srt-asc',
        DSC: 'gtc-venue-finder-glst__col-srt-dsc'
      },
      BUTTON: {
        BASE: 'gtc-btn js-gtc-btn',
        LABEL: 'gtc-btn__label',
        ICON: 'gtc-btn__icon',
        ICONASCENDING: 'icon-dsc',
        ICONDESCENDING: 'icon-asc'
      }
    };


  const handleSortOrderNone = (element, opts) => {
    element.removeClass(CSSCLS.SORTING.BASE + ' ' + CSSCLS.SORTING.ASC + ' ' + CSSCLS.SORTING.DSC).find(`.${CSSCLS.BUTTON.ICON}`).removeClass(CSSCLS.BUTTON.ICONASCENDING + ' ' + CSSCLS.BUTTON.ICONDESCENDING).parent().attr('title', opts.labels.sort.none);
  };

  const handleOrderClass = (element, opts, isAsc) => {
    if (isAsc) {
      element.addClass(CSSCLS.SORTING.BASE + ' ' + CSSCLS.SORTING.ASC).find(`.${CSSCLS.BUTTON.ICON}`).addClass(CSSCLS.BUTTON.ICONASCENDING).parent().attr('title', opts.labels.sort.ascending);
    } else {
      element.removeClass(CSSCLS.SORTING.ASC).addClass(CSSCLS.SORTING.BASE + ' ' + CSSCLS.SORTING.DSC).find(`.${CSSCLS.BUTTON.ICON}`).removeClass(CSSCLS.BUTTON.ICONASCENDING).addClass(CSSCLS.BUTTON.ICONDESCENDING).parent().attr('title', opts.labels.sort.descending);
    }
  };

  const updateDuplicateColumn = (opts) => {
    const duplicateColumnId = 5;
    const cols = opts.cols.map(col => {
      if (col.idx === duplicateColumnId) {
        const newCol = {
          ...col,
          sort: {
            isSortedby: true,
            order: "dsc",
            sortId: 4,
            sortable: true
          }
        }
        return newCol;
      }
      return col;
    });

    return {
      ...opts,
      cols
    };
  };

  //#endregion
  $.widget(ns + name, {
    //#region props
    /**
     * @namespace gtc.gtcVfLstViewHdrRow
     * @description Widget options and state.
     */
    options: {
      parent: null,
      labels: {
        sort: {
          ascending: '',
          descending: '',
          none: ''
        }
      },
      sortBtnClass: null,
      cols: null,
      sortIconSvgId: null,
      sortAdapter: null,
      immediateSort: false,
      renderDefferedTimeout: 500, //the timeout for the icons being rendered. Since this whole thing is being rendered directly after loading the page, the image map may not be loaded properly when rendering this. This approach attempts to work around the issue of non-existant indicator icons.
      renderDefferedMaxRetry: 10,
      state: {
        active: {
          id: null,
          element: null,
          order: null
        }
      }
    },
    colRenders: null,
    //#endregion
    //#region private
    /**
     * @namespace gtc.gtcVfLstViewHdrRow
     * @function
     * @private
     * @returns {object} A new instance of the header row.
     * @description Inherited default create function.
     */
    _create: function () {
      const that = this,
        opts = that.options;
      that._super();
      that._initOptions(that, opts);
      that._initElements(that, opts);
      that._addEventHandler(that, opts);
      return that;
    },
    /**
     * @namespace gtc.gtcVfLstViewHdrRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the options.
     */
    _initOptions: (that, opts) => { opts.state.active.id = opts.state.active.element = null; },
    /**
     * @namespace gtc.gtcVfLstViewHdrRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Initializes the base elements.
     */
    _initElements: (that, opts) => {
      that._renderCols(that, updateDuplicateColumn(opts));
    },
    /**
     * @namespace gtc.gtcVfLstViewHdrRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Renders the columns defined in the options.
     */
    _renderCols: (that, opts) => {
      that.colRenders = [];
      for (let i = 0, iLen = opts.cols.length; i < iLen; ++i) {
        const col = opts.cols[i];
        let colCssClass = col.class, curCol = `<li cssClassPlaceholder title='${col.desc && col.desc.length ? col.desc : ''}' data-id="${i}">`;
        if (col.sort.sortable) {
          colCssClass += ' ' + CSSCLS.SORTING.SORTABLE;
          let icoStyle = CSSCLS.BUTTON.ICON;
          //sorting stuff
          if (col.sort.isSortedby && col.sort.order !== VenueFinderListSort.sortOrderNone()) {
            //Get the direction class
            if (col.sort.order === VenueFinderListSort.sortOrderASC()) {
              icoStyle += ` ${CSSCLS.BUTTON.ICONASCENDING} `;
              colCssClass += ' ' + CSSCLS.SORTING.BASE + ' ' + CSSCLS.SORTING.ASC;
            } else if (col.sort.order === VenueFinderListSort.sortOrderDSC()) {
              icoStyle += ` ${CSSCLS.BUTTON.ICONDESCENDING} `;
              colCssClass += ' ' + CSSCLS.SORTING.BASE + ' ' + CSSCLS.SORTING.DSC;
            }
            opts.state.active.id = i;
            opts.state.active.order = col.sort.order;
          }
          //render
          curCol += `<button class="${CSSCLS.BUTTON.BASE}${opts.sortBtnClass && opts.sortBtnClass.length ? ' ' + opts.sortBtnClass : ''}"><span class="${CSSCLS.BUTTON.LABEL}">${col.title && col.title.length ? col.title : ''}</span>${opts.parent.renderSvgItemDeferred('<span class="' + icoStyle + '"></span>', false, opts.sortIconSvgId)}</button>`;
        } else {
          curCol += `<button class="${CSSCLS.BUTTON.BASE}"><span class="${CSSCLS.BUTTON.LABEL}">${col.title && col.title.length ? col.title : ''}</span></button>`;
        }
        curCol += '</li>';
        //apply the css class to the element
        curCol = curCol.replace('cssClassPlaceholder', `class="${colCssClass}"`);
        that.colRenders.push(curCol);
      }
      if (that.colRenders.length) that.element.append(that.colRenders);
      //check if we got some initial sorting
      if (opts.state.active.id !== null) {
        opts.state.active.element = null;
        opts.state.active.order = opts.cols[opts.state.active.id].sort.order;
        //call sort adapter
        opts.sortAdapter(opts.cols[opts.state.active.id].sort.sortId, opts.state.active.order, false);
      }
      //that.colRenders = null;
    },
    /**
     * @namespace gtc.gtcVfLstViewHdrRow
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Adds the event handlers required for the widget.
     */
    _addEventHandler: (that, opts) => {
      that._on(that.element.find(`.${CSSCLS.BUTTON.BASE.replace(' ', '.')}`), {
        click: function (e) {
          if (!opts.parent.hasData()) return true;
          const element = $(e.currentTarget).parent(), dId = element.data('id');
          if (opts.state.active.id !== null && !opts.state.active.element) opts.state.active.element = that.element.children().eq(opts.state.active.id);
          let changed = true;
          if (!opts.cols[dId].sort.sortable) return true;
          if (opts.state.active.id === null) {
            //if we got no active element ==> sort this ascending
            that._sort(that, opts, element, dId, VenueFinderListSort.sortOrderASC()); //set ascending on current
          } else if (opts.state.active.id !== null && opts.state.active.id !== dId) {
            that._sort(that, opts, opts.state.active.element, opts.state.active.id, VenueFinderListSort.sortOrderNone()); //remove active
            that._sort(that, opts, element, dId, VenueFinderListSort.sortOrderASC()); //set ascending on current
          } else if (opts.state.active.id !== null && opts.state.active.id === dId) {
            //if this is the active element
            if (opts.state.active.order === VenueFinderListSort.sortOrderASC()) {
              //set dscending on current
              that._sort(that, opts, element, dId, VenueFinderListSort.sortOrderDSC());
            } else if (opts.state.active.order === VenueFinderListSort.sortOrderDSC()) {
              //set none on current
              that._sort(that, opts, element, dId, VenueFinderListSort.sortOrderNone());
            }
          } else {
            changed = false;
            GTC.Utils.Debug(false, ['Venue finder List sorting invalid state when attempting to change the sorting.']);
          }
          //toggle the callback for setting the filter and order.
          if (changed && $.isFunction(opts.sortAdapter)) opts.sortAdapter(opts.state.active.id === null ? -1 : opts.cols[opts.state.active.id].sort.sortId, opts.state.active.order, opts.immediateSort);
          return false;
        }
      });
      //enable a click on sortable columns to trigger a click on the buttons.
      that._on(that.element.find(`.${CSSCLS.SORTING.SORTABLE}`), {
        click: function (e) {
          const target = $(e.currentTarget), child = target.find(`.${CSSCLS.BUTTON.ICON}`);
          if (child.length) {
            child.trigger('click');
            return false;
          }
          return true;
        }
      });
    },
    /**
     * @namespace gtc.gtcVfLstViewHdrRow
     * @function
     * @private
     * @param {gtcVfLstViewHdrRow} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @param {$.object} element List element to be sorted.
     * @param {int} id Idx of the column within the cols object.
     * @param {string} order The sort order.
     * @description Sets the local sort state according to the options.
     */
    _sort: function (that, opts, element, id, order) {
      const dobuleColumnsIds = [4, 5];
      const isDoubleColumn = dobuleColumnsIds.some(columnId => columnId === id);
      const secondColumn = isDoubleColumn && id === dobuleColumnsIds[0] ? element.next() : element.prev();

      if (order === VenueFinderListSort.sortOrderNone()) {
        handleSortOrderNone(element, opts);
        if (isDoubleColumn) {
          handleSortOrderNone(secondColumn, opts);
        }
        opts.state.active.order = opts.state.active.id = opts.state.active.element = null;
      } else {
        opts.state.active.id = id;
        opts.state.active.element = element;
        if (order === VenueFinderListSort.sortOrderASC()) {
          opts.state.active.order = order;
          handleOrderClass(element, opts, true);
          if (isDoubleColumn) {
            handleOrderClass(secondColumn, opts, true);
          }
        } else if (order === VenueFinderListSort.sortOrderDSC()) {
          opts.state.active.order = order;
          handleOrderClass(element, opts, false);
          if (isDoubleColumn) {
            handleOrderClass(secondColumn, opts, false);
          }
        }
      }
    },
    /**
     * @namespace gtc.gtcVfLstViewHdrRow
     * @private
     * @function
     * @description Destroys the widget..
     */
    _destroy: function() {
      const that = this;
      that.colRenders = null;
      that.element.children().remove();
    },
    //#endregion
    //#region publics
    /**
     * @namespace gtc.gtcVfLstViewHdrRow
     * @function
     * @description Destroys the widget.
     */
    destroy: function() {
      const that = this;
      that._destroy();
    }
    //#endregion
  });
}(window, $));
