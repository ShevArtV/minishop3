export default class msIziToast {
    constructor(config) {
        this.config = {
            'handlerClassName': 'iziToast',
            'handlerOptions': {
                timeout: 1500
            },
        }
        this.config = Object.assign(this.config, config);
    }

    showMessage(type, msg) {
        if (window[this.config.handlerClassName]) {
            const options = Object.assign(this.config.handlerOptions, {title: msg});
            window[this.config.handlerClassName][type](options);
        }
    }

    errorMsg(msg) {
        if (window[this.config.handlerClassName]) {
            const options = Object.assign(this.config.handlerOptions, {title: msg});
            window[this.config.handlerClassName]['error'](options);
        }

    }

    successMsg(msg) {
        if (window[this.config.handlerClassName]) {
            const options = Object.assign(this.config.handlerOptions, {title: msg});
            window[this.config.handlerClassName]['fire'](options);
        }
    }
}