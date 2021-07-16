/* global App */

'use strict';

App.prototype.LoadMore = (function () {
  /**
    * Javascript component for Load more button.
    * @extends App
    * */
  class LoadMore extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.JS_NSP = this.Utils.JsNsp;
      this.BEM = `${this.CSS_NSP}section`;
      this.SELECTOR = this.BEM + '__show-more-link';
      this.launch = this.run();
    }

    loadMoreContent(ev) {
      ev.preventDefault();
      const $current = this.$(ev.currentTarget);
      $($current).addClass('testClass');
      const nextPage = $current.attr('data-ajax-page');
      // check if form filter pane exists on page
      const $form = $('body').find('form#autogrid-form');
      $form.find('input#Page').val(nextPage);
      $.ajax({
        url: $form.attr('action'),
        type: $form.attr('method'),
        data: $form.serialize(),
        success: function (data) {
          const $nodes = $(data);
          const $container = $current.parent().parent();
          // we must remove the existing recently visited
          $container.find('.you-might-also-like.recent-visited').remove();

          // replace the new set of nodes with the 'load more' container
          $current.parent().replaceWith($nodes);
        },
        error: function () {
          // alert('error!');
        }
      });
    }

    addEventListeners() {
      this.$(document).on('click', '.' + this.SELECTOR, this.loadMoreContent.bind(this));
    }

    run() {
      this.Utils.Debug(false, 'LoadMore: run');
      this.addEventListeners();
    }
  }

  return new LoadMore();
}());
