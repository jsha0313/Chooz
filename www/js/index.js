// ons.ready
(function() {
  // Onsen UI is now initialized
  //ons.notification.alert('Onsen ready');
    
    
  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyAD7m5lD3fCCz61cJY6McEyp3tv8WdL3Gg",
    authDomain: "chooz-758d8.firebaseapp.com",
    databaseURL: "https://chooz-758d8.firebaseio.com",
    storageBucket: "chooz-758d8.appspot.com",
    messagingSenderId: "228306966167"
  };
  firebase.initializeApp(config);

  // Get elements
  const txtEmail = document.getElementById('email');
  // const txtEmail = 'jsha0313@gmail.com';
  console.log(txtEmail);
  const txtPassword = document.getElementById('password');
  const btnLogin = document.getElementById('btnLogin');
  const btnSignUp = document.getElementById("btnSignUp");
  const btnGuest = document.getElementById('btnGuest');
  const btnLogout = document.getElementById('btnLogout');
  // if(btnSignUp){
  //   console.log('btnSignUp');
  // }
   

  // Add login event
  if(btnLogin){
    btnLogin.addEventListener('click', e => {
    // Get email and pass
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    // Sign in
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
  });
  }
  
  if(btnSignUp){  
  btnSignUp.addEventListener('click', e=> {
    // Get email and pass
    // TODO: CHECK 4 REAL EMAIL
    console.log('signup');
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();
    // Sign in
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
  });
  }
  
  if(btnLogout){
  btnLogout.addEventListener('click', e => {
    firebase.auth().signOut();
  });
  }
  
  if(btnGuest){
  btnGuest.addEventListener('click', e=>{
    firebase.auth().signInAnonymously();
  });
  }
  
  // Add a realtime listener
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser){
      console.log(firebaseUser);
      btnLogout.classList.remove('hide');
    }
    else{
      console.log('not logged in');
      if(btnLogout){
      btnLogout.classList.add('hide');
      }
    }
  });
    
    // document.addEventListener('init', function(event) {
    //   var page = event.target;

    //   if (page.id === 'login') {
    //     page.querySelector('#registerButton').onclick = function() {
    //       document.querySelector('#myNav').pushPage('register.html', {data: {title: 'Register'}});
    //     };
    //   } else if (page.id === 'register') {
    //     page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    //   }
    // });
   
}());