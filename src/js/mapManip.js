var nhoodMap = nhoodMap || {};

(function(e) {
  'use strict';
  e.mapManip = e.mapManip || {};

  // Make these variables accessible from outside of initMap
  var map, infoWindow, overlay, bounds;

  // Create initial map
  e.mapManip.initMap = function() {

    map = new google.maps.Map(document.getElementById('map'), {
      center: nhoodMap.model.centerLocation,
      zoom: 14, // Not strictly required as map will be fitted to markers
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM,
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        mapTypeIds: [
          google.maps.MapTypeId.ROADMAP,
          // google.maps.MapTypeId.TERRAIN,
          google.maps.MapTypeId.SATELLITE
        ]
      }
    });

    // overlay to get pxl location
    overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap(map);

    // Just create a single infoWindow that will be shared by all markers
    infoWindow = new google.maps.InfoWindow({
      content: 'No data to display'
    });

    // Make infoWindow globally available to nhoodMap
    e.mapManip.infoWindow = infoWindow;

    // Create a LatLngBounds object that can be extended with the locations
    // of all Markers
    var bounds = new google.maps.LatLngBounds();
    var markerLatLng;

    // Create a marker for each place in the placeList
    nhoodMap.viewModel.ViewModel.placeList().forEach(function(place) {
      place.marker = new google.maps.Marker({
        position: place.location,
        map: map,
        animation: google.maps.Animation.DROP,
        title: place.name()
      });

      // When marker is clicked run a function to retrieve data
      place.marker.addListener('click', function() {
        e.mapManip.getData(place);
      });

      // Create LatLng object from place and get it extended.
      markerLatLng = new google.maps.LatLng(place.location.lat, place.location.lng);
      bounds.extend(markerLatLng);
    });

    // Fit the map to show all Markers
    map.fitBounds(bounds);
  };



  // Bounce the marker for a short period
  function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() { marker.setAnimation(null); }, 1400);
    }
  }

  // Shift the map so that Marker x and y pixel position
  // is a minimum of xmin and ymin
  function shiftMap(marker, xmin, ymin) {
    var proj = overlay.getProjection();
    var pos = marker.getPosition();
    var p = proj.fromLatLngToContainerPixel(pos);
    var xoffset = 0;
    var yoffset = 0;
    // Don't move if not necessary but do move if Marker
    // is not currently on displayed section of map
    if (p.x < xmin || p.x > $(document).width() || p.x < 0 ) { xoffset = p.x - xmin; }
    if (p.y < ymin || p.y > $(document).height() || p.y < 0) { yoffset = p.y - ymin; }
    if (xoffset !== 0 || yoffset !== 0) { map.panBy(xoffset, yoffset); }
  }
  // Retrieve data about Marker and display in InfoWindow
  // This function needs global visibility as it is called from viewModel too
  e.mapManip.getData = function(place) {
    var marker = place.marker;
    // Create a nhoodMap global variable to reference marker
    // that is currently associated with the infoWindow
    e.mapManip.infoWindowMarker = marker;
    if ( $(document).width() < 700 ) {
      // On narrow screens shift the map down so that top of InfoWindow is displayed
      shiftMap(marker, 0, 500);
    } else {
      // On wider screens shift the map right as well so InfoWindow is away from place list
      shiftMap(marker, 500, 500);
    }
    toggleBounce(marker);
    // Create initial content for InfoWindow and then open the InfoWindow for the Marker
    var formattedContent = '<div class="tt-main"></div>';
    infoWindow.setContent(formattedContent);
    infoWindow.open(map, marker);
    // are handled by the yelpSuccess and foursquareSuccess callback functions
    nhoodMap.model.foursquareRequest(place.name(), place.location, foursquareSuccess, requestFailed);
    displayInfoWindowLinks();
  };

  // Show/Hide the data from Foursquare
  function displayInfoWindowLinks() {
    var formattedContent = '<div class="tt-links"></div>';
    $(".tt-main").prepend(formattedContent);
    formattedContent += '<span class="tt-foursquare">Foursquare: </span>';
    formattedContent += '<span class="tt-foursquare-vis">hide</span>';
    $(".tt-links").append(formattedContent);
    $(".tt-foursquare-vis").on("click", function(e) {
      if (e.target.innerHTML === "show") {
        $(".tt-foursquare-data").show();
        e.target.innerHTML = "hide";
      } else {
        $(".tt-foursquare-data").hide();
        e.target.innerHTML = "show";
      }
    });
  }

  // Callback function to display Foursquare data in InfoWindow
  function foursquareSuccess(data) {
    var venue = data.response.venue;
    var content = {
      name: venue.name || e.mapManip.infoWindowMarker.title,
      phone: venue.contact.formattedPhone || "None",
      category: venue.categories[0].name || "None",
      imgUrl: venue.bestPhoto.prefix + '100x100' + venue.bestPhoto.suffix,
      address: venue.location.formattedAddress || "None"
    };
    var formattedContent = '<div class="tt-foursquare-data">';
    formattedContent += '<div class="tt-header">';
    formattedContent += '<h3 class="tt-header-h3">' + content.name + '</h3></div>';
    formattedContent += '<div class="tt-data"><div class="tt-picture"><img src="' + content.imgUrl + '" ';
    formattedContent += 'alt="Picture from foursquare"></div>';
    formattedContent += '<div class="tt-detail"><ul class="tt-detail-ul">';
    formattedContent += '<li class="tt-detail-li">Category: ' + content.category + '</li>';
    formattedContent += '<li class="tt-detail-li">Phone: ' + content.phone + '</li>';
    formattedContent += '<li class="tt-detail-li">Address: ' + content.address + '</li>';
    formattedContent += '</ul></div></div></div>';
    $(".tt-main").append(formattedContent);
  }

  // displaying error messages
  // if data can not be retrieved or Foursquare APIs
  function requestFailed(data) {
    var formattedContent;
    formattedContent = '<div class="tt-foursquare-data">';
    formattedContent += '<p>Failed to retrieve data from ' + data + '</p></div>';
    $(".tt-main").append(formattedContent);
  }

})(nhoodMap);
