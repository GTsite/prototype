'use strict';

App.prototype.WffmCheckbox = (function () {
  'use strict';

  //#region Utils and Constants
  const utils = {
    state: {
      boxes: null
    }
  };
  const CSSCLS = {
    CHECKED: 'gtc-checkbox--checked',
    VALID: 'valid',
    INVALID: 'invalid',
    FIELDVALIDAITON: {
      BASE: 'help-block',
      VALID: 'field-validation-valid',
      INVALID: 'field-validation-error'
    }
  };

  let wffmCheckBox;
  //#endregion
  //#region Privates
  /**
   * Toggles the validation messages for the given box if required.
   * @param {$.object} box The target box.
   * @param {bool} isChecked Whether or no the given box is checked.
   */
  function handleValidation(box, isChecked) {
    const input = box.children().eq(0);
    if (input.attr('data-val-ischecked-tracking')) {
      if (!isChecked) {
        input.removeClass(CSSCLS.VALID).addClass(CSSCLS.INVALID).attr('aria-invalid', true);
        box.next().removeClass(CSSCLS.FIELDVALIDAITON.VALID).addClass(CSSCLS.FIELDVALIDAITON.INVALID);
        if (!box.next().children().length) box.next().append($(`<span id="${input.attr('desribedby')}" class="">${input.data('val-ischecked')}</span>`));
      } else {
        input.addClass(CSSCLS.VALID).removeClass(CSSCLS.INVALID).attr('aria-invalid', false);
        box.next().html('');
      }
    }
  }
  /**
   * Adds the event handlers to the given elements.
   * @param {$.object} newBoxes checkboxes to add the event handlers for.
   */
  function addEventHandler(newBoxes) {
    newBoxes.on('click', function (e) {
      const target = $(e.currentTarget);
      if ($(e.target)[0].tagName.toLowerCase() === 'a') return true;
      target.toggleClass(CSSCLS.CHECKED);
      const isChecked = target.hasClass(CSSCLS.CHECKED);
      if (!isChecked) target.children('input[type="checkbox"]').removeAttr('checked').attr({ value: false, 'data-val': false });
      else target.children('input[type="checkbox"]').attr('checked', 'checked').attr({ value: true, 'data-val': true });
      handleValidation(target, isChecked);
      return false;
    });
  }
  /**
   * Adds new elements to the internal list of boxes.
   * @param {$.object} [form=null] Element to use as context. All elements will be used if null.
   */
  function addElements(form = null) {
    let newBoxes;
    if (form && form.length) newBoxes = $(`.${wffmCheckBox.BEM}`, form);
    else if (utils.state.boxes && utils.state.boxes.length) return;
    else newBoxes = $(`.${wffmCheckBox.BEM}`);
    if (newBoxes.length) {
      if (!utils.state.boxes) utils.state.boxes = newBoxes;
      else utils.state.boxes = $.merge([utils.state.boxes], [newBoxes]);
      addEventHandler(newBoxes);
    }
  }
  //#endregion
  //#region Publics
  /**
   * JavasScript component for handling the validationa and value changes for the WFFM StyledCheckBox Component.
   * @class WffmCheckboxValidation
   * @category Component
   * @extends App
   */
  class WffmCheckbox extends App {
    constructor() {
      super();
      const that = this;
      that.CSS_NSP = that.Utils.CssNsp;
      that.BEM = `${that.CSS_NSP}form-checkbox`;
      //launch prop
      that.launch = that.run();
    }
    /**
     * Post-load initialization option for this handler.
     * @param {$.object} forms The form elements to initilize the boxes for.
     */
    manualInit(forms) {
      if (forms && forms.length) addElements();
    }

    run() {
      window.setTimeout(() => addElements(), 250);
    }
  }
  //#endregion
  wffmCheckBox = new WffmCheckbox();
  return wffmCheckBox;
}());