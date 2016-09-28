var nhoodMap = nhoodMap || {};

(function(e) {
    'use strict';
    e.viewModel = e.viewModel || {};

    // place structure
    var Place = function(data) {
        this.name = ko.observable(data.name);
        this.location = data.location;
        this.visible = ko.observable(true);
    };

    // definition of view Model
    var ViewModel = function(){
        var self = this;
        // success of google map request
        self.mapErrorVisible = ko.observable(false);
        self.mapErrorMsg = ko.observable();
        self.headerVisible = ko.observable(true);
        // function on Google API onerror condition
        // hide the header and disply msg
        self.mapError = function() {
            self.headerVisible(false);
            self.mapErrorVisible(true);
            self.mapErrorMsg("<p>Error loading the Google Maps API.<br>Please refresh or try again later.</p>");
        };

        // List view. Not visible to start with
        self.listVisible = ko.observable(false);

        // Populate an observable array with all the places defined in the model using knockout js
        self.placeList = ko.observableArray();
        nhoodMap.model.initialPlaces.forEach(function(place) {
          self.placeList.push(new Place(place));
        });

        // Sort array of places by place name
        self.placeList.sort(function(l, r) {
          return l.name().localeCompare(r.name());
        });

        // Function called when hamburger icon clicked
        self.toggleListVisible = function() {
            if ( self.listVisible() ) {
            self.listVisible(false);
            } else {
            self.listVisible(true);
            }
        };

        // Initialize text in filter input
        self.filterText = ko.observable('');

        // Function called whenever anything is typed into Filter field
        // Sets visibility of list items and map markers
        // Closes infoWindow if it's marker is removed
        self.filterPlaceList = function() {
          self.placeList().forEach(function(place) {
            // Make search case insensitive
            if (place.name().toLowerCase().search(self.filterText().toLowerCase()) > -1) {
              place.visible(true);
              place.marker.setVisible(true);
            } else {
              place.visible(false);
              place.marker.setVisible(false);
              // Check to see if the marker is currently associated with the infoWindow
              // Close the infoWindow if it is
              if (place.marker === nhoodMap.mapManip.infoWindowMarker) {
                nhoodMap.mapManip.infoWindow.close();
                nhoodMap.mapManip.infoWindowMarker = null;
              }
            }
          });
        };

        // Function called when a place name in the list is clicked
        // Results in data being displayed on map. Same as if the marker had been clicked
        self.selectPlace = function(clickedPlace) {
          nhoodMap.mapManip.getData(clickedPlace);
          // Remove the list on narrow displays so that it doesn't obstruct view of InfoWindow
          if ( $(document).width() < 700 ) {
            self.listVisible(false);
          }
        };
    };
    e.viewModel.ViewModel = new ViewModel();
    ko.applyBindings(e.viewModel.ViewModel);

})(nhoodMap);