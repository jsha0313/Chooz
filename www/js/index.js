var login = function() {
  console.log('login fn');
  var id = document.getElementById('log_id').value;
  var password = document.getElementById('log_password').value;
  console.log('log_id: '+id);
  console.log('log_password: '+password);
  const auth = firebase.auth();
  // Sign in
  const promise = auth.signInWithEmailAndPassword(id, password);
  promise.catch(e => console.log(e.message));
  console.log('promise done');
};

var anonLogin = function() {
  console.log('anonLogin fn');
  firebase.auth().signInAnonymously();
  console.log('anonLogged in success');
};

var register = function() {
  console.log('register fn');
  var id = document.getElementById('reg_id').value;
  var password = document.getElementById('reg_password').value;
  console.log('id: '+id);
  console.log('password: '+password);
  const auth = firebase.auth();
  // Sign in
  const promise = auth.createUserWithEmailAndPassword(id, password);
  promise.catch(e => console.log(e.message));
  console.log('promise done');
};

ons.ready(function() {
  // Onsen UI is now initialized
  //ons.notification.alert('Onsen ready');
    document.addEventListener('init', function(event) {
      var page = event.target;
      
      if (page.id === 'login') {
        page.querySelector('#registerButton').onclick = function() {
          document.querySelector('#myNav').pushPage('register.html', {data: {title: 'Register'}});
        };
      } else if (page.id === 'register') {
        page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
      }
    });
   
}());

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
