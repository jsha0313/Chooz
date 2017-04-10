/*
  helper function to decode error message for
  login from Facebook, Google, and our login page

  @params object error
*/
var displayError = function(error) {
  var message = "An error has occurred. Please try again.";

    if ( error.hasOwnProperty('message') ) { 
      message = error.message;
    }

    return message;
}

var login = function () {
  console.log('login fn');
  var id = document.getElementById('log_id').value;
  var password = document.getElementById('log_password').value;
  console.log('log_id: ' + id);
  console.log('log_password: ' + password);

  // Sign in
  firebase.auth().signInWithEmailAndPassword(id, password)
    .then(function (user) {
      document.querySelector('#myNav').pushPage('location.html', { data: { title: 'Location' } });
    })
    .catch(function (error) {
      document.getElementById("error").innerHTML = displayError(error);
    });
};

var facebookLogin = function () {
  console.log('clicking facebook login');
  var provider = new firebase.auth.FacebookAuthProvider();

  firebase.auth().signInWithPopup(provider)
    .then(function (result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      document.querySelector('#myNav').pushPage('location.html', { data: { title: 'Location' } });
    }).catch(function (error) {
      document.getElementById("error").innerHTML = displayError(error);
    });
}

var googleLogin = function () {
  console.log('clicking google login');
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(function (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      document.querySelector('#myNav').pushPage('location.html', { data: { title: 'Location' } });
    }).catch(function (error) {
      document.getElementById("error").innerHTML = displayError(error);
    });
}

var anonLogin = function () {
  console.log('anonLogin fn');
  firebase.auth().signInAnonymously().catch(function (error) {
    console.log('errorCode: ' + errorCode);
    console.log('errorMessgae: ' + errorMessage);
    document.getElementById("error").innerHTML = displayError(error);
  });

};

var register = function () {
  console.log('register fn');
  var id = document.getElementById('reg_id').value;
  var password = document.getElementById('reg_password').value;
  var re_password = document.getElementById('reg_re_password').value;
  console.log('id: ' + id);
  console.log('password: ' + password);
  console.log('re_password: ' + re_password);

  var error_msg = document.getElementById('reg_error_msg');

  if (password == re_password) {
    const auth = firebase.auth();
    // Sign in
    const promise = auth.createUserWithEmailAndPassword(id, password);
    promise.catch(e => console.log(e.message));
    error_msg.color = "#badcef";
    console.log('promise done');

    document.querySelector('#myNav').pushPage('location.html', { data: { title: 'Location' } });
  } else {
    error_msg.color = "#ff0000";
  }
};
// var Location = function(){
//   console.log('location fn');
//   if(zipcode){
//   var locatinOn = false;
//   console.log('location Off');
// }else{
//   var locatinOn = true;
//   console.log('location On');
// }
// };

/*
  get zipcode, tip, and budget amount
  from user input, and do calculations
  based on determined sales tax
*/
var tipNbudget = function () {
  console.log('tip n budget function');
  // Location();

  var zipcode = document.getElementById('zipcode'); 
  var locationOff = document.body.contains(zipcode);
  var salesTax = 0;

  if (!locationOff) {
    console.log('user enabled location services');

    getZipcode( function (res) {
      /* 
        use a callback function so that
        this function does not go on until
        response returned
      */
      salesTax = getSalesTax(res.long_name);
    });
  } else {
    salesTax = getSalesTax(zipcode.value);
  }

  console.log('salestax', salesTax);
  // getZipcode( function(res) {
  //   console.log('inside callback');
  //   console.log(res);
  //     var tip = document.getElementById('tip').value;
  //     var budget = document.getElementById('budget').value;
  //     zipcode = res.long_name;
  // } );
};

/*
  helper function called in tipNbudget()
  to get sales tax based on zipcode

  @params - String zipcode
*/
var getSalesTax = function(zipcode) {
  console.log('get sales tax function');
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      var data = JSON.parse(this.responseText);
      console.log(data);
    }
  });

  var url = "/tax?zipcode=" + zipcode;

  xhr.open("GET", url);
  xhr.setRequestHeader("cache-control", "no-cache");  
  xhr.send();
}

/*
  helper function called in tipNbudget()
  to use reverse geolocation to get zipcode
  if user has enabled location services

  @params - function callback
*/
var getZipcode = function(callback) {
  var geocoder = new google.maps.Geocoder;

  if ( navigator.geolocation ) {
    navigator.geolocation.getCurrentPosition(function (position) {
      // console.log(position.address.postalCode);
      console.log(position);
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };      
      geocoder.geocode({'location': pos}, function(result, status) {
        if ( status === 'OK') {
          if ( result[0] ) {
            let postalCode = result[0].address_components.find(function (component) {
                return component.types[0] == "postal_code";
            });
            callback(postalCode);
          }
        }
      });
    });
  }
}

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

var map;
var venues = [];

var initMap = function (bool = false) {
  if (!bool) return;
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 12
  });
  map.setOptions({styles: [
      {
        featureType: 'poi.business',
        stylers: [{visibility: 'off'}]
      },
      {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{visibility: 'off'}]
      }
    ]});

  var infoWindow = new google.maps.InfoWindow({ map: map });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // infoWindow.setPosition(pos);
      // infoWindow.setContent('Location found.');
      map.setCenter(pos);
      updateFQ();
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  // Update Foursquare locations every time where is a change in the map bounds
  map.addListener('zoom_changed', function(e) {
    updateFQ();
  });
  map.addListener('drag_end', function(e) {
    updateFQ();
  });
};

var handleLocationError = function (browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
};

ons.ready(function () {
  console.log('ons.ready firing');
  // Onsen UI is now initialized
  //ons.notification.alert('Onsen ready');
  document.addEventListener('init', function (event) {
    var page = event.target;
    console.log('event listener added', page);

    if (page.id === 'login') {
      page.querySelector('#registerButton').onclick = function () {
        document.querySelector('#myNav').pushPage('register.html', { data: { title: 'Register' } });
      };
    } else if (page.id === 'register') {
      page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    }

    if (page.id === 'login') {
      page.querySelector('#anonLoginButton').onclick = function () {
        document.querySelector('#myNav').pushPage('location.html', { data: { title: 'Location' } });
      };
    }
    if (page.id === 'location') {
      page.querySelector('#allowLocationButton').onclick = function () {
        console.log('allow location button clicked');
        document.querySelector('#myNav').pushPage('tipNbudgetW/location.html', { data: { title: 'tipNbudget' } });
      };
      page.querySelector('#notAllowLocationButton').onclick = function () {
        document.querySelector('#myNav').pushPage('tipNbudgetW/Olocation.html', { data: { title: 'tipNbudget' } });
      };
    }
    if (page.id === 'tipNbudgetW/location' || page.id === 'tipNbudgetW/Olocation') {
      console.log('tip n budget');
      page.querySelector('#confirm').onclick = function() {
        document.querySelector('#myNav')
          .pushPage('search.html', { data: { title: 'search' } })
          .then(function () {
            initMap(true);
            tipNbudget();
          });
      }
    };
  });
});

function getQueryXhttp(type, venue_id) {
  var date = new Date();
  var dd = date.getDate();
  var mm = date.getMonth()+1; //January is 0
  var yyyy = date.getFullYear();
  if(dd<10){
      dd='0'+dd;
  } 
  if(mm<10){
      mm='0'+mm;
  } 
  var today = yyyy+mm+dd;
  var client_id = "VZP5RZFVTJRAPIASNSAEHBOBU12DK3WC4SQQNHZCAG3FAXT2";
  var client_secret = "XDVSW4E3LHM3NM31BYPOGNSW21MFDXF3BDPJ0YBSPGCGCVQX";
  var center = map.getCenter().toUrlValue(14);
  var sw_lat, sw_lon, ne_lat, ne_lon = 0.0;
  if (map.getBounds()) {
    sw_lat = map.getBounds().getSouthWest().lat();
    sw_lon = map.getBounds().getSouthWest().lng();
    ne_lat = map.getBounds().getNorthEast().lat();
    ne_lon = map.getBounds().getNorthEast().lng();
  } 
  var radius = getRadius(sw_lat, sw_lon, ne_lat, ne_lon);

  xhttp = new XMLHttpRequest();

  var query_link;
  if (type == 0) {
    query_link = "https://api.foursquare.com/v2/venues/explore"+
                    "?client_id="+client_id+"&client_secret="+client_secret+
                    "&ll="+center+
                    "&v="+today+
                    "&radius="+radius+
                    "&section=food"+
                    "&limit=10";
  } else if (type == 1) {
    query_link = "https://api.foursquare.com/v2/venues/"+venue_id+"/menu"+
                  "?client_id="+client_id+"&client_secret="+client_secret+
                  "&v="+today;
  }
  xhttp.open("GET", query_link, true);
  xhttp.send();

  return xhttp;
}

var updateFQ = function() {
  var explore_xhttp = getQueryXhttp(0);
  explore_xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var explore_response = JSON.parse(explore_xhttp.responseText).response;

          var venues = explore_response.groups[0].items;

          for (var i=0; i<venues.length; i++) {
            venues[i].setMap(null);
          }
          venues = [];
          for (var i=0; i<venues.length; i++) {
            var venue = 
            {
              marker: new google.maps.Marker({
                        position: {lat: venues[i].venue.location.lat, lng: venues[i].venue.location.lng},
                        map: map,
                        title: venues[i].venue.name,
                      }),
              id: venues[i].venue.id,
            }

            // infoWindow = new google.maps.InfoWindow({ map: map });

            venue.marker.addListener('click', function() {
              var menu_xhttp = getQueryXhttp(1, venue.id);
              menu_xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                  var menu_response = JSON.parse(menu_xhttp.responseText).response;
                  var menu_entries_array = menu_response.menu.menus.items[0].entries.items;
                  console.log(menu_entries_array);
                  venue[i].menu = menu_entries_array;
                }
              }
              // infoWindow.setPosition(marker.position);
              // infoWindow.setContent(marker.title);
              // infoWindow.open(map, marker);

              // TODO:
              // Add transition to menu detail page
              // parse menu_entries_array data

            });
            venues.push(marker);
          }
      }
  }
}

function getRadius(lat1, lon1, lat2, lon2) {
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return Math.round(d * 1000); // meters
}
// (function(){   

//   if(btnLogout){
//   btnLogout.addEventListener('click', e => {
//     firebase.auth().signOut();
//   });
//   }

//   firebase.auth().onAuthStateChanged(firebaseUser => {
//     if(firebaseUser){
//       console.log(firebaseUser);
//       btnLogout.classList.remove('hide');
//     }
//     else{
//       console.log('not logged in');
//       if(btnLogout){
//       btnLogout.classList.add('hide');
//       }
//     }
//   });
// });


