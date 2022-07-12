class MiniShop {
    constructor(config) {
        this.config = {
            'triggerElementSelector': '[data-ms-action]',
            'cartBlockSelector': '[data-ms-cart]',
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
            this.cart = new Cart(this.config);
        }
        this.addListener(this.config.triggerElementSelector);
    }

    send(params, url, method, headers) {
        method = method ? method : 'POST';
        headers = headers ? headers : {"X-Requested-With": "XMLHttpRequest"};
        url = url ? url : this.config.actionUrl;

        let data = {instance: this, params: params};
        if (!this.fire(this.events.ms.before_send, data)) {
            this.errorHandler(data);
            return false;
        }

        let options = {
                method: method,
                headers: headers,
                body: params
            };

        fetch(url, options)
            .then(response => response.json())
            .then(result => this.responseHandler(params, result));
    }

    prepare(elem) {
        return new FormData(elem.closest('form'));
    }

    responseHandler(params, response) {
        let action = params.get('ms2_action'),
            data = {instance: this, params: params, response: response, action: action};
        if (!this.fire(this.events.ms.after_send, data) || !response.success) {
            this.errorHandler(data);
        } else {
            this.successHandler(data);
        }
    }

    errorHandler(data) {
        console.log('Ошибка', data);
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
        console.log('Успех', data);
    }

    fire(eventName, data) {
        data = data || {};
        let event = new CustomEvent(eventName, {bubbles: true, cancelable: true, composed: false, detail: data});
        if (!document.dispatchEvent(event)) {
            this.errorHandler(data);
            return false;
        }
        return true;
    }

    addListener(selector, scope) {
        scope = scope || document;
        let elements = scope.querySelectorAll(selector);
        if (elements) {
            elements.forEach(el => {
                let msAction = el.dataset.msAction.split('/'),
                    className = msAction[0],
                    methodName = msAction[1],
                    eventName = 'click';
                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.tagName) !== -1) {
                    eventName = 'change';
                }

                el.addEventListener(eventName, e => {
                    e.preventDefault();
                    this[className][methodName](this.prepare(el));
                });
            });
        }
    }

}

class Cart extends MiniShop {
    initialize() {
        this.cart = this;
    }

    add(params) {
        // api/cart/product - POST
        params.append('ms2_action', 'cart/add');
        super.send(params);
    }

    change(params) {
        // api/cart/product - PUT
        params.append('ms2_action', 'cart/change');
        super.send(params);

    }

    remove(params) {
        // api/cart/product - DELETE
        params.append('ms2_action', 'cart/remove');
        super.send(params);
    }

    clean(params) {
        // api/cart/products - DELETE
        params.append('ms2_action', 'cart/clean');
        super.send(params);
    }

    status(params) {
        // api/cart/products - GET
        params.append('ms2_action', 'cart/status');
        super.send(params);
    }

    removeItem(key) {
        document.getElementById(key).remove();
    }
}

const minishop = new MiniShop({});

if (minishop) {
    document.addEventListener('ms_after_send', e => {
        if(e.detail.action == 'cart/add'){
            //blabla
        }
    });
    document.addEventListener('ms_after_cart_add', e => {
        //blabla
    });
    document.addEventListener('ms_before_send', e => {
        console.log(e.detail);
        e.detail.params.append('test', 1);
    });
}
