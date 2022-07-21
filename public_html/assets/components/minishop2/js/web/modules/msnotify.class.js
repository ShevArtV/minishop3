export  default  class msNotify{
    constructor(config){
        // izitoast
        // sweetalert2
        // https://getuikit.com/docs/notification
        this.config = {
            'handlerClassName' : 'Swal',
            'handlerOptions': {
                position: 'top-end',
                icon: 'success',
                title: '',
                showConfirmButton: false,
                toast: true,
                timer: 1500
            },
        }
        this.config = Object.assign(this.config, config);
    }

    showMessage(type,msg){
        this[type+'Msg'](msg);
    }

    errorMsg(msg){
        if(window[this.config.handlerClassName]){
            let options = Object.assign(this.config.handlerOptions, {icon: 'error', title: msg});
            window[this.config.handlerClassName]['fire'](options);
        }

    }
    successMsg(msg){
        if(window[this.config.handlerClassName]){
            let options = Object.assign(this.config.handlerOptions, {title: msg});
            window[this.config.handlerClassName]['fire'](options);
        }
    }
}