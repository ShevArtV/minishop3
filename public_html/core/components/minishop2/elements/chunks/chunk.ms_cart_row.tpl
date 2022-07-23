{var $image}
{if $thumb?}
    <img src="{$thumb}" alt="{$pagetitle}" title="{$pagetitle}"/>
{else}
    <img src="{'assets_url' | option}components/minishop2/img/web/ms2_small.png"
         srcset="{'assets_url' | option}components/minishop2/img/web/ms2_small@2x.png 2x"
         alt="{$pagetitle}" title="{$pagetitle}"/>
{/if}
{/var}
<tr id="{$key}">
    <td class="title">
        <div class="d-flex">
            <div class="image mw-100 pr-3">
                {if $id?}
                    <a href="{$id | url}">{$image}</a>
                {else}
                    {$image}
                {/if}
            </div>
            <div class="title">
                {if $id?}
                    <a href="{$id | url}">{$pagetitle}</a>
                {else}
                    {$name}
                {/if}
                {if $options?}
                    <div class="small">
                        {$options | join : '; '}
                    </div>
                {/if}
            </div>
        </div>
    </td>
    <td class="count">
        <form method="post" class="ms2_form" role="form">
            <input type="hidden" name="key" value="{$key}"/>
            <div class="form-group">
                <div class="input-group input-group-sm">
                    <input type="number" name="count" value="{$count}" class="form-control" data-ms-cart-action="change" />
                    <div class="input-group-append">
                        <span class="input-group-text">{'ms2_frontend_count_unit' | lexicon}</span>
                    </div>
                </div>
            </div>
        </form>
    </td>
    <td class="weight">
        <span class="text-nowrap">{$weight} {'ms2_frontend_weight_unit' | lexicon}</span>
    </td>
    <td class="price">
        <span class="mr-2 text-nowrap">{$price} {'ms2_frontend_currency' | lexicon}</span>
        {if $old_price?}
            <span class="old_price text-nowrap">{$old_price} {'ms2_frontend_currency' | lexicon}</span>
        {/if}
    </td>
    <td class="cost">
        <span class="mr-2 text-nowrap"><span class="ms2_cost">{$cost?:$price * $count}</span> {'ms2_frontend_currency' | lexicon}</span>
    </td>
    <td class="remove">
        <form method="post" class="ms2_form text-md-right">
            <input type="hidden" name="key" value="{$key}">
            <button class="btn btn-sm btn-danger" type="submit" data-ms-cart-action="remove">&times;</button>
        </form>
    </td>
</tr>

