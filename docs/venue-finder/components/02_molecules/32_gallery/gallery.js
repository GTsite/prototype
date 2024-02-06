/* global App */

'use strict';

App.prototype.Gallery = (function () {
  /**
 * Javascript component for gallery elements.
 * @class Gallery
 * @category Component
 * @extends App
 * */
  class Gallery extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.JS_NSP = this.Utils.JsNsp;
      this.BEM = `${this.CSS_NSP}gallery`;
      this.SELECTOR = `${this.Utils.JsNsp}${this.BEM}`;
      this.launch = this.run();
    }

    run() {
      this.Utils.Debug(false, 'Gallery: run');
      const $gallery = this.$(`.${this.SELECTOR}`);
      if ($gallery.length > 0) {
        $gallery.each((i, element) => {
          const $element = this.$(element);
          this.Utils.Debug(false, $element);
        });
        // this.addEventListener();
      }
    }
  }

  return new Gallery();
}());
