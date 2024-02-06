/* global App */

'use strict';

App.prototype.ShowGrid = (function () {
  class ShowGrid extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.BEM = `${this.CSS_NSP}grid-overlay`;
      this.ACTIVE = `${this.BEM}--active`;
      this.BTN = `${this.BEM}__btn`;
      this.launch = this.run();
    }

    run() {
      this.Utils.Debug(false, 'ShowGrid: run');
    }
  }

  return new ShowGrid();
}());
