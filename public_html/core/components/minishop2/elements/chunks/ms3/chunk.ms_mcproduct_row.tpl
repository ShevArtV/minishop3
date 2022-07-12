<li>
    <form class="d-flex" method="post">
        <input type="hidden" name="id" value="{$id}">
        <input type="hidden" name="options" value="[]">
        <input type="hidden" name="key" value="{$key}">
        <div class="col-6">
            {$pagetitle}
        </div>
        <div class="col-">
            <input type="number" name="count" value="{$count}" data-ms-action="cart/change">
        </div>
    </form>
</li>