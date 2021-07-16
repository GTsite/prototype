/* global App */

'use strict';

App.prototype.Lightbox = (function () {
  /**
   * Javascript component for Lightbox elements.
   * @class Lightbox
   * @category Component
   * @extends App
   * */
  class Lightbox extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.JS_NSP = this.Utils.JsNsp;
      this.BEM = `${this.CSS_NSP}lightbox`;
      this.SELECTOR = `${this.JS_NSP}${this.BEM}`;
      this.LIGHTBOX_OPTIONS = {
        selector: `.${this.SELECTOR}`,
        // Enable infinite gallery navigation
        loop: true,
        // Should display navigation arrows at the screen edges
        arrows: true,
        // Should display infobar (counter and arrows at the top)
        infobar: false,
        // What buttons should appear in the top right corner.
        // Buttons will be created using templates from `btnTpl` option
        // and they will be placed into toolbar (class="fancybox-toolbar"` element)
        buttons: [
          // 'slideShow',
          // 'fullScreen',
          // 'thumbs',
          // 'share',
          // 'download',
          // 'zoom',
          'close'
        ],
        // Custom CSS class for layout
        baseClass: 'gtc-fancybox',
        // Button templates
        btnTpl: {
          close: '<button data-fancybox-close class="fancybox-button fancybox-button--close" title="{{CLOSE}}">' +
                    '<span class="fancybox-button__icon">' +
                      '<svg viewBox="0 0 28 28" class="gtc-icon" width="28" height="28">' +
                        '<use xlink:href="#icon-lightbox-cross"></use>' +
                      '</svg>' +
                    '</span>' +
                '</button>',

          // Arrows
          arrowLeft: '<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}">' +
                        '<span class="fancybox-button__icon">' +
                          '<svg viewBox="0 0 18 18" class="gtc-icon" width="18" height="18">' +
                            '<use xlink:href="#icon-arrow-left"></use>' +
                          '</svg>' +
                        '</span>' +
                      '</button>',

          arrowRight: '<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}">' +
                        '<span class="fancybox-button__icon">' +
                          '<svg viewBox="0 0 18 18" class="gtc-icon" width="18" height="18">' +
                            '<use xlink:href="#icon-arrow-right"></use>' +
                          '</svg>' +
                        '</span>' +
                      '</button>'
        }
      };
      this.$SELECTOR = this.$(`.${this.SELECTOR}`);
      this.launch = this.run();
    }

    get Opts() {
      return this.LIGHTBOX_OPTIONS;
    }

    set Opts(options) {
      this.LIGHTBOX_OPTIONS = options;
    }

    initLightbox(setup = this.LIGHTBOX_OPTIONS) {
      this.Utils.Debug(false, 'Lightbox: initLightbox');
      this.Opts = setup;
      this.Utils.Debug(false, this.Opts);

      // Unbind Fancybox and initialize new instance
      $(document).unbind('click.fb-start');
      $().fancybox(this.Opts);
    }

    run() {
      this.Utils.Debug(false, 'Lightbox: run');
      this.initLightbox();
    }
  }

  return new Lightbox();
}());
