/*
  helper function to decode error message for
  login from Facebook, Google, and our login page

  @params object error
*/
var displayError = function (error) {
  var message = "An error has occurred. Please try again.";

  if (error.hasOwnProperty('message')) {
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

    getZipcode(function (res) {
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
var getSalesTax = function (zipcode) {
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
var getZipcode = function (callback) {
  var geocoder = new google.maps.Geocoder;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      // console.log(position.address.postalCode);
      console.log(position);
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      geocoder.geocode({ 'location': pos }, function (result, status) {
        if (status === 'OK') {
          if (result[0]) {
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
var venue_dict = {};
var menu_dict = {};

var initMap = function (bool = false) {
  if (!bool) return;
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 15
  });
  map.setOptions({
    styles: [
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      }
    ]
  });

  var infoWindow = new google.maps.InfoWindow({ map: map });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    console.log("geolocation");
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log(pos.lat + " " + pos.lng);

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
  map.addListener('zoom_changed', function (e) {
    updateFQ();
  });
  map.addListener('drag_end', function (e) {
    updateFQ();
  });
};

var handleLocationError = function (browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
};

function menulist(title, id) {
  if (venue_dict[id] === undefined) {
    var menu_xhttp = getQueryXhttp(1, id);
    menu_xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var menu_response = JSON.parse(menu_xhttp.responseText).response;
        // console.log(menu_response);
        if (menu_response.menu.menus.count != 0) {
          var menu_entries_array = menu_response.menu.menus.items[0].entries.items;
          var menu_entries_dict = {};
          for (var i = 0; i < menu_entries_array.length; i++) {
            var menu_entries = menu_entries_array[i];
            menu_entries_dict[menu_entries.name] = menu_entries.entries.items;
          }
          venue_dict[id] = menu_entries_dict;

          populateList(title, id);
        }
      }
    }
  } else {
    populateList(title, id);
  }
};

function populateList(title, id) {
  // Populate the list with menu items
  document.getElementById('list-title').innerHTML = title;
  var menuList = document.getElementById('menu-list');

  for (var menu_type in venue_dict[id]) {
    var menu_header = document.createElement('ons-list-header');
    menu_header.innerText = menu_type;

    menuList.appendChild(menu_header);

    // console.log(venue_dict[id][menu_type]);

    for (var i = 0; i < venue_dict[id][menu_type].length; i++) {

      var menu = venue_dict[id][menu_type][i];
      var form = document.createElement("form");
      var label = document.createElement("label");
      label.appendChild(document.createTextNode(menu.name));
      var menu_item = document.createElement('ons-list');
      menu_item.id = menulist
      menu_item.innerText = menu.name;
      var button;
      button = document.createElement("ons-button");
      button.id = menu.price
      button.addEventListener('click', function () {
        // console.log("price: "+target[i].id);
        // alert(button[i].id);
        var price = [];
        price = document.getElementsByTagName("ons-button");
        var i;
        for (i = 0; i < price.length; i++) {
          console.log(price[i].id);
          console.log(price[i]);
          price[i].onclick = function () {
            alert(price[i].id);
          };
          // if (price[i].checked) {
          //   console.log("length: " + price[i]);
          //   alert(price[i]);
          // }
        }

        document
          .getElementById('popover')
          .show(this);
      }, false);
      // button[i].addEventListener('click', showPopover(this), false);
      // button.document.addEventListener("onclick", "fromTemplate()");
      button.className = "detail"
      button.style = "{position: absolute, right: 0px}";
      button.appendChild(document.createTextNode("DETAIL"));
      var checkbox = document.createElement('input');
      checkbox.appendChild(document.createTextNode(menu.name));
      checkbox.type = "checkbox";
      checkbox.className = "menuitem";
      // checkbox.id = menu.name;
      var menus = [menu.name, menu.price]
      checkbox.id = menus;
      form.appendChild(checkbox);
      form.appendChild(label);
      form.appendChild(button);
      menuList.appendChild(form);

      // FIXME:
      // menu price can be called with "menu.price"
      // menu description can be called with "menu.description"

    }
  }
}

function chooz() {
  console.log("chooz");
  var menu = [];
  menu = document.getElementsByClassName("menuitem");

  var menuList = document.getElementById('items');
  var div1 = document.createElement("div");
  var div2 = document.createElement("div");
  var i;
  for (i = 0; i < menu.length; i++) {
    if (menu[i].checked) {
      var menus = menu[i].id
      var res = menus.replace(",", ": ");
      console.log("menus: " + menus);
      console.log(menus[0] + " " + menus[1]);
      // var menuname = menu[i].id;
      // var price = menu[i].id[1];
      div1.appendChild(document.createTextNode(res));
      // div2.appendChild(document.createTextNode(price));
      // item.appendChild(div1);
      // item.appendChild(div2);
      div1.appendChild(document.createElement("br"));
      menuList.appendChild(div1);
      // menuList.appendChild(document.createElement("br"));
      // document.getElementById("items").innerHTML = menus;
    }
  }

}

var showPopover = function (target) {
  // var price=[];
  var price = document.getElementsByClassName("detail");
  console.log("length: " + price.length);
  document
    .getElementById('popover')
    .show(target);
};
var hidePopover = function () {
  document
    .getElementById('popover')
    .hide();
};
var showDialog = function (id) {
  document
    .getElementById(id)
    .show();
};
var fromTemplate = function () {
  console.log("fromtemplate");
  var dialog = document.getElementById('dialog-3');

  if (dialog) {
    dialog.show();
  }
  else {
    ons.createDialog('receipt.html')
      .then(function (dialog) {
        dialog.show();
      });
  }
};
var hideDialog = function (id) {
  document
    .getElementById(id)
    .hide();
};

function showModal() {
  var modal = document.querySelector('ons-modal');
  modal.show();
  setTimeout(function () {
    modal.hide();
  }, 2000);
}
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
      page.querySelector('#confirm').onclick = function () {
        document.querySelector('#myNav')
          .pushPage('search.html', { data: { title: 'search' } })
          .then(function () {
            initMap(true);
            tipNbudget();
          });
      }
    };
    if (page.id === 'search') {
      page.querySelector('#settingButton').onclick = function () {
        document.querySelector('#myNav').pushPage('setting.html', { data: { title: 'Setting' } })
          .then(function () {
            setting();
          });
      };
    }
    if (page.id === 'menulist') {
      page.querySelector('#settingButton').onclick = function () {
        document.querySelector('#myNav').pushPage('setting.html', { data: { title: 'Setting' } })
          .then(function () {
            setting();
          });
      };
    }
    if (page.id === 'menulist') {
      page.querySelector('#choozButton').onclick = function () {
        document.querySelector('#myNav').pushPage('ordersummary.html', { data: { title: 'OrderSummary' } })
          .then(function () {
            chooz();
          });
      };
    }
  });
});

function getQueryXhttp(type, venue_id) {
  var date = new Date();
  var dd = date.getDate();
  var mm = date.getMonth() + 1; //January is 0
  var yyyy = date.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  var today = yyyy + mm + dd;
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
    query_link = "https://api.foursquare.com/v2/venues/explore" +
      "?client_id=" + client_id + "&client_secret=" + client_secret +
      "&ll=" + center +
      "&v=" + today +
      "&radius=" + radius +
      "&section=food" +
      "&limit=10";
  } else if (type == 1) {
    query_link = "https://api.foursquare.com/v2/venues/" + venue_id + "/menu" +
      "?client_id=" + client_id + "&client_secret=" + client_secret +
      "&v=" + today;
  }
  xhttp.open("GET", query_link, true);
  xhttp.send();

  return xhttp;
}

var updateFQ = function () {
  var explore_xhttp = getQueryXhttp(0);
  explore_xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var explore_response = JSON.parse(explore_xhttp.responseText).response;

      var items = explore_response.groups[0].items;

      for (var i = 0; i < venues.length; i++) {
        venues[i].marker.setMap(null);
      }

      venues = [];
      for (var i = 0; i < items.length; i++) {
        var venue =
          {
            marker: new google.maps.Marker({
              position: { lat: items[i].venue.location.lat, lng: items[i].venue.location.lng },
              // position: items[i].geometry.location,
              map: map,
              title: items[i].venue.name,
              icon: {
                url: 'https://developers.google.com/maps/documentation/javascript/images/circle.png',
                anchor: new google.maps.Point(10, 10),
                scaledSize: new google.maps.Size(10, 17)
              },
              store_id: items[i].venue.id
            }),
            id: items[i].venue.id,
          }
        console.log(venue.marker.title + ": " + venue.id);
        venues.push(venue);

        infoWindow = new google.maps.InfoWindow({ map: map });
        venue.marker.addListener('click', function () {

          var div = document.createElement("DIV");
          var s = document.createElement("STRONG");
          s.innerHTML = this.title;
          var br = document.createElement("BR");
          var id = document.createElement("P");
          id.id = "venueId";
          id.innerHTML = this.store_id;
          var button = document.createElement("BUTTON");
          button.type = "button";
          var button_text = document.createTextNode("Click me");

          div.appendChild(s);
          div.appendChild(br);
          button.appendChild(button_text);
          div.appendChild(button);
          div.appendChild(id);

          div.addEventListener('click', function (div) {
            return function () {
              console.log(this);
              openMenuList(div.childNodes[0].innerHTML, div.childNodes[div.childNodes.length - 1].innerHTML);

            }
          }(div));

          infoWindow.setContent(div);
          infoWindow.open(map, this);
        });

        venues.push(venue);
      }
    }
  }
};

function openMenuList(title, id) {
  document.querySelector('#myNav').pushPage('menulist.html', { data: { title: 'Menulist' } })
    .then(function () {
      menulist(title, id);
    });
}

function getRadius(lat1, lon1, lat2, lon2) {
  var R = 6378.137; // Radius of earth in KM
  var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
  var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
