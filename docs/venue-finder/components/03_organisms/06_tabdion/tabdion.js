/* global App */

'use strict';

App.prototype.Tabdion = (function () {
  class Tabdion extends App {
    constructor() {
      super();
      this.CSS_NSP = this.Utils.CssNsp;
      this.BEM = `${this.CSS_NSP}tabdion`;
      this.TABDION_TABS_TOGGLE = `${this.BEM}__tabs-toggle`;
      this.TABDION_TABS_TOGGLE_FIRST = `${this.TABDION_TABS_TOGGLE}--first`;
      this.TABDION_TABS_PANE = `${this.BEM}__tabs-pane`;
      this.TABDION_TABS_PANE_FIRST = `${this.TABDION_TABS_PANE}--first`;
      this.TABDION_ACCORDION_TOGGLE = `${this.BEM}__accordion-toggle`;
      this.TABDION_ACCORDION_EXCLUDE_ITEM = `${this.CSS_NSP}accordion__group-exclude-item`;
      this.FORCE_VP_CHANGE = false;
      this.launch = this.run();
    }

    activateTabsMobile() {
      this.Utils.Debug(false, 'Tabdion: activateTabsMobile');
      const $item = this.$(`.${this.TABDION_TABS_TOGGLE}`);

      $.each($item, (i) => {
        const $thisItem = this.$($item[i]);
        this.Utils.setAriaAttributeValue($thisItem[0], this.Utils.AriaTriggerTabAttribute, 'true');
        this.Utils.Target = $thisItem;
        const tabsPane = document.getElementById(this.Utils.Target);
        this.Utils.setAriaAttributeValue(tabsPane, 'aria-hidden', 'false');
      });
    }

    activateAccordionItemsMobile() {
      this.Utils.Debug(false, 'Tabdion: activateAccordionItemsMobile');
      const $item = this.$(`.${this.BEM}`).find(`.${this.TABDION_ACCORDION_TOGGLE}`);

      $.each($item, (i) => {
        const $thisItem = this.$($item[i]);
        this.Utils.Target = $thisItem;
        const thisItemTarget = document.getElementById(this.Utils.Target);
        const $thisParentPanel = $thisItem.parents(`.${this.TABDION_TABS_PANE}`);
        const hidden = $thisParentPanel.attr('aria-hidden');
        const firstPane = $thisParentPanel.hasClass(this.TABDION_TABS_PANE_FIRST);

        if (hidden === 'true' && !firstPane) {
          this.Utils.setAriaAttributeValue($thisItem[0], this.Utils.AriaTriggerAccordionAttribute, 'false');
          this.Utils.setAriaAttributeValue(thisItemTarget, 'aria-hidden', 'true');
        } else if (hidden === 'true' && firstPane) {
          this.Utils.setAriaAttributeValue($thisItem[0], this.Utils.AriaTriggerAccordionAttribute, 'true');
          this.Utils.setAriaAttributeValue(thisItemTarget, 'aria-hidden', 'false');
        }
      });
    }

    deactivateFirstAccordionItemMobile() {
      this.Utils.Debug(false, 'Tabdion: deactivateFirstAccordionItemMobile');
      const $firstAccordionToggle = this.$(`.${this.TABDION_TABS_PANE_FIRST}`).find(`.${this.TABDION_ACCORDION_TOGGLE}`);
      this.Utils.Debug(false, this.$(`.${this.TABDION_TABS_PANE_FIRST}`));
      this.Utils.Debug(false, $firstAccordionToggle);
      $firstAccordionToggle.addClass(this.TABDION_ACCORDION_EXCLUDE_ITEM);
    }

    activateTabsDesktop() {
      this.Utils.Debug(false, 'Tabdion: activateTabsDesktop');
      const $item = this.$(`.${this.TABDION_TABS_TOGGLE}`);
      const $toggleFirst = this.$(`.${this.TABDION_TABS_TOGGLE_FIRST}`);
      const $paneFirst = this.$(`.${this.TABDION_TABS_PANE_FIRST}`);
      let expandedCount = 0;

      $.each($item, (i) => {
        const $thisItem = this.$($item[i]);
        this.Utils.Target = $thisItem;
        const thisItemTarget = document.getElementById(this.Utils.Target);
        const $thisInsideAccordionToggle = this.$(thisItemTarget).find(`.${this.TABDION_ACCORDION_TOGGLE}`);
        const expanded = $thisInsideAccordionToggle.attr(this.Utils.AriaTriggerAccordionAttribute);

        if (expanded === 'true') {
          this.Utils.setAriaAttributeValue($thisItem[0], this.Utils.AriaTriggerTabAttribute, 'true');
          this.Utils.setAriaAttributeValue(this.$(thisItemTarget)[0], 'aria-hidden', 'false');
          expandedCount += 1;
        } else {
          this.Utils.setAriaAttributeValue($thisItem[0], this.Utils.AriaTriggerTabAttribute, 'false');
          this.Utils.setAriaAttributeValue(this.$(thisItemTarget)[0], 'aria-hidden', 'true');
        }
      });

      if (expandedCount > 1) {
        this.Utils.Debug(false, 'Tabdion: activateTabsDesktop : more than one expanded');
        this.Utils.setAriaAttributeValue($paneFirst[0], 'aria-hidden', 'true');
        this.Utils.setAriaAttributeValue($toggleFirst[0], this.Utils.AriaTriggerTabAttribute, 'false');
      }
    }

    activateAccordionItemsDesktop() {
      this.Utils.Debug(false, 'Tabdion: activateAccordionItemsDesktop');
      const $item = this.$(`.${this.BEM}`).find(`.${this.TABDION_ACCORDION_TOGGLE}`);

      $.each($item, (i) => {
        const $thisItem = this.$($item[i]);
        this.Utils.setAriaAttributeValue($thisItem[0], this.Utils.AriaTriggerAccordionAttribute, 'true');
        this.Utils.Target = $thisItem;
        const tabsPane = document.getElementById(this.Utils.Target);
        this.Utils.setAriaAttributeValue(tabsPane, 'aria-hidden', 'false');
      });
    }

    run() {
      this.Utils.Debug(false, 'Tabdion: run');

      $(document).on('block-details-loaded', () => {
        this.Utils.Debug(false, 'block-details-loaded');
        this.FORCE_VP_CHANGE = true;
      });

      $(window).on('changeViewport', (e, data) => {
        const { previousViewport } = data;
        const { currentViewport } = data;
        this.Utils.Debug(false, this.FORCE_VP_CHANGE);

        if (currentViewport === 'xs' || currentViewport === 'sm') {
          this.Utils.Debug(false, 'check vp');
          if ((previousViewport !== 'xs' && previousViewport !== 'sm') || this.FORCE_VP_CHANGE) {
            this.deactivateFirstAccordionItemMobile();
            this.activateAccordionItemsMobile();
            this.activateTabsMobile();
            this.FORCE_VP_CHANGE = false;
          }
        }

        if (currentViewport === 'md' || currentViewport === 'lg') {
          if (previousViewport === 'xs' || previousViewport === 'sm') {
            this.activateTabsDesktop();
            this.activateAccordionItemsDesktop();
          }
        }
      });
    }
  }

  return new Tabdion();
}());
