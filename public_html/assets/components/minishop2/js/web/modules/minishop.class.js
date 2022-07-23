export default class MiniShop {
    constructor(config) {
        this.config = {
            triggerElementSelector: '[data-ms-action]',
            cartBlockSelector: '[data-ms-cart]',
            orderBlockSelector: '[data-ms-order]',
            deliveryFieldSelector: '[name="delivery"]',
            paymentFieldSelector: '[name="payment"]',
            anotherFieldSelector: '[data-ms-field]',
            cartCostSelector: '[data-ms-cart-cost]',
            deliveryCostSelector: '[data-ms-delivery-cost]',
            orderCostSelector: '[data-ms-order-cost]',
            discountCostSelector: '[data-ms-discount-cost]',
            actionUrl: '/assets/components/minishop2/action.php',
            hideClass: 'd-none',
            errorClass: 'ms-error',
            requireClass: 'ms-required',
            inputParentSelector: '.ms-input-parent',
            selectorPrefix: 'ms-',
        }
        this.events = {
            ms: {
                afterSend: 'ms_after_send',
                beforeSend: 'ms_before_send',
            },
        };
        this.className = 'MiniShop';
        this.config = Object.assign(this.config, config);
        this.initialize();
    }

    initialize() {}

    async send(params, url, method, headers) {
        method = method || 'POST';
        headers = headers || {"X-Requested-With": "XMLHttpRequest"};
        url = url || this.config.actionUrl;

        const data = {
            instance: this,
            params: params,
            callbacks: {
                errorHandlers: {
                    before: {},
                    after: {},
                },
                successHandlers: {
                    before: {},
                    after: {},
                },
            },
        };

        if (!this.fire(this.events.ms.beforeSend, data)) {
            if (data.callbacks.errorHandlers.before.length) {
                this.runCallbacks(data.callbacks.errorHandlers.before, data);
            }
            this.errorHandler(data);
            return false;
        }

        if (data.callbacks.successHandlers.before.length) {
            this.runCallbacks(data.callbacks.successHandlers.before, data);
        }

        const options = {
            method: method,
            headers: headers,
            body: data.params,
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
            if (!this.fire(this.events.ms.afterSend, data) || !response.success) {
                if (data.callbacks.errorHandlers.after.length) {
                    this.runCallbacks(data.callbacks.errorHandlers.after, data);
                }
                if (this.errorHandler) {
                    this.errorHandler(data);
                } else {
                    this.errorHandler(data);
                }
            } else {
                if (data.callbacks.successHandlers.after.length) {
                    this.runCallbacks(data.callbacks.successHandlers.after, data);
                }
                if (this.successHandler) {
                    this.successHandler(data);
                } else {
                    this.successHandler(data);
                }
            }
        }
    }

    errorHandler(data) {
        if (this.notify && data.response.message) {
            this.notify.showMessage('error', data.response.message);
        }
    }

    successHandler(data) {
        if (this.notify && data.response.message) {
            this.notify.showMessage('success', data.response.message);
        }
    }

    fire(eventName, data) {
        data = data || {};
        const event = new CustomEvent(eventName, {bubbles: true, cancelable: true, composed: true, detail: data});
        if (!document.dispatchEvent(event)) {
            return false;
        }
        return true;
    }

    addListener(selector, scope, methodName) {
        scope = scope || document;
        const elements = scope.querySelectorAll(selector);
        if (elements) {
            elements.forEach(el => {
                let eventName = 'click';
                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.tagName) !== -1) {
                    eventName = 'change';
                }
                el.addEventListener(eventName, e => {
                    if (el.dataset.msAction) {
                        const msAction = el.dataset.msAction.split('/');
                        methodName = msAction[1];
                    }

                    e.preventDefault();
                    
                    if (typeof this[methodName] === 'function') {
                        this[methodName](this.prepare(el), el);
                    }
                });
            });
        }
    }

    runCallbacks(callbacks, data) {
        for (let f in callbacks) {
            if (typeof callbacks[f] === 'function') {
                callbacks[f](data);
            }
        }
    }
}
