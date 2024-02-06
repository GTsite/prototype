/* eslint-disable no-underscore-dangle, no-cond-assign, no-useless-escape, no-undef, function-paren-newline, no-unused-vars, no-multi-assign, arrow-body-style */
/**
   * @fileoverview
   * @version 1.0
   *
   * @namespace gtc.pdfVenuVenue
   * @desc: The shortlist pdf export list venue venuelist item.
   */
(function (window, $) {
  'use strict';

  //#region global
  const ns = 'gtc.',
    name = 'gtcPdfVenuVenue',
    CSSCLS = {
      WRAP: 'gtc-pdf-venue-item--venue',
      HEADER: {
        COUNT: 'gtc-pdf-venue-item__count',
        COUNTVENUE: 'gtc-pdf-venue-item__count--venue'
      },
      CONTENT: {
        BASE: 'gtc-pdf-venue-item__cnt',
        TABLE: {
          BASE: 'gtc-pdf-venue-item__table',
          ROW: 'gtc-pdf-venue-item__table-row',
          CELL: 'gtc-pdf-venue-item__table-td',
          HEADERCELL: 'gtc-pdf-venue-item__table-td--hdr'
        }
      }
    };
  //#endregion
  //#region Widget
  /**
   * @class: gtcPdfVenuBase
   */
  $.widget(ns + name, $.gtc.gtcPdfVenuBase, {
    //#region Props
    options: {
      tableConfig: [
        { accessor: 'Name', lblIdx: -1, hasUnit: false, colClass: 'col-name' },
        { accessor: 'Surface', lblIdx: 0, hasUnit: true, colClass: 'col-ar', cellClass: 'center' },
        { accessor: 'TheaterStyleCapacity', lblIdx: 1, hasUnit: false, colClass: 'col-room col-room-0', cellClass: 'center' },
        { accessor: 'SchoolStyleCapacity', lblIdx: 2, hasUnit: false, colClass: 'col-room col-room-1', cellClass: 'center' },
        { accessor: 'BanquetStyleCapacity', lblIdx: 3, hasUnit: false, colClass: 'col-room col-room-2', cellClass: 'center' },
        { accessor: 'CocktailStyleCapacity', lblIdx: 4, hasUnit: false, colClass: 'col-room col-room-3', cellClass: 'center' },
        { accessor: 'BoardroomStyleCapacity', lblIdx: 5, hasUnit: false, colClass: 'col-room col-room-4', cellClass: 'center' },
        { accessor: 'UStyleCapacity', lblIdx: 6, hasUnit: false, colClass: 'col-room col-room-5', cellClass: 'center' }
      ]
    },
    //#endregion
    /**
     * @namespace gtc.gtcPdfVenuVenue
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the list view elements.
     */
    _initElements: (that, opts) => {
      that._super(that, opts);
      that.wrap.addClass(CSSCLS.WRAP);
      that._renderContent(that, opts);
    },
    /**
     * @namespace gtc.gtcPdfVenuVenue
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the Header elements.
     */
    _renderHeader: (that, opts) => {
      that._super(that, opts);
      that.header.find(`.${CSSCLS.HEADER.COUNT}`).addClass(CSSCLS.HEADER.COUNTVENUE);
    },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @returns {$.object} jQuery reference to the created object.
     * @description Creates the data table element with all related content.
     */
    _createTable: (that, opts) => {
      let table = `<table class="${CSSCLS.CONTENT.TABLE.BASE}"><colgroup>`;
      //Generate cols
      for (let i = 0, iLen = opts.tableConfig.length; i < iLen; ++i) table += `<col class="${opts.tableConfig[i].colClass}" />`;
      table += `</colgroup><thead><tr class="${CSSCLS.CONTENT.TABLE.ROW}">`;
      //generate header row
      for (let i = 0, iLen = opts.tableConfig.length; i < iLen; ++i) table += `<td class="${CSSCLS.CONTENT.TABLE.CELL} ${CSSCLS.CONTENT.TABLE.HEADERCELL}${opts.tableConfig[i].cellClass && opts.tableConfig[i].cellClass.length ? ' ' + opts.tableConfig[i].cellClass : ''}">${opts.tableConfig[i].lblIdx > -1 && opts.tableConfig[i].lblIdx < iLen ? opts.labels.tableCols[opts.tableConfig[i].lblIdx] : ''}</td>`;
      table += '</tr></thead><tbody>';
      //Generate content rows
      for (let j = 0, jLen = opts.data.item.ConferenceRoomList.length; j < jLen; ++j) {
        //ceck if we need to skip the current romm, since it's a sleeping room
        let skip = true;
        for (let i = 0, iLen = opts.tableConfig.length; i < iLen; ++i) {
          if (opts.tableConfig[i].lblIdx === -1) continue;
          const roomVal = opts.data.item.ConferenceRoomList[j][opts.tableConfig[i].accessor];
          if (roomVal && roomVal.length) {
            skip = false;
            break;
          }
        }
        if (skip) continue;
        table += `<tr class="${CSSCLS.CONTENT.TABLE.ROW}">`;
        for (let i = 0, iLen = opts.tableConfig.length; i < iLen; ++i) {
          if (i === 0) {
            table += `<td class="${CSSCLS.CONTENT.TABLE.CELL} ${CSSCLS.CONTENT.TABLE.HEADERCELL}${opts.tableConfig[i].cellClass && opts.tableConfig[i].cellClass.length ? ' ' + opts.tableConfig[i].cellClass : ''}">${opts.data.item.ConferenceRoomList[j][opts.tableConfig[i].accessor]}`;
          } else {
            table += `<td class="${CSSCLS.CONTENT.TABLE.CELL}${opts.tableConfig[i].cellClass && opts.tableConfig[i].cellClass.length ? ' ' + opts.tableConfig[i].cellClass : ''}">${opts.data.item.ConferenceRoomList[j][opts.tableConfig[i].accessor]}`;
          }
          if (opts.tableConfig[i].hasUnit && opts.data.item.ConferenceRoomList[j][opts.tableConfig[i].accessor] && opts.data.item.ConferenceRoomList[j][opts.tableConfig[i].accessor].length) {
            table += ` ${GTC.Utils.htmlDecode(opts.labels.unitSq)}`;
          }
          table += '</td>';
        }
        table += '</tr>';
      }
      //close and append
      table += '</tbody></table>';
      return $(table);
    },
    /**
     * @namespace gtc.gtcPdfVenuBase
     * @function
     * @private
     * @param {object} that Reference to self.
     * @param {object} opts Reference to self.options,
     * @description Creates the content elements.
     */
    _renderContent: (that, opts) => {
      that.content = $(`<div class="${CSSCLS.CONTENT.BASE}"></div>`);
      if (opts.data.item.ConferenceRoomList && opts.data.item.ConferenceRoomList.length) that.content.append(that._createTable(that, opts));
      that.wrap.append(that.content);
    },
    /**
     * @namespace gtc.gtcPdfVenuVenue
     * @function
     * @private
     * @description Destroys the widget.
     */
    _destroy: function() {
      const that = this;
      that.wrap.removeClass(CSSCLS.WRAP);
      that.header.find(`.${CSSCLS.HEADER.COUNT}`).removeClass(CSSCLS.HEADER.COUNTVENUE);
      that._super();
    }
    //#endregion
  });
  //#endregion
})(window, $);