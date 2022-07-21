// [[+cssUrl]]web/lib/sweetalert2/sweetalert2.min.css
// [[+jsUrl]]web/lib/sweetalert2/sweetalert2.min.js

// [[+cssUrl]]web/lib/izitoast/iziToast.min.css
// [[+jsUrl]]web/lib/izitoast/iziToast.min.js

import msCart from "./modules/mscart.class.js";
import msOrder from "./modules/msorder.class.js";
import msNotify from "./modules/msnotify.class.js";
import msIziToast from "./modules/msizitoast.class.js";


document.addEventListener('ms_after_send', e => {
    if (e.detail.action == 'cart/add') {
        //blabla
    }
});

document.addEventListener('ms_before_send', e => {
    e.detail.callbacks.errorHandlers.before['testhandler'] = function (data) {
        data.test = 'bla-bla';
    }
    e.detail.callbacks.errorHandlers.before['testhandler2'] = function (data) {
        data.test = 'bla-bla-bla';
    }
    e.detail.params.set('test', 1);

});

const msizitoast = new msIziToast({});
const msnotify = new msNotify({});
const mscart = new msCart({});
const msorder = new msOrder({});
//mscart.notify = msnotify;
//msorder.notify = msnotify;

mscart.notify = msizitoast;
msorder.notify = msizitoast;



