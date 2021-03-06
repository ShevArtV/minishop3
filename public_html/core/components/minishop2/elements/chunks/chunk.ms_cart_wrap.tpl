{if $products}
    <div class="table-responsive">
        <table class="table table-striped">
            <tr class="header">
                <th class="title">{'ms2_cart_title' | lexicon}</th>
                <th class="count">{'ms2_cart_count' | lexicon}</th>
                <th class="weight">{'ms2_cart_weight' | lexicon}</th>
                <th class="price">{'ms2_cart_price' | lexicon}</th>
                <th class="cost">{'ms2_cart_cost' | lexicon}</th>
                <th class="remove"></th>
            </tr>
            {$products}
            <tr class="footer">
                <th class="total">{'ms2_cart_total' | lexicon}:</th>
                <th class="total_count">
                    <span class="ms2_total_count">{$status['total_count']}</span>
                    {'ms2_frontend_count_unit' | lexicon}
                </th>
                <th class="total_weight text-nowrap" colspan="2">
                    <span class="ms2_total_weight">{$status['total_weight']}</span>
                    {'ms2_frontend_weight_unit' | lexicon}
                </th>
                <th class="total_cost text-nowrap" colspan="2">
                    <span class="ms2_total_cost">{$status['total_cost']}</span>
                    {'ms2_frontend_currency' | lexicon}
                </th>
            </tr>
        </table>
    </div>
    <div class="d-flex justify-content-between">
        <a href="{6 | url}" class="btn btn-success">
            Оформить заказ
        </a>
        <form method="post" class="ms2_form">
            <button type="submit" class="btn btn-danger" data-ms-cart-action="clean">
                {'ms2_cart_clean' | lexicon}
            </button>
        </form>
    </div>
{else}
    <div class="alert alert-warning" {!($products | length == 0) ? 'class="d-none"':''}>
        {'ms2_cart_is_empty' | lexicon}
    </div>
{/if}