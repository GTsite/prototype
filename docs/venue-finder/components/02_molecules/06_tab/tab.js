/* global App */

'use strict';

App.prototype.Tabs = (function () {
  class Tabs extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.BEM = `${this.CSS_NSP}tabs`;
      this.TOGGLE = this.BEM + '__toggle';
      window.jQueryTABS = window.jQuery(`${this.BEM}`);
      this.launch = this.run();
    }

    run() {
      this.Utils.Debug(false, 'Tabs: run');

      const TabsToggle = new this.Toggle({ // eslint-disable-line no-unused-vars
        BEM: this.BEM,
        SEL: this.TOGGLE,
        TOOGLE_TYPE: 'tab',
        // TOGGLE_ANIM: 'fade',
        GROUP: true
      });
    }
  }

  return new Tabs();
}());
