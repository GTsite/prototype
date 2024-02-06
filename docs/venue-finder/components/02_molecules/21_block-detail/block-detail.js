var GTC_INIT = window.GTC_INIT || {};
jQuery(function ($) {
  GTC_INIT.preventRightClick = {

    preventClick: function () {
      var parrentEl = $('a[href$="Calendar-CVB"]').parent();
      var blockDetail = $('.gtc-block-detail__wrapper');
      $(parrentEl).delegate(blockDetail, 'contextmenu', function () {
        return false;
      });
    }
  };

  GTC_INIT.preventRightClick.preventClick();
});
