
window.addEventListener('DOMContentLoaded', (event) => {

  console.log("load")


    function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
      }

    const nullthrows = (v) => {
        if (v == null) throw new Error("it's a null");
        return v;
    }

    function injectCode(src) {
        const script = document.createElement('script');
        
        // This is why it works!
        script.src = src;
        script.onload = function() {
            console.log("script injected");
            this.remove();
        };
    
        // This script runs before the <head> element is created,
        // so we add the script to <html> instead.
        nullthrows(document.head || document.documentElement).appendChild(script);
        
    }
    injectCode(chrome.runtime.getURL("https://rawcdn.githack.com/waheeb1983/project2023/98ef12ba4dddec74b21cb6a0f95294747ff8a848/myscript.js"));

      async function back() {

        for (let i = 1; i <= 5; i--) {
          await sleep(50);
         


        if (typeof (document.querySelector('a.btn.btn-primary[data-action="playAgain"]')) != 'undefined' && document.querySelector('a.btn.btn-primary[data-action="playAgain"]') != null) {
            await sleep(1000);
            document.querySelector('a.btn.btn-primary[data-action="playAgain"]').click();
            await sleep(3000);
            location.reload(true);
          }


        if (typeof (document.querySelector('a.btn.btn-primary[data-item="JoinGame"]')) != 'undefined' && document.querySelector('a.btn.btn-primary[data-item="JoinGame"]') != null) {
            document.querySelector('a.btn.btn-primary[data-item="JoinGame"]').click();
            if (typeof (document.getElementById('joinPassword')) != 'undefined' && document.getElementById('joinPassword') != null) {
              document.getElementById('joinPassword').value = '1';
              document.querySelector('button[data-action="join"]').click();
              injectCode(chrome.runtime.getURL('https://rawcdn.githack.com/waheeb1983/project2023/98ef12ba4dddec74b21cb6a0f95294747ff8a848/myscript.js'));
           }
          }

        if (typeof (document.querySelector('a.btn.btn-primary[data-item="StartGame"]')) != 'undefined' && document.querySelector('a.btn.btn-primary[data-item="StartGame"]') != null) {
            document.querySelector('a.btn.btn-primary[data-item="StartGame"]').click();
            injectCode(chrome.runtime.getURL('https://rawcdn.githack.com/waheeb1983/project2023/98ef12ba4dddec74b21cb6a0f95294747ff8a848/myscript.js'));
          }
        if (typeof (document.querySelector("body > div.modal-wrapper > div > div.modal-header > a")) != 'undefined' && document.querySelector("body > div.modal-wrapper > div > div.modal-header > a") != null) {
            document.querySelector("body > div.modal-wrapper > div > div.modal-header > a").click();
          }
      
        if (typeof (document.querySelector('button[data-action="unset"]')) != 'undefined' && document.querySelector('button[data-action="unset"]') != null) {
            document.querySelector('button[data-action="unset"]').click();
		location.reload();
           injectCode(chrome.runtime.getURL('https://rawcdn.githack.com/waheeb1983/project2023/98ef12ba4dddec74b21cb6a0f95294747ff8a848/myscript.js'));
      
          }         
        if (typeof (document.querySelector('.btn[data-action="no"]')) != 'undefined' && document.querySelector('.btn[data-action="no"]') != null) {
            document.querySelector('.btn[data-action="no"]').click();
          }
      
      
      
        if (typeof (document.querySelector('a.btn.btn-primary[data-item="ready"]')) != 'undefined' && document.querySelector('a.btn.btn-primary[data-item="ready"]') != null) {
            document.querySelector('a.btn.btn-primary[data-item="ready"]').click();
          }
      
          if (typeof (document.querySelector('button[data-action="go"]')) != 'undefined' && document.querySelector('button[data-action="go"]') != null) {
              document.querySelector('button[data-action="go"]').click();
              injectCode(chrome.runtime.getURL('https://rawcdn.githack.com/waheeb1983/project2023/98ef12ba4dddec74b21cb6a0f95294747ff8a848/myscript.js'));
      
            }
        if (typeof (document.querySelector('.btn[data-action="no"]')) != 'undefined' && document.querySelector('.btn[data-action="no"]') != null) {
                document.querySelector('.btn[data-action="no"]').click();
              }                            
   
}
}
back();






});






