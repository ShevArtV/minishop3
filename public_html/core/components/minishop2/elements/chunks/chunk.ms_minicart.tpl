<div class="msMiniCart">
    {if $status['total_count'] > 0}
        <div>
            <h5>{'ms2_minicart' | lexicon}</h5>
            {'ms2_minicart_goods' | lexicon} <strong class="ms2_total_count">{$status['total_count']}</strong> {'ms2_frontend_count_unit' | lexicon},
            {'ms2_minicart_cost' | lexicon} <strong class="ms2_total_cost">{$status['total_cost']}</strong> {'ms2_frontend_currency' | lexicon}
        </div>
    {else}
        <div>
            <h5>{'ms2_minicart' | lexicon}</h5>
            {'ms2_minicart_is_empty' | lexicon}
        </div>
    {/if}
    {if $products}
        <ul data-ms-mcproducts>
            {$products}
        </ul>
    {/if}
</div>