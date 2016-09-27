var nhoodMap = nhoodMap || {};

(function(e) {
    'use strict';
    e.model = e.model || {};

    e.model.foursquareRequest = function (name, location, success, error) {
        var foursquareRequestTimeOut = setTimeout(function() { errorCb('Foursquare'); }, 4000);
        var url = 'https://api.foursquare.com/v2/venues/search';
        var loc = location.lat + ',' + location.lng;

        $.getJSON(url, {
            client_id: foursquareKeys.client_id,
            client_secret: foursquareKeys.client_secret,
            v: '20160301',
            m: 'foursquare',
            ll: loc,
            limit: 1,
            query: name
        }).done(function(data){
            var id = data.response.venues[0].id;
            var url = 'https://api.foursquare.com/v2/venues/' + id;
            $.getJSON(url, {
                client_id: foursquareKeys.client_id,
                client_secret: foursquareKeys.client_secret,
                v: '20160301',
                m: 'foursquare'
            }).done(function(data){
                success(data);
                clearTimeout(foursquareRequestTimeOut);
            }).fail(function(){
                errorCb('Foursquare');
                clearTimeout(foursquareRequestTimeOut);
            });
        }).fail(function(data){
            error('Foursquare');
            clearTimeout(foursquareRequestTimeOut);
        });
    };

    var foursquareKeys = {
        client_id: 'A4FLWYRNIEGAORPXIUNRFFCHR21X3R5IROQOI34E1GKHCGD3',
        client_secret: '0VE0WYKLKOCJ3QWMJD5X4I4ZV1ZWR0SPLJERF5BOSFKZ0K0Y'
    };

    e.model.googleMapsKey = 'AIzaSyBvqDEydjao3Nm4nOwOP92qGQ3Y0FM_tCc';

    e.model.city = 'Edinburgh';
    e.model.countryCode = 'GB';
    e.model.centerLocation = { lat: +55.95, lng: -3.21 };

    e.model.initialPlaces = [{
    name: 'Dean Gallery',
    location: { lat: +55.95187295, lng: -3.22418422 }
    }, {
    name: 'Edinburgh Castle',
    location: { lat: +55.9485947, lng: -3.1999135 }
    }, {
    name: 'Arthur Seat',
    location: { lat: +55.9440833, lng: -3.1618333 }
    }, {
    name: 'Gallery of Modern Art',
    location: { lat: +55.9509239, lng: -3.22784275 }
    }, {
    name: 'Scott Monument',
    location: { lat: +55.952381, lng: -3.1932741 }
    }, {
    name: 'Hibs Football Club',
    location: { lat: +55.961834, lng: -3.165275 }
    }, {
    name: 'Murrayfield Stadium',
    location: { lat: +55.942512, lng: -3.241160 }
    }, {
    name: 'Hearts Football Club',
    location: { lat: +55.939075, lng: -3.232234 }
    }, {
    name: 'National Museum of Scotland',
    location: { lat: +55.946831, lng: -3.190632 }
    }, {
    name: 'Holyrood Palace',
    location: { lat: +55.952581, lng: -3.171766 }
    }, {
    name: 'Waverley Station',
    location: { lat: +55.951788, lng: -3.190477 }
    }, {
    name: 'Dynamic Earth',
    location: { lat: +55.9505575, lng: -3.1744426 }
    }];

})(nhoodMap);