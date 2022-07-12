<?php
/** @var modX $modx */
/** @var array $scriptProperties */
/** @var miniShop2 $miniShop2 */
$miniShop2 = $modx->getService('miniShop2');
$miniShop2->initialize($modx->context->key);

$miniShop2->config['minicartWrapTpl'] = $modx->getOption('minicartWrapTpl', $scriptProperties, 'tpl.msMiniCart');
$miniShop2->config['minicartRowTpl'] = $modx->getOption('minicartRowTpl', $scriptProperties, 'tpl.msMcProductRow');

$cart = $miniShop2->cart->status();

return $cart['html']['minicart'];
