//#region PDF Export options
/**
 * @class Pdfoptions
 * @description Storage and config classs for the Html to PDF converter lib. The options set should work out of the box. Marke sure to disable caching for testing purposes if it's otherweise activated.
 */
App.prototype.PdfOptions = function (contextItemId) {
  const that = this;
  that.contextId = contextItemId;         //striung id of the sitecore context item.
  that.pageSize = 'A4';                   //Page size i e.G. "A4", "A3", "A0", "B2" or x-seperated int values such as 768x1024.
  that.pageOrientation = 'portrait';      //Landscape or Portrait (defaulting to portrait).
  that.waitBeforeExport = 0;              //Time to wait in ms before exporting to PDF.
  that.fileName = null;                   //Name of the file.
  that.singlePage = false;                //Whether or not the document is supposed to be rendered on a single page.
  that.viewWidth = -1;                    //Width in pt with wich the PDF is being rendered (Optional).
  that.viewHeight = -1;                   //Height pt with wich the PDF is being rendered (Optional).
  that.jpegCompression = 0;              //JPEG compression level between 0 - 100 default (50).
  that.mediaType = null;                  //Media type for rendering the content when exporting to PDF. (default: "screen" | "print").
  that.marginTop = 10;                    //Top margin of the PDF in pt.
  that.marginRight = 10;                  //Right margin of the PDF in pt.
  that.marginBottom = 10;                 //Bottom margin of the PDF in pt.
  that.marginLeft = 10;                   //Left margin of the PDF in pt.
  that.footer = null;                     //Html containinig the custom PDF footer.
  that.footerHeight = -1;                 //Height in pt of the custom footer. -1 if no footer is to be rendered.
  that.bottomSpacing = -1;                //Spacing between page footer and page bottom. -1 in case of no spacing.
  that.header = null;                     //Html containing the custom PDF header.
  that.headerHeight = -1;                 //Height in pt of the custom header.-1 if no header is to berendered.
  that.topSpacing = -1;                   //Spacing in pt between the page header and page top. -1 in case of no spacing.
  that.pageBreakBeforeSelectors = [];     //List of selectors to generate a explicit pagebreak before (the given elements).
  that.pageBreakAfterSelectors = [];      //List of selectors to generate a explicit pagebreak after(the given elements).
  that.pageBreakAvoidSelectors = [];      //List of selectors to avoid breaking the page in.
  that.bookmarksEnabled = true;           //Whether or not PDF bookmarks will be enabled.
  that.autoGenerateBookmarks = true;      //Whether or not to auto-generate PDF bookmarks.
  that.bookmarksSelector = [];            //List of selectors to generate bookmarks on (bookmarksEnabled must be true to use this option).
  that.allowDefaultTitle = true;          //Whether or a default title for bookmarks without text will be rendered.
  that.bookmarksdefaultTitle = null;      //The defualt title for bookmarks without text.
  that.pageNumberStartingIdx = -1;        //The number to start counting pages at. -1 if not to be set.
  that.authorName = null;                 //Meta: PDF Author name.
  that.subject = null;                    //Meta: PDF Subject.
  that.allowCopy = true;                  //Security: Whether or not copying the PDF contents is enabled.
  that.allowEdit = true;                  //Security: Whether or not editing the PDF contents is enabled.
  that.allowPrint = true;                 //Security: Whether or not printing the PDF contents is enabled.
  that.pdfBackgroundAlpha = -1;           //PDF background-color alpha value.
  that.pdfBackgroundRed = -1;             //PDF background-color red value.
  that.pdfBackgroundGreen = -1;           //PDF background-color green value.
  that.pdfBackgroundBlue = -1;            //PDF background-color bluevalue.
  that.pdfBackgroundEnabled = false;      //Whether or not the PDF background is enabled.
  that.pdfStandardSubset = -1;            //The subset the PDF will be rendered in accordance with. 0: Full, 1: A, 2: X (dfault: 0 or -1)
  that.repeatTableFooters = true;         //Whether or not the table footer will be repeated on each page.
  that.repeatTableHeaders = true;         //Whether or not the table header will be repeated on each page.
  that.stackTableFooters = true;          //Whether or not table footer will be stacked when the table line breaks.
  that.stackTableHeaders = true;          //Whether or not table header will be stacked when the table line breaks.
  that.md5DataHash = null;                //Hash of the data to be exported to detect data changes.
  that.cache = false;                     //Whether or not the document should be cashed and outputted for the same data instead of a generating it anew.
  that.pageWidth = -1;                    //Sets the width of the target reactanlge of the PDF (default: automatically calculated).
  that.pageHeight = -1;                   //Sets the height of the target reactanlge of the PDF(default: automatically calculated).
  that.addCookiesToRq = null;             //List of cookies to be tranmitted with the requst to the html (authentication and or detection mechanism; e.g.: Site minder and stuff).
  that.waterMark = null;                  //A watermark HTML string to be added to the document.
  that.watermarkWidth = -1;               //The height of the watermark.
  that.watermarkHeight = -1;              //The widh of the watermark.
};
//#endregion

//#region PDf Exporter
/**
 * Pdf Exporter functionality for all pages. To work properly, the funcitonality will have to be enabled on the page itself (AllowEvoExport on the MainHeader).
 */
App.prototype.PdfExporter = (function () {
  'use strict';

  /**
   * Defining functionality for the pdf conversion of the pages.
   */
  class PdfExporter extends App {
    constructor() {
      super();
      const that = this;
      //launch prop
      that.launch = that.run();
    }

    /**
     * Attempts to export the current page as PDF.
     * @param {string} contextItemid The id of the sitecore context item.
     * @param {GTC.PdfOptions} [options = new GTC.PdfOptions(contextItemId)] Options to be set for the PDF and the exporter.
     * @param {function} [error = null]  Error callback.
     * @param {functiony} [success = null] Success clallback.
     * @param {bool} [open = true] Whether or not the PDF should be opened in a separate window directly after finishing the export and before the success callback.
     */
    exportPdf(contextItemId, options, error = null, success = null, open = true) {
      const that = this;
      if (!options || !(options instanceof GTC.PdfOptions)) options = new GTC.PdfOptions(contextItemId);
      that.Utils.request.postJSON({
        data: options,
        url: that.Utils.urls.pdfExporter(),
        onDone: (data) => {
          if (open && data && data.length) window.open(data, '_blank');
          if (success && $.isFunction(success)) success.call(that, data);
        },
        onFail: (response) => { if (error && $.isFunction(error)) error.call(that, ['Error Exporting the PDF.', response]); }
      });
    }
    /**
     * Tests the export function with some settings.
     * @param {string} contextItemid The id of the sitecore context item.
     */
    testExport(contextItemId) {
      const that = this;
      //if (!that.Utils.DebugMode()) return;
      that.Utils.cookie.setCookie('testCookieOne', 'testCokieOneValue');
      that.Utils.cookie.setCookie('testCookieTwo', 'testCokieTwoValue');
      const options = new that.PdfOptions(contextItemId);
      options.waterMark = '<div style=\'font-size:60px;color:#00ffff;opacity:.5;text-align:center;width:1005;\'>Test Watermark!</div>';
      options.watermarkHeight = 500;
      options.watermarkWidth = 500;
      options.waitBeforeExport = 2;
      options.pageBreakAfterSelectors = ['.gtc-block gtc-block--footer > ul > li:first-of-type'];
      that.exportPdf(options, () => that.Utils.Debug(true, 'PDf export via testExport failed.'), () => that.Utils.Debug(true, 'PDf export via testExport succeeded.'));
    }

    run() {
      const that = this;
      that.Utils.Debug(false, 'PdfExporter: run');
    }
  }
  return new PdfExporter();
})();
//#endregion