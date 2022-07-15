class MiniShop {
    constructor(config) {
        this.config = {
            'triggerElementSelector': '[data-ms-action]',
            'cartBlockSelector': '[data-ms-cart]',
            'orderBlockSelector': '[data-ms-order]',
            'deliveryFieldSelector': '[name="delivery"]',
            'paymentFieldSelector': '[name="payment"]',
            'anotherFieldSelector': '[data-ms-field]',
            'actionUrl': '/assets/components/minishop2/action.php',
            'hideClass': 'd-none',
            'selectorPrefix': 'ms-'
        }
        this.events = {
            ms: {
                after_send: 'ms_after_send',
                before_send: 'ms_before_send',
            },
        };

        this.config = Object.assign(this.config, config);
        this.initialize();
    }

    initialize() {
        if (!this.cart) {
            this.cart = new msCart(this.config);
        }
        if (!this.order) {
            this.order = new msOrder(this.config);
        }
        this.addListener(this.config.triggerElementSelector);
    }

    send(params, url, method, headers) {
        method = method ? method : 'POST';
        headers = headers ? headers : {"X-Requested-With": "XMLHttpRequest"};
        url = url ? url : this.config.actionUrl;

        let data = {
            instance: this,
            params: params,
            callbacks: {
                errorHandlers: {
                    before: {},
                    after: {}
                },
                successHandlers: {
                    before: {},
                    after: {}
                }
            }
        };
        if (!this.fire(this.events.ms.before_send, data)) {
            if (data.callbacks.errorHandlers.before.length) {
                this.runCallbacks(data.callbacks.errorHandlers.before, data);
            }
            this.errorHandler(data);
            return false;
        }
        if (data.callbacks.successHandlers.before.length) {
            this.runCallbacks(data.callbacks.successHandlers.before, data);
        }

        let options = {
            method: method,
            headers: headers,
            body: data.params
        };

        fetch(url, options)
            .then(response => response.json())
            .then(result => this.responseHandler(result, data));
    }

    prepare(elem) {
        return new FormData(elem.closest('form'));
    }

    responseHandler(response, data) {
        if (data.params.get('ms_action')) {
            data.action = data.params.get('ms_action');
            data.response = response;
            if (!this.fire(this.events.ms.after_send, data) || !response.success) {
                if (data.callbacks.errorHandlers.after.length) {
                    this.runCallbacks(data.callbacks.errorHandlers.after, data);
                }
                if (data.instance.errorHandler) {
                    data.instance.errorHandler(data);
                } else {
                    this.errorHandler(data);
                }
            } else {
                if (data.callbacks.successHandlers.after.length) {
                    this.runCallbacks(data.callbacks.successHandlers.after, data);
                }
                if (data.instance.successHandler) {
                    data.instance.successHandler(data);
                } else {
                    this.successHandler(data);
                }
            }
        }
    }

    errorHandler(data) {
        console.log('Ошибка', data);
    }

    successHandler(data) {
        console.log('Успех', data);
    }

    fire(eventName, data) {
        data = data || {};
        let event = new CustomEvent(eventName, {bubbles: true, cancelable: true, composed: true, detail: data});
        if (!document.dispatchEvent(event)) {
            return false;
        }
        return true;
    }

    addListener(selector, scope, className, methodName) {
        scope = scope || document;
        let elements = scope.querySelectorAll(selector);
        if (elements) {
            elements.forEach(el => {
                let eventName = 'click';
                if (el.dataset.msAction) {
                    let msAction = el.dataset.msAction.split('/');
                    className = msAction[0];
                    methodName = msAction[1];
                }

                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.tagName) !== -1) {
                    eventName = 'change';
                }

                el.addEventListener(eventName, e => {
                    e.preventDefault();
                    this[className][methodName](this.prepare(el), el);
                });
            });
        }
    }

    runCallbacks(callbacks, data) {
        for (let f in callbacks) {
            callbacks[f](data);
        }
    }

}

class msCart extends MiniShop {
    initialize() {
        this.cart = this;
    }

    add(params, el) {
        // api/cart/product - POST
        params.append('ms_action', 'cart/add');
        params.append('ms2_action', 'cart/add');
        super.send(params);
    }

    change(params, el) {
        // api/cart/product - PUT
        params.append('ms_action', 'cart/change');
        params.append('ms2_action', 'cart/change');
        super.send(params);

    }

    remove(params, el) {
        // api/cart/product - DELETE
        params.append('ms_action', 'cart/remove');
        params.append('ms2_action', 'cart/remove');
        super.send(params);
    }

    clean(params, el) {
        // api/cart/products - DELETE
        params.append('ms_action', 'cart/clean');
        params.append('ms2_action', 'cart/clean');
        super.send(params);
    }

    status(params) {
        // api/cart/products - GET
        params.append('ms_action', 'cart/status');
        params.append('ms2_action', 'cart/status');
        super.send(params);
    }

    removeItem(key) {
        document.getElementById(key).remove();
    }

    successHandler(data) {
        let self = data.instance;
        if (data.params.get('key') && !data.response.data.total_count) {
            self.cart.removeItem(data.params.get('key'));
        }

        if (data.response.data.html) {
            let html = data.response.data.html;
            for (let key in html) {
                let target = document.querySelector('[data-' + this.config.selectorPrefix + key + ']');
                if (target) {
                    target.innerHTML = data.response.data.html[key];
                    self.addListener(self.config.triggerElementSelector, target);
                }
            }
        }
    }
}

class msOrder extends MiniShop {
    initialize() {
        this.params = new FormData();
        this.order = this;
        this.orderBlock = document.querySelector(this.config.orderBlockSelector);
        if (this.orderBlock) {
            //this.updateFields(this.params);
            this.addListener(this.config.anotherFieldSelector, this.orderBlock, 'order', 'add');
        }
        // TODO понять почему синхронно в заказе не меняются доставка и оплата
        this.add(this.params, this.orderBlock.querySelector(this.config.deliveryFieldSelector + ':checked'));
        this.updatePayments(this.params, this.orderBlock.querySelector(this.config.deliveryFieldSelector + ':checked'));
        this.addListener(this.config.deliveryFieldSelector, this.orderBlock, 'order', 'updatePayments');
    }

    updateFields(params) {
        let allFields = this.orderBlock.querySelectorAll(this.config.anotherFieldSelector);
        if (allFields.length) {
            allFields.forEach(el => {
                if (el.value && el.tagName !== 'BUTTON') {
                    switch (el.type) {
                        case 'checkbox':
                        case 'radio':
                            if (el.checked) {
                                this.add(this.params, el);
                            }
                            break;
                        default:
                            this.add(this.params, el);
                            break;
                    }
                }
            });
        }
        this.getrequired(params);
    }

    add(params, el) {
        // api/order/add - GET
        console.log(el.name, el.value);
        if(el.name && el.value){
            params.append('ms_action', 'order/add');
            params.append('ms2_action', 'order/add');
            params.append('key', el.name);
            params.append('value', el.value);
            super.send(params);
        }
    }

    getrequired(params) {
        // api/order/required - GET
        params.append('ms_action', 'order/getrequired');
        params.append('ms2_action', 'order/getrequired');
        super.send(params);
    }

    updatePayments(params, el) {
        if (el.checked) {
            let paymentFields = this.orderBlock.querySelectorAll(this.config.paymentFieldSelector),
                paymentAllow = el.dataset.payments;
            if (paymentFields) {
                paymentFields.forEach(el => {
                    paymentAllow.indexOf(el.value) === -1 ? el.disabled = true : el.disabled = false;
                });
                let curPayment = this.orderBlock.querySelector(this.config.paymentFieldSelector + ':checked');
                if(curPayment.disabled){
                    curPayment.checked = false;
                    paymentFields.forEach(el => {
                        if(el.disabled === false){
                            el.checked = true;
                            this.add(params,el);
                            return true;
                        }
                    });
                }
            }
            this.add(params, el);
        }
    }

    getcost() {
    }

    clean() {
    }

    submit() {
    }
}


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
    e.detail.params.append('test', 1);

});

const minishop = new MiniShop({});


