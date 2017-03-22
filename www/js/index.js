ons.ready(function() {
  // Onsen UI is now initialized
  ons.notification.alert('Onsen ready');
    
    
    
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
   
});