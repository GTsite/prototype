App.prototype.BlockDetails = (function () {
  'use strict';

  class BlockDetails extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.BEM = `${this.CSS_NSP}block`;
      this.SELECTOR = '.js-' + this.BEM;
      this.NODE_CLASS = this.BEM + '__node';
      this.DETAIL_PANEL = this.BEM + '__detail';
      this.CLOSER = this.BEM + '__detail-closer';
      this.LOADED_CLASS = this.BEM + '--loaded';
      this.OPEN_CLASS = this.BEM + '--open';
      this.NODE_SELECTOR = `.${this.NODE_CLASS}`;
      this.TOGGLE_SELECTOR = this.BEM + '__toggle';
      this.TOGGLE_SELECTOR_MINI = this.BEM + '__toggle--mini';
      this.TOGGLE_GROUP_CONTAINER = `${this.CSS_NSP}main`; // this.BEM + '-group';
      this.TOGGLE_GROUP_CONTAINER_MINI = `${this.BEM}-group--mini`;
      this.PARENT_OFFSET_SELECTOR = this.BEM + '-group'; // this.CSS_NSP + 'section__blocks';
      this.PARENT_FULLWIDTH_OFFSET_SELECTOR = this.CSS_NSP + 'section-fullwidth'; // this.CSS_NSP + 'section__blocks';
      window.jQueryconditionToggle = `.${this.CSS_NSP}dropdown__toggle--condition`;
      window.jQuerymainNav = `.${this.CSS_NSP}navigation-main__wrapper`;
      this.currentViewport = null;
      this.previousViewport = null;
      this.launch = this.run();
    }

    getPartentOffset($currentElement, $parentElement) {
      this.Utils.Debug(false, 'BlockDetails: getPartentOffset');
      const elementOffsetLeft = $currentElement.offset().left;
      const parentOffsetLeft = $parentElement.offset().left;
      const offset = elementOffsetLeft - parentOffsetLeft;
      return offset;
    }

    setPostioningClass($current) {
      this.Utils.Debug(false, 'BlockDetails: setPostioningClass');
      const $currentBlock = $current.parents('.' + this.BEM);
      const $detailPanel = $current.parent().find(window.jQuery('.' + this.DETAIL_PANEL));
      var $blockGroupParent = '';
      if ($currentBlock.parents('.' + this.PARENT_OFFSET_SELECTOR).eq(0).length > 0) {
        $blockGroupParent = $currentBlock.parents('.' + this.PARENT_OFFSET_SELECTOR).eq(0);
      } else {
        // full-width blocks
        $blockGroupParent = $currentBlock.parents('.' + this.PARENT_FULLWIDTH_OFFSET_SELECTOR).eq(0);
      }

      const parentWidth = $blockGroupParent.width();
      const offset = this.getPartentOffset($currentBlock, $blockGroupParent);
      const position = Math.ceil(offset / (parentWidth / 100));
      let group = 'mini';

      if ($blockGroupParent.hasClass(`${this.PARENT_OFFSET_SELECTOR}--mini`)) {
        if (this.currentViewport === 'xs' || this.currentViewport === 'sm') {
          group = 'mini-mobile';
        } else if (this.previousViewport === 'md' || this.previousViewport === 'lg') {
          group = 'mini';
        }
      } else {
        group = 'default';
      }

      // this.Utils.Debug(this.currentViewport);
      // this.Utils.Debug($currentBlock);
      // this.Utils.Debug($blockGroupParent);
      // this.Utils.Debug(parentWidth);
      // this.Utils.Debug(position);
      // this.Utils.Debug(group);

      switch (group) {
        case 'mini-mobile':
          if (position < 50) {
            $detailPanel.attr('data-panel-position', 'left');
          } else if (position >= 50) {
            $detailPanel.attr('data-panel-position', 'right');
          }

          $current.addClass(this.TOGGLE_SELECTOR_MINI);
          $current.trigger('click.toggle');
          $current.off('.toggle');
          break;

        case 'mini':
          if (position < 20) {
            $detailPanel.attr('data-panel-position', 'left');
          } else if (position >= 20 && position < 40) {
            $detailPanel.attr('data-panel-position', 'center-left');
          } else if (position >= 40 && position < 60) {
            $detailPanel.attr('data-panel-position', 'center');
          } else if (position >= 60 && position < 80) {
            $detailPanel.attr('data-panel-position', 'center-right');
          } else if (position >= 80) {
            $detailPanel.attr('data-panel-position', 'right');
          }

          $current.addClass(this.TOGGLE_SELECTOR_MINI);
          $current.trigger('click.toggle');
          $current.off('.toggle');
          break;

        default:
          if (position < 33) {
            $detailPanel.attr('data-panel-position', 'left');
          } else if (position >= 33 && position < 66) {
            $detailPanel.attr('data-panel-position', 'center');
          } else if (position >= 66) {
            $detailPanel.attr('data-panel-position', 'right');
          }

          $current.addClass(this.TOGGLE_SELECTOR);
          $current.trigger('click.toggle');
          $current.off('.toggle');
      }
    }

    requestNodeContent($current) {
      const that = this;
      that.Utils.Debug(false, 'BlockDetails: requestNodeContent');
      //Define the ajax options.
      const options = {
        url: $current.data('ajax-action'),
        type: 'Post',
        data: {
          itemId: $current.data('ajax-item-id'),
          pageId: $current.data('ajax-pageid'),
          ajaxGuid: $current.data('ajax-guid'),
          language: $current.data('ajax-language'),
          settings: $current.data('ajax-settings')
        }
      };
      /**
       * Success handler.
       * @param {string} data: Response html string.
       * @param {Object<$.ajax.options>} opts: Ajax Options object.
       */
      const success = function (data, opts) {
        if (data && data.length) {
          that.Utils.Debug(false, 'BlockDetails: AjaxSuccess');
          $current.parent().append(data);
          // Remove event handlers in the ".loadNode" namespace
          $current.off('.loadNode');
          $current.addClass(that.LOADED_CLASS);
          $(document).trigger('block-details-loaded');
          that.setPostioningClass($current);
          // trigger viewport change
          that.Utils.refreshViewportValue(true);
          // initialize map after ajax call
          gtcInitMap($current); // eslint-disable-line
        } else {
          that.Utils.Debug(false, 'Requesting the block detail content retuned no data.', opts);
        }
      };
      //send ajax
      $.ajax(options).done((data) => { success(data, options); }).fail((e) => { that.Utils.Debug(false, 'failed ajax request', e); });
    }

    onClickHandler(ev) {
      this.Utils.Debug(false, 'BlockDetails: onClickHandler');
      const $current = window.jQuery(ev.currentTarget);
      ev.preventDefault();
      this.Utils.Debug(false, $current);
      if ($current.hasClass(this.NODE_CLASS)) {
        if ($current.hasClass(this.LOADED_CLASS)) {
          // this.removeNodeContent($current);
        } else {
          this.requestNodeContent($current);
        }
      }
    }

    conditionToggle(el) {
      var $self = el.currentTarget;
      $($self).toggleClass(`${this.CSS_NSP}activeEl`);
      var $navHeader = $(window.jQuerymainNav);
      var parent = $self.parentNode;
      var parentOffset = $(parent).offset();
      var targetOffset = parentOffset.top;
      var navStatus = $navHeader.css('position');
      var navHeight = $navHeader.outerHeight();
      if (navStatus === 'fixed' && $($self).hasClass(`${this.CSS_NSP}activeEl`)) {
        setTimeout(function () {
          $('html, body').animate({ scrollTop: targetOffset - (navHeight) }, { duration: 700 });
        }, 350);
      }
      el.preventDefault();
    }

    addEventListeners() {
      // Delegate events under the ".loadNode" namespace
      window.jQuery(document).on('click.loadNode', this.NODE_SELECTOR, this.onClickHandler.bind(this));
      window.jQuery(document).on('click', window.jQueryconditionToggle, this.conditionToggle.bind(this));

      $(window).on('changeViewport', (e, data) => {
        const { previousViewport } = data;
        const { currentViewport } = data;
        this.previousViewport = previousViewport;
        this.currentViewport = currentViewport;

        if (((this.currentViewport === 'xs' || this.currentViewport === 'sm') && (this.previousViewport === 'md' || this.previousViewport === 'lg'))
          || ((this.currentViewport === 'md' || this.currentViewport === 'lg') && (this.previousViewport === 'xs' || this.previousViewport === 'sm'))) {
          const $loadedBlock = window.jQuery(`.${this.LOADED_CLASS}`);
          this.Utils.Debug(false, '============ > loaded Blocks');
          this.Utils.Debug(false, $loadedBlock);
          $.each($loadedBlock, (i) => {
            const $currentItem = window.jQuery($loadedBlock[i]);
            this.Utils.Debug(false, $currentItem);
            this.setPostioningClass($currentItem);
          });
        }
      });
    }

    run() {
      this.Utils.Debug(false, 'BlockDetails: run');
      window.jQuerySELECTOR = window.jQuery(this.SELECTOR);
      this.addEventListeners();
      if (window.jQuerySELECTOR.length > 0) {
        // ReSharper disable once UnusedLocals
        const blockToggle = new this.Toggle({ // eslint-disable-line no-unused-vars
          BEM: this.BEM,
          SEL: this.TOGGLE_SELECTOR,
          CLOSER: this.CLOSER,
          TOGGLE_ANIM: 'slide',
          GROUP: true,
          GROUP_CONTAINER: this.TOGGLE_GROUP_CONTAINER,
          SELF_CLOSING: true
        });

        // ReSharper disable once UnusedLocals
        const miniBlockToggle = new this.Toggle({ // eslint-disable-line no-unused-vars
          BEM: this.BEM,
          SEL: this.TOGGLE_SELECTOR_MINI,
          CLOSER: this.CLOSER,
          TOGGLE_ANIM: 'slide',
          GROUP: true,
          GROUP_CONTAINER: this.TOGGLE_GROUP_CONTAINER_MINI,
          SELF_CLOSING: true
        });
      }
    }
  }

  return new BlockDetails();
}());