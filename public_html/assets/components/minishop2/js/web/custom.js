class MiniShop {
    constructor(config) {
        this.config = {
            'triggerElementSelector': '[data-ms-action]',
            'cartBlockSelector': '[data-ms-cart]',
            'orderBlockSelector': '[data-ms-order]',
            'deliveryFieldSelector': '[name="delivery"]',
            'paymentFieldSelector': '[name="payment"]',
            'anotherFieldSelector': '[data-ms-field]',
            'cartCostSelector': '[data-ms-cart-cost]',
            'deliveryCostSelector': '[data-ms-delivery-cost]',
            'orderCostSelector': '[data-ms-order-cost]',
            'discountCostSelector': '[data-ms-dicrount-cost]',
            'actionUrl': '/assets/components/minishop2/action.php',
            'hideClass': 'd-none',
            'errorClass': 'ms-error',
            'requireClass': 'ms-required',
            'inputParentSelector': '.ms-input-parent',
            'selectorPrefix': 'ms-'
        }
        this.events = {
            ms: {
                after_send: 'ms_after_send',
                before_send: 'ms_before_send',
            },
        };

        this.config = Object.assign(this.config, config);
        this.orderBlock = document.querySelector(this.config.orderBlockSelector);
        this.initialize();
    }

    initialize() {
        if (!this.cart) {
            this.cart = new msCart(this.config);
        }
        if (!this.order && this.orderBlock) {
            this.order = new msOrder(this.config);
        }
        this.addListener(this.config.triggerElementSelector);
    }

    async send(params, url, method, headers) {
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

        await fetch(url, options)
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
                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.tagName) !== -1) {
                    eventName = 'change';
                }

                el.addEventListener(eventName, e => {
                    e.preventDefault();
                    if (el.dataset.msAction) {
                        let msAction = el.dataset.msAction.split('/');
                        className = msAction[0];
                        methodName = msAction[1];
                    }
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

    async add(params, el) {
        // api/cart/product - POST
        params.set('ms_action', 'cart/add');
        params.set('ms2_action', 'cart/add');
        await super.send(params);
    }

    async change(params, el) {
        // api/cart/product - PUT
        params.set('ms_action', 'cart/change');
        params.set('ms2_action', 'cart/change');
        await super.send(params);

    }

    async remove(params, el) {
        // api/cart/product - DELETE
        params.set('ms_action', 'cart/remove');
        params.set('ms2_action', 'cart/remove');
        await super.send(params);
    }

    async clean(params, el) {
        // api/cart/products - DELETE
        params.set('ms_action', 'cart/clean');
        params.set('ms2_action', 'cart/clean');
        await super.send(params);
    }

    async status(params) {
        // api/cart/products - GET
        params.set('ms_action', 'cart/status');
        params.set('ms2_action', 'cart/status');
        await super.send(params);
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
        if (this.orderBlock) {
            //this.updateFields(this.params);
            this.addListener(this.config.anotherFieldSelector, this.orderBlock, 'order', 'add');
        }
        // TODO понять почему синхронно в заказе не меняются доставка и оплата

        this.updatePayments(this.params, this.orderBlock.querySelector(this.config.deliveryFieldSelector + ':checked'));
        this.addListener(this.config.deliveryFieldSelector, this.orderBlock, 'order', 'updatePayments');

    }

    async add(params, el) {
        // api/order/add - GET
        if (el.name && el.value) {
            params.set('ms_action', 'order/add');
            params.set('ms2_action', 'order/add');
            params.set('key', el.name);
            params.set('value', el.value);
            await super.send(params);
        }
    }

    async getrequired(params) {
        // api/order/required - GET
        params.set('ms_action', 'order/getrequired');
        params.set('ms2_action', 'order/getrequired');
        params.set('id', document.querySelector(this.config.deliveryFieldSelector + ':checked').value);
        await super.send(params);
    }

    async updatePayments(params, el) {
        if (el.checked) {
            let paymentFields = this.orderBlock.querySelectorAll(this.config.paymentFieldSelector),
                paymentAllow = el.dataset.payments;
            if (paymentFields) {
                paymentFields.forEach(el => {
                    paymentAllow.indexOf(el.value) === -1 ? el.disabled = true : el.disabled = false;
                });
                let curPayment = this.orderBlock.querySelector(this.config.paymentFieldSelector + ':checked');
                if (curPayment.disabled) {
                    curPayment.checked = false;
                    await paymentFields.forEach(el => {
                        if (el.disabled === false) {
                            el.checked = true;
                            this.add(params, el);
                            return true;
                        }
                    });
                } else {
                    await this.add(params, curPayment);
                }
            }
            await this.add(params, el);
        }
        await this.getrequired(params);
        await this.getcost(params);
    }

    async getcost(params) {
        params.set('ms_action', 'order/getcost');
        params.set('ms2_action', 'order/getcost');
        await super.send(params);
    }

    async clean(params) {
        params.set('ms_action', 'order/clean');
        params.set('ms2_action', 'order/clean');
        await super.send(params);
        window.location.reload();
    }

    async submit(params) {
        params.set('ms_action', 'order/submit');
        params.set('ms2_action', 'order/submit');
        await super.send(params);
    }

    errorHandler(data) {
        switch (data.action) {
            case 'order/submit':
                this.submitErrorHandler(data);
                break;
        }
        console.log('Ошибка', data);
    }

    successHandler(data) {
        switch (data.action) {
            case 'order/getrequired':
                this.getrequiredSuccessHandler(data);
                break;

            case 'order/submit':
                this.submitSuccessHandler(data);
                break;

            case 'order/getcost':
                this.getcostSuccessHandler(data);
                break;
        }

        console.log('Успех', data);
    }

    getrequiredSuccessHandler(data) {
        window.minishop = this;
        if (data.response.data.requires) {
            let requireFieldWraps = document.querySelectorAll('.' + this.config.requireClass);
            if (requireFieldWraps.length) {
                requireFieldWraps.forEach(el => {
                    el.classList.remove(this.config.requireClass);
                    el.querySelector(this.config.anotherFieldSelector).removeEventListener('change', this.errorClassRemove);
                });
            }
            data.response.data.requires.forEach(el => {
                let field = document.querySelector('[name="' + el + '"]');
                field.closest(this.config.inputParentSelector).classList.add(this.config.requireClass);
                field.addEventListener('change', this.errorClassRemove);
            });

        }
    }

    errorClassRemove(e) {
        e.target.classList.remove(window.minishop.config.errorClass);
    }

    submitSuccessHandler(data) {
        if (data.response.data.redirect) {
            document.location.href = data.response.data.redirect;
        } else if (data.response.data.msorder) {
            document.location.href = document.location.origin + document.location.pathname
                + (document.location.search ? document.location.search + '&' : '?')
                + 'msorder=' + data.response.data.msorder;
        } else {
            location.reload();
        }
    }

    submitErrorHandler(data) {
        if (data.response.data) {
            data.response.data.forEach(name => {
                console.log(data.response.data);
                let field = document.querySelector('[name="' + name + '"]');
                if (field) {
                    field.classList.add(this.config.errorClass);
                }
            });
        }
    }

    getcostSuccessHandler(data) {
        let costSelectors = {
            discount_cost: this.config.discountCostSelector,
            cost: this.config.orderCostSelector,
            delivery_cost: this.config.deliveryCostSelector,
            cart_cost: this.config.cartCostSelector,
        }
        for (let k in costSelectors) {
            let el = document.querySelector(costSelectors[k]);
            if (el && data.response.data[k]) {
                el.innerText = new Intl.NumberFormat("ru").format(data.response.data[k]);
            }
        }
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
    e.detail.params.set('test', 1);

});

const minishop = new MiniShop({});


