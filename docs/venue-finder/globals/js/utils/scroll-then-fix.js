/* global App */

'use strict';

App.prototype.ScrollThenFixed = (function () {
  class ScrollThenFixed extends App {
    constructor(options = {}) {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.JS_NSP = this.Utils.JsNsp;
      this.BEM = options.BEM || this.CSS_NSP + 'scroll-fixed';
      this.SEL = options.SEL || this.BEM;
      this.PARENT = options.PARENT || this.BEM;
      this.FIXED_WRAPPER = options.FIXED_WRAPPER || this.SEL;
      this.ISFIXED = this.SEL + '--fixed';
      this.OFFSET = options.OFFSET || 0;
      this.$SEL = this.$(`.${this.SEL}`);
      this.$WINDOW = this.$(window);
      this.previousScroll = 0;
      this.scrollDelta = 5;
      this.ELEM_TOP_POS = '';
      this.FIXED_START_POS = '';
      this.$mainHeaderHeight = $('.' + this.CSS_NSP + 'header').height();
      this.FIXED_ELEM_HEIGHT = '';
      this.$PARENT = this.$(`.${this.PARENT}`);
      this.$FIXED_WRAPPER = this.$(`.${this.FIXED_WRAPPER}`);
      this.launch = this.run();
    }

    handleFixed() {
      this.Utils.Debug(false, 'ScollThenFixed: handleFixed');
      const currentScroll = this.$WINDOW.scrollTop();
      // this.Utils.Debug(this.FIXED_START_POS);

      // make sure they scroll more than delta
      if (Math.abs(this.previousScroll - currentScroll) <= this.scrollDelta) {
        return;
      }

      if (currentScroll >= this.$mainHeaderHeight) {
        // scroll position greater than fixedStartPos
        this.$SEL.addClass(this.ISFIXED);
      } else {
        // scroll position less than fixedStartPos
        this.$SEL.removeClass(this.ISFIXED);
      }

      this.previousScroll = currentScroll;
    }

    run() {
      this.Utils.Debug(false, 'ScollThenFixed: run');

      if (this.$SEL.length) {
        $(window).on('changeViewport', (e, data) => {
          const { previousViewport } = data;
          const { currentViewport } = data;

          if (currentViewport === 'md' || currentViewport === 'lg') {
            if (previousViewport !== 'md' || previousViewport !== 'lg') {
              this.Utils.Debug(false, 'addEventListener');
              window.addEventListener('scroll', this.Utils.throttle(this.handleFixed, 10, this));
            }

            // TODO search for better solution than setTimeout
            setTimeout(() => {
              this.FIXED_ELEM_HEIGHT = this.$FIXED_WRAPPER.height();
              this.ELEM_TOP_POS = this.$SEL.offset().top;
              this.FIXED_START_POS = this.ELEM_TOP_POS - this.OFFSET;
              this.$PARENT.css('height', this.FIXED_ELEM_HEIGHT);
            }, 30);
          }

          if (previousViewport === 'md' || previousViewport === 'lg') {
            if (currentViewport === 'xs' || currentViewport === 'sm') {
              window.removeEventListener('scroll', this.Utils.throttle(this.handleFixed, 10, this));
            }
          }
        });
      }
    }
  }

  return ScrollThenFixed;
}());
