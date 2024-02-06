
App.prototype.HotelVenueStore = (function () {
  class HotelVenueStore extends App {
    constructor() {
      super();
      this.hotelResults = [];
      this.venueResults = [];
    }

    matchesVenueIsHotel(source) {
      return source.NumberOfHotelRooms > 0;
    }

    matchesHotel(source) {
      return this.hotelResults.length > 0 && this.hotelResults.some((hotelResult) => hotelResult.ItemId === source.ItemId);
    }

    matchesVenue(source) {
      return (
        this.venueResults.length > 0 &&
        this.venueResults.some(
          (venueResult) => venueResult.ItemId === source.ItemId
        ) &&
        source.NumberOfMeetingRooms > 0
      );
    }
  }

  return new HotelVenueStore();
}());
