/* eslint-disable no-underscore-dangle, no-undef */

const VenueFinderListSort = require('../36_venue-finder_utils/00_venue-finder-list-class-1').default;
const VenueFinderListUnit = require('../36_venue-finder_utils/00_venue-finder-list-class-2').default;

/**
 * A helper class to repesent a column definition of the venue finder list rendering.
 */
export default class VenueFinderListCol {
  /**
   * Creates a new instance of the <c>VenueFinderListCol</c>
   * @param {string} title: Column title value text.
   * @param {string} desc: Column dscription text.
   * @param {string} accessor: Value accessor for the values of this element.
   * @param {Object<VenueFinderListSort>} sort: Sort settings.
   * @param {int} index: Index of this column.
   * @param {string} className: Classname to be aded.
   * @param {int<VenueFinderListCol.types()>} type: Type of the column.
   */
  constructor(title, desc, accessor, sort, index, className, type) {
    const that = this;
    that.class = className;
    that.title = title;
    that.desc = desc;
    that.accessor = accessor;
    that.idx = index;
    that.type = type;
    that.unit = null;
    that.sort = new VenueFinderListSort(sort.sortId, sort.sortable || false, sort.isSortedby || false, sort.order || null);
  }
  /**
   * Sets the unit value.
   * @param {Object<VenueFinderListUnit>} value: Unit to be set.
   */
  set unit(value) {
    const that = this;
    if (value !== null && value !== undefined && !isNaN(value.type) &&
      value.type >= VenueFinderListUnit.types().NONE &&
      value.type <= VenueFinderListUnit.types().SQFEET) that._unit = new VenueFinderListUnit(value.type, value.symbol);
    else that._unit = new VenueFinderListUnit(VenueFinderListUnit.types().NONE, '');
  }
  /**
   * @returns {int}: The unit type of this element.
   */
  get unit() {
    return this._unit;
  }
  /**
   * The data types of inidividual columns cells specify the rendering type.
   * @returns {Object<int>}: Returns the static list of types available to the column rendering.
   */
  static types() {
    return {
      NONE: -1,
      IMAGE: 0,
      TEXT: 10,
      TEXTMULTI: 11,
      NUMBER: 20,
      NUMBERUNIT: 21,
      CHECKBOX: 100,
      /**
       *  @description special case of type Textmulti ==> if item is not a hotel, this field will render the default 11 values.
       */
      TEXTMULTIISSVG: 111
    };
  }
}
