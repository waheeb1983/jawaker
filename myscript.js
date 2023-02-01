console.log("myscript");
var simulateMouseEvent = function (element, eventName) {
    element.dispatchEvent(new MouseEvent(eventName, {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: 1,
      clientY: 1,
      button: 0
    }));
  };
  

 
  if (App.current_user.get("is_basha") == null){
  var Freebasha = encodeURIComponent(document.querySelectorAll('meta[name="csrf-token"]')[0].content)
  fetch("https://www.jawaker.com/en/basha_for_tokens", {
      "credentials": "include",
      "headers": {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Content-Type": "application/x-www-form-urlencoded",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-User": "?1"
      },
      "referrer": "https://www.jawaker.com/en/basha",
      "body": "authenticity_token="+Freebasha+"&duration=1",
      "method": "POST",
      "mode": "cors"
  });
  }
  
  
  
  
  
  function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
  
  
  async function fun() {
  
    for (let i = 1; i <= 5; i--) {
  
      await sleep(200);
  
  
  
      if (App.game.iHaveTurn() == true) {
  
  
        // ltooosh
  
       
          if (App.game.handName() == 'ltoosh') {
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[12] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[12], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[11] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[11], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[10] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[10], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[9] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[9], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[8] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[8], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[7] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[7], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[6] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[6], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[5] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[5], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[4] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[4], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[3] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[3], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[2] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[2], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[1] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[1], "click");
              await sleep(0);
  
  
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[0] instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelectorAll('.face')[0], "click");
              await sleep(0);
  
  
            }
  
          }
  
        
  
        // ltoosh end
  
  
  
  
  
  
        //diamond
  
        if (App.game.handName() == 'diamonds') {
  
          if (App.game.iHaveTurn() == true) {
  
  
            await sleep(0);
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-K.ui-draggable"), "click");
  
              await sleep(0);
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-Q.ui-draggable"), "click");
  
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-J.ui-draggable"), "click");
  
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-10.ui-draggable"), "click");
  
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-2.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            //diamonds end
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-2.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-2.ui-draggable") instanceof Object) {
              simulateMouseEvent
                (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-2.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
          }
        }
        // diamond end
  
  
  
  
  
        if (App.game.handName() == 'queens' || App.game.handName() == 'trix') {
          if (App.game.iHaveTurn() == true) {
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-2.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-2.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-2.ui-draggable") instanceof Object) {
              simulateMouseEvent
                (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-2.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
          }
        }
  
        // trix + queens end
  
  
        // king
  
  
  
  
  
        if (App.game.handName() == 'king') {
  
          if (App.game.iHaveTurn() == true) {
  
  
  
            await sleep(0);
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-2.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-2.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.heart-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            //no heart
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-Q.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-Q.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-6.ui-draggable"), "click");
              await sleep(0);
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-2.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.diamond-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-2.ui-draggable") instanceof Object) {
              simulateMouseEvent
                (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.club-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-K.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-K.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-J.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-J.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-10.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-10.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-9.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-9.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-8.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-8.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-7.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-7.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-6.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-6.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-5.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-5.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-4.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-4.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
  
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-3.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-3.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-2.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-2.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
            if (document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-A.ui-draggable") instanceof Object) {
              simulateMouseEvent(document.querySelector('.hand.card-stack.fanned.loose.rotate-bottom.ui-droppable').querySelector(".card.face-up.spade-A.ui-draggable"), "click");
              await sleep(0);
  
  
            }
            if (App.game.iHaveTurn() == false) {
              fun();
              return;
            }
  
          }
        }
        // kings end
  
  
  
  
      }
    }
  }
  
  
  
  
  
  
  
  
  fun();
  
  
