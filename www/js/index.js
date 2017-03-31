var login = function () {
  console.log('login fn');
  var id = document.getElementById('log_id').value;
  var password = document.getElementById('log_password').value;
  console.log('log_id: ' + id);
  console.log('log_password: ' + password);

  // Sign in
  firebase.auth().signInWithEmailAndPassword(id, password)
    .then(function (user) {
      console.log('got user', user);
    })
    .catch(function (error) {
      console.log(error);
    });
};

var facebookLogin = function () {
  console.log('clicking facebook login');
  var provider = new firebase.auth.FacebookAuthProvider();

  firebase.auth().signInWithPopup(provider)
    .then(function (result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      console.log(token);
      // The signed-in user info.
      var user = result.user;
      console.log(user);
    }).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
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
      console.log(token);
      console.log(user);
      // ...
    }).catch(function (error) {
      console.log(error);
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
}

var anonLogin = function () {
  console.log('anonLogin fn');
  firebase.auth().signInAnonymously().catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log('errorCode: ' + errorCode);
    console.log('errorMessgae: ' + errorMessage);
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

var tipNbudget = function () {
  // Location();
  var zipcode = document.getElementById('zipcode').value;
  if (typeof (zipcode) == 'undefined') {
    console.log('undefined zipcode');
    zipcode = '63130'; // TO FIX: USE GOOGLE API TO ADJUST TO CURRENT LOCATION
  }
  var tip = document.getElementById('tip').value;
  var budget = document.getElementById('budget').value;
  console.log('zipcode: ' + zipcode);
  console.log('tip: ' + tip);
  console.log('budget: ' + budget);


};


// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

var initMap = function () {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 6
  });
  var infoWindow = new google.maps.InfoWindow({ map: map });

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
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
    console.log('event listener added');
    var page = event.target;

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
        document.querySelector('#myNav').pushPage('tipNbudgetW/location.html', { data: { title: 'tipNbudget' } });
      };
      page.querySelector('#notAllowLocationButton').onclick = function () {
        document.querySelector('#myNav').pushPage('tipNbudgetW/Olocation.html', { data: { title: 'tipNbudget' } });
      };
    }
    if (page.id === 'tipNbudgetW/location' || page.id === 'tipNbudgetW/Olocation') {
      document.querySelector('#myNav').pushPage('search.html', { data: { title: 'search' } });
    };
  });
});

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