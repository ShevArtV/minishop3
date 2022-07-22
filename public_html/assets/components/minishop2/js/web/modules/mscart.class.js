import MiniShop from "./minishop.class.js";

export default class msCart extends MiniShop {
    initialize() {
        this.orderBlock = document.querySelector(this.config.orderBlockSelector);
        if(!this.orderBlock){
            this.addListener(this.config.triggerElementSelector);
        }
        this.className = 'msCart';
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
        if (data.params.get('key') && !data.response.data.total_count) {
            this.removeItem(data.params.get('key'));
        }

        if (data.response.data.html) {
            let html = data.response.data.html;
            for (let key in html) {
                let target = document.querySelector('[data-' + this.config.selectorPrefix + key + ']');

                if (target) {
                    target.innerHTML = data.response.data.html[key];
                    this.addListener(this.config.triggerElementSelector, target);
                }
            }
        }
        if (this.notify && data.response.message) {
            this.notify.showMessage('success', data.response.message);
        }
    }
}