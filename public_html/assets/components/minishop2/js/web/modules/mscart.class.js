import MiniShop from "./minishop.class.js";

export default class msCart extends MiniShop {
    initialize() {
        this.orderBlock = document.querySelector(this.config.orderBlockSelector);
        this.addListener(this.config.cartTriggerElementSelector);
        this.className = 'Cart';
    }

    async add(params) {
        // api/cart/product - POST
        params.set('ms_action', 'cart/add');
        params.set('ms2_action', 'cart/add');
        await super.send(params);
    }

    async change(params) {
        // api/cart/product - PUT
        params.set('ms_action', 'cart/change');
        params.set('ms2_action', 'cart/change');
        await super.send(params);

    }

    async remove(params) {
        // api/cart/product - DELETE
        params.set('ms_action', 'cart/remove');
        params.set('ms2_action', 'cart/remove');
        await super.send(params);
    }

    async clean(params) {
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
        if (data.params.get('key') && !data.response.data.total_count) {
            this.removeItem(data.params.get('key'));
        }
        if (this.orderBlock) {
            const event = new CustomEvent('change', {bubbles: true, cancelable: false, composed: false}),
                deliveryField = document.querySelector(this.config.deliveryFieldSelector);
            deliveryField.dispatchEvent(event);
            if (!data.response.data.total_count) {
                this.orderBlock.classList.add(this.config.hideClass);
            } else {
                this.orderBlock.classList.remove(this.config.hideClass);
            }
        }
        if (data.response.data.html) {
            const html = data.response.data.html;
            for (let key in html) {
                const target = document.querySelector('[data-' + this.config.selectorPrefix + key + ']');

                if (target) {
                    target.innerHTML = data.response.data.html[key];
                    this.addListener(this.config.cartTriggerElementSelector, target);
                }
            }
        }
        if (this.notify && data.response.message) {
            this.notify.showMessage('success', data.response.message);
        }
    }
}