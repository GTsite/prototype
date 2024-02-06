/* eslint-disable no-underscore-dangle, no-undef */
/**
 * A helper class to repesent the colum sort state of the venue finder list rendering.
 */
export default class VenueFinderListSort {
  /**
   * Creates a new VenueFinderListSort instance.
   * @param {int} sortId: Id to be submitted to the server.
   * @param {bool} isSortable: Whether or not element is sortable.
   * @param {bool} isSortedBy: Whether or not the element is initially active.
   * @param {string} sortOrder: (Optional) The order of the initial sorting or null (default: null).
   */
  constructor(sortId, isSortable, isSortedBy, sortOrder) {
    const that = this;
    that.sortId = sortId;
    that.sortable = isSortable || false;
    that.isSortedby = isSortedBy || false;
    that.order = sortOrder !== undefined && typeof sortOrder === 'string' && sortOrder.length ? sortOrder : VenueFinderListSort.sortOrderNone();
  }
  /**
   * @returns{string}: The Sort order value for descending.
   */
  static sortOrderASC() {
    return 'asc';
  }
  /**
   * @returns{string}: The Sort order value for ascending.
   */
  static sortOrderDSC() {
    return 'dsc';
  }
  /**
   * @returns{null}: The Sort order value for notsort.
   */
  static sortOrderNone() {
    return null;
  }
  sort() {
    const that = this;
    if (!that.order || !that.order.length) that.order = VenueFinderListSort.sortOrderASC();
    else if (that.order === VenueFinderListSort.sortOrderASC()) that.order = VenueFinderListSort.sortOrderDSC();
    else that.order = VenueFinderListSort.sortOrderNone();
  }
}