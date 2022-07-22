import MiniShop from "./minishop.class.js";
export  default  class msOrder extends MiniShop {
    initialize() {
        this.className = 'msOrder';
        this.params = new FormData();
        this.orderBlock = document.querySelector(this.config.orderBlockSelector);
        if (this.orderBlock) {
            this.addListener(this.config.triggerElementSelector, this.orderBlock);
            this.addListener(this.config.anotherFieldSelector, this.orderBlock,'add');
            this.updatePayments(this.params, this.orderBlock.querySelector(this.config.deliveryFieldSelector + ':checked'));
            this.addListener(this.config.deliveryFieldSelector, this.orderBlock,'updatePayments');
        }
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

            case 'order/add':
                this.addErrorHandler(data);
                break;
        }

        if(this.notify && data.response.message){
            this.notify.showMessage('error', data.response.message);
        }
    }

    addErrorHandler(data){
        let fields = data.response.data;
        if(fields){
            for(let k in fields){
                let field = document.querySelector('[name="' + k + '"]');
                if (field) {
                    field.value = '';
                    field.classList.add(this.config.errorClass);
                }
            }
        }
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
        if(this.notify && data.response.message){
            this.notify.showMessage('success', data.response.message);
        }
    }

    getrequiredSuccessHandler(data) {
        if (data.response.data.requires) {
            let requireFieldWraps = document.querySelectorAll('.' + this.config.requireClass);
            if (requireFieldWraps.length) {
                requireFieldWraps.forEach(el => {
                    el.classList.remove(this.config.requireClass);
                    el.querySelector(this.config.anotherFieldSelector).removeEventListener('change', this.errorClassRemove.bind(this));
                });
            }
            data.response.data.requires.forEach(el => {
                let field = document.querySelector('[name="' + el + '"]');
                field.closest(this.config.inputParentSelector).classList.add(this.config.requireClass);
                field.addEventListener('change', this.errorClassRemove.bind(this));
            });

        }
    }

    errorClassRemove(e) {
        e.target.classList.remove(this.config.errorClass);
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