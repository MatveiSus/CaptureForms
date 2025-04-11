<?php

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}

use Bitrix\Catalog\ProductTable;
use Bitrix\Main\Localization\Loc;
use Bitrix\Main\Security\Sign\Signer;

/**
 * @global CMain $APPLICATION
 * @var array $arParams
 * @var array $arResult
 * @var CatalogSectionComponent $component
 * @var CBitrixComponentTemplate $this
 * @var string $templateName
 * @var string $componentPath
 *
 *  _________________________________________________________________________
 * |    Attention!
 * |    The following comments are for system use
 * |    and are required for the component to work correctly in ajax mode:
 * |    <!-- items-container -->
 * |    <!-- pagination-container -->
 * |    <!-- component-end -->
 */

$this->setFrameMode(true);

$componentId = $this->randString();

if (!empty($arResult['NAV_RESULT'])) {
    $navParams = array(
        'NavPageCount' => $arResult['NAV_RESULT']->NavPageCount,
        'NavPageNomer' => $arResult['NAV_RESULT']->NavPageNomer,
        'NavNum' => $arResult['NAV_RESULT']->NavNum
    );
} else {
    $navParams = array(
        'NavPageCount' => 1,
        'NavPageNomer' => 1,
        'NavNum' => $this->randString()
    );
}

$showTopPager = false;
$showBottomPager = false;
$showLazyLoad = false;

if ($arParams['PAGE_ELEMENT_COUNT'] > 0) {
    $showTopPager = $arParams['DISPLAY_TOP_PAGER'];
    $showBottomPager = $arParams['DISPLAY_BOTTOM_PAGER'];
    $showLazyLoad = $arParams['LAZY_LOAD'] === 'Y' && $navParams['NavPageNomer'] != $navParams['NavPageCount'];
}

$templateLibrary = array();
$currencyList = '';

if (!empty($arResult['CURRENCIES'])) {
    $currencyList = CUtil::PhpToJSObject($arResult['CURRENCIES'], false, true, true);
}

$templateData = array(
    'TEMPLATE_LIBRARY' => $templateLibrary,
    'CURRENCIES' => $currencyList,
    'USE_PAGINATION_CONTAINER' => $showTopPager || $showBottomPager,
);
unset($currencyList, $templateLibrary);

$elementEdit = CIBlock::GetArrayByID($arParams['IBLOCK_ID'], 'ELEMENT_EDIT');
$elementDelete = CIBlock::GetArrayByID($arParams['IBLOCK_ID'], 'ELEMENT_DELETE');
$elementDeleteParams = array('CONFIRM' => GetMessage('CT_BCS_TPL_ELEMENT_DELETE_CONFIRM'));

$positionClassMap = array(
    'left' => 'left',
    'center' => 'center',
    'right' => 'right',
    'bottom' => 'bottom',
    'middle' => 'middle',
    'top' => 'top'
);

$labelPositionClass = '';
if (!empty($arParams['LABEL_PROP_POSITION'])) {
    foreach (explode('-', $arParams['LABEL_PROP_POSITION']) as $pos) {
        $labelPositionClass .= isset($positionClassMap[$pos]) ? ' ' . $positionClassMap[$pos] : '';
    }
}

$arParams['~MESS_BTN_BUY'] = ($arParams['~MESS_BTN_BUY'] ?? '') ?: Loc::getMessage('CT_BCS_TPL_MESS_BTN_BUY');
$arParams['~MESS_BTN_DETAIL'] = ($arParams['~MESS_BTN_DETAIL'] ?? '') ?: Loc::getMessage('CT_BCS_TPL_MESS_BTN_DETAIL');
$arParams['~MESS_BTN_COMPARE'] = ($arParams['~MESS_BTN_COMPARE'] ?? '') ?: Loc::getMessage(
    'CT_BCS_TPL_MESS_BTN_COMPARE'
);
$arParams['~MESS_BTN_SUBSCRIBE'] = ($arParams['~MESS_BTN_SUBSCRIBE'] ?? '') ?: Loc::getMessage(
    'CT_BCS_TPL_MESS_BTN_SUBSCRIBE'
);
$arParams['~MESS_BTN_ADD_TO_BASKET'] = ($arParams['~MESS_BTN_ADD_TO_BASKET'] ?? '') ?: Loc::getMessage(
    'CT_BCS_TPL_MESS_BTN_ADD_TO_BASKET'
);
$arParams['~MESS_NOT_AVAILABLE'] = ($arParams['~MESS_NOT_AVAILABLE'] ?? '') ?: Loc::getMessage(
    'CT_BCS_TPL_MESS_PRODUCT_NOT_AVAILABLE'
);
$arParams['~MESS_NOT_AVAILABLE_SERVICE'] = ($arParams['~MESS_NOT_AVAILABLE_SERVICE'] ?? '') ?: Loc::getMessage(
    'CP_BCS_TPL_MESS_PRODUCT_NOT_AVAILABLE_SERVICE'
);
$arParams['~MESS_SHOW_MAX_QUANTITY'] = ($arParams['~MESS_SHOW_MAX_QUANTITY'] ?? '') ?: Loc::getMessage(
    'CT_BCS_CATALOG_SHOW_MAX_QUANTITY'
);
$arParams['~MESS_RELATIVE_QUANTITY_MANY'] = ($arParams['~MESS_RELATIVE_QUANTITY_MANY'] ?? '') ?: Loc::getMessage(
    'CT_BCS_CATALOG_RELATIVE_QUANTITY_MANY'
);
$arParams['MESS_RELATIVE_QUANTITY_MANY'] = ($arParams['MESS_RELATIVE_QUANTITY_MANY'] ?? '') ?: Loc::getMessage(
    'CT_BCS_CATALOG_RELATIVE_QUANTITY_MANY'
);
$arParams['~MESS_RELATIVE_QUANTITY_FEW'] = ($arParams['~MESS_RELATIVE_QUANTITY_FEW'] ?? '') ?: Loc::getMessage(
    'CT_BCS_CATALOG_RELATIVE_QUANTITY_FEW'
);
$arParams['MESS_RELATIVE_QUANTITY_FEW'] = ($arParams['MESS_RELATIVE_QUANTITY_FEW'] ?? '') ?: Loc::getMessage(
    'CT_BCS_CATALOG_RELATIVE_QUANTITY_FEW'
);

$arParams['MESS_BTN_LAZY_LOAD'] = $arParams['MESS_BTN_LAZY_LOAD'] ?: Loc::getMessage(
    'CT_BCS_CATALOG_MESS_BTN_LAZY_LOAD'
);

$obName = 'ob' . preg_replace('/[^a-zA-Z0-9_]/', 'x', $this->GetEditAreaId($navParams['NavNum']));
$containerName = 'container-' . $navParams['NavNum'];

if ($showTopPager) { ?>
    <div class="d-flex justify-content-between align-items-center flex-sm-wrap flex-row-reverse"
         data-pagination-num="<?= $navParams['NavNum'] ?>">
        <!-- pagination-container -->
        <?= $arResult['NAV_STRING'] ?>
        <!-- pagination-container -->
    </div>
    <?php
} ?>

<div class="catalog-section">
    <?php
    if ($arParams['SECTION_TITLE']) { ?>
        <h2 class="catalog-section__title">
            <?= $arParams['SECTION_TITLE'] ?>
        </h2>
        <?php
    } ?>

    <div class="catalog-section__container <?= empty($arResult['ITEMS']) ? 'catalog-section__container--empty' : '' ?>"
         data-entity="<?= $containerName ?>">
        <?php
        if (!empty($arResult['ITEMS']) && !empty($arResult['ITEM_ROWS'])) {
            $generalParams = [
                'SHOW_DISCOUNT_PERCENT' => $arParams['SHOW_DISCOUNT_PERCENT'],
                'PRODUCT_DISPLAY_MODE' => $arParams['PRODUCT_DISPLAY_MODE'],
                'SHOW_MAX_QUANTITY' => $arParams['SHOW_MAX_QUANTITY'],
                'RELATIVE_QUANTITY_FACTOR' => $arParams['RELATIVE_QUANTITY_FACTOR'],
                'MESS_SHOW_MAX_QUANTITY' => $arParams['~MESS_SHOW_MAX_QUANTITY'],
                'MESS_RELATIVE_QUANTITY_MANY' => $arParams['~MESS_RELATIVE_QUANTITY_MANY'],
                'MESS_RELATIVE_QUANTITY_FEW' => $arParams['~MESS_RELATIVE_QUANTITY_FEW'],
                'SHOW_OLD_PRICE' => $arParams['SHOW_OLD_PRICE'],
                'USE_PRODUCT_QUANTITY' => $arParams['USE_PRODUCT_QUANTITY'],
                'PRODUCT_QUANTITY_VARIABLE' => $arParams['PRODUCT_QUANTITY_VARIABLE'],
                'ADD_TO_BASKET_ACTION' => $arParams['ADD_TO_BASKET_ACTION'],
                'ADD_PROPERTIES_TO_BASKET' => $arParams['ADD_PROPERTIES_TO_BASKET'],
                'PRODUCT_PROPS_VARIABLE' => $arParams['PRODUCT_PROPS_VARIABLE'],
                'SHOW_CLOSE_POPUP' => $arParams['SHOW_CLOSE_POPUP'],
                'DISPLAY_COMPARE' => $arParams['DISPLAY_COMPARE'],
                'COMPARE_PATH' => $arParams['COMPARE_PATH'],
                'COMPARE_NAME' => $arParams['COMPARE_NAME'],
                'PRODUCT_SUBSCRIPTION' => $arParams['PRODUCT_SUBSCRIPTION'],
                'PRODUCT_BLOCKS_ORDER' => $arParams['PRODUCT_BLOCKS_ORDER'],
                'LABEL_PROP' => $arParams['LABEL_PROP'],
                'LABEL_PROP_MOBILE' => $arParams['LABEL_PROP_MOBILE'],
                'LABEL_POSITION_CLASS' => $labelPositionClass,
                'DISCOUNT_POSITION_CLASS' => $discountPositionClass,
                'SLIDER_INTERVAL' => $arParams['SLIDER_INTERVAL'],
                'SLIDER_PROGRESS' => $arParams['SLIDER_PROGRESS'],
                '~BASKET_URL' => $arParams['~BASKET_URL'],
                '~ADD_URL_TEMPLATE' => $arResult['~ADD_URL_TEMPLATE'],
                '~BUY_URL_TEMPLATE' => $arResult['~BUY_URL_TEMPLATE'],
                '~COMPARE_URL_TEMPLATE' => $arResult['~COMPARE_URL_TEMPLATE'],
                '~COMPARE_DELETE_URL_TEMPLATE' => $arResult['~COMPARE_DELETE_URL_TEMPLATE'],
                'USE_ENHANCED_ECOMMERCE' => $arParams['USE_ENHANCED_ECOMMERCE'],
                'DATA_LAYER_NAME' => $arParams['DATA_LAYER_NAME'],
                'BRAND_PROPERTY' => $arParams['BRAND_PROPERTY'],
                'FILL_ITEM_ALL_PRICES' => $arParams['FILL_ITEM_ALL_PRICES'],
                'MESS_BTN_BUY' => $arParams['~MESS_BTN_BUY'],
                'MESS_BTN_DETAIL' => $arParams['~MESS_BTN_DETAIL'],
                'MESS_BTN_COMPARE' => $arParams['~MESS_BTN_COMPARE'],
                'MESS_BTN_SUBSCRIBE' => $arParams['~MESS_BTN_SUBSCRIBE'],
                'MESS_BTN_ADD_TO_BASKET' => $arParams['~MESS_BTN_ADD_TO_BASKET'],
                'USE_SKU_TITLE' => $arParams['USE_SKU_TITLE'],
                'USE_SKU_DISTINCT_URL' => $arParams['USE_SKU_DISTINCT_URL'],
                'USE_SKU_SEO' => $arParams['USE_SKU_DISTINCT_URL'],
                'USE_PRICE_COUNT' => $arParams['USE_PRICE_COUNT'],
                'SKU_VISUAL_VARIANT' => $arParams['SKU_VISUAL_VARIANT'],
                'ARTICLE_PROPERTY' => $arParams['ARTICLE_PROPERTY'],
                'OFFER_ARTICLE_PROPERTY' => $arParams['OFFER_ARTICLE_PROPERTY'],
                'ANIMATION_CLASS' => $arResult['ANIMATION_CLASS'],
                'SCROLL_ON_HOVER' => $arParams['ITEM_SCROLL_ON_HOVER']
            ];

            $areaIds = [];
            $itemParameters = [];
            ?>
            <script>
                <?php
                //add id to avoid rewriting messages by other catalog.section/top components on the same page
                ?>
                BX.message({
                    RELATIVE_QUANTITY_MANY_<?= $componentId ?>: '<?= CUtil::JSEscape($arParams['MESS_RELATIVE_QUANTITY_MANY'])?>',
                    RELATIVE_QUANTITY_FEW_<?= $componentId ?>: '<?= CUtil::JSEscape($arParams['MESS_RELATIVE_QUANTITY_FEW']) ?>',
                })
            </script>
            <!-- items-container -->
        <?php
        foreach ($arResult['ITEMS'] as $item) {
        $uniqueId = $item['ID'] . '_' . md5($this->randString() . $component->getAction());
        $areaIds[$item['ID']] = $this->GetEditAreaId($uniqueId);
        $this->AddEditAction($uniqueId, $item['EDIT_LINK'], $elementEdit);
        $this->AddDeleteAction($uniqueId, $item['DELETE_LINK'], $elementDelete, $elementDeleteParams);

        $itemParameters[$item['ID']] = [
            'SKU_PROPS' => $arResult['SKU_PROPS'][$item['IBLOCK_ID']],
            'MESS_NOT_AVAILABLE' => ($arResult['MODULES']['catalog'] && $item['PRODUCT']['TYPE'] === ProductTable::TYPE_SERVICE
                ? $arParams['~MESS_NOT_AVAILABLE_SERVICE']
                : $arParams['~MESS_NOT_AVAILABLE']
            ),
        ]; ?>
            <div class="catalog-section__item-wrapper" data-entity="items-row">
                <?php
                $APPLICATION->IncludeComponent(
                    'bitrix:catalog.item',
                    '',
                    array(
                        'RESULT' => array(
                            'ITEM' => $item,
                            'AREA_ID' => $areaIds[$item['ID']],
                            'TYPE' => 'card',
                            'BIG_LABEL' => 'N',
                            'BIG_DISCOUNT_PERCENT' => 'Y',
                            'SCALABLE' => 'N'
                        ),
                        'PARAMS' => $generalParams + $itemParameters[$item['ID']],
                        'COMPONENT_ID' => $componentId,
                    ),
                    $component,
                    array('HIDE_ICONS' => 'Y')
                ); ?>
            </div>
            <?php
        }
            unset($rowItems);

            unset($itemParameters);
            unset($areaIds);

            unset($generalParams);
            ?>
            <!-- items-container -->
            <?
        } else {
            // load css for bigData/deferred load
            $APPLICATION->IncludeComponent(
                'bitrix:catalog.item',
                '',
                array(),
                $component,
                array('HIDE_ICONS' => 'Y')
            );

            $APPLICATION->IncludeFile(
                SITE_TEMPLATE_PATH . '/include/page/empty.php',
                [
                    'title' => Loc::getMessage('CT_BCS_CATALOG_EMPTY_SECTION'),
                    'alt' => Loc::getMessage('CT_BCS_CATALOG_EMPTY_SECTION'),
                ],
                [
                    'MODE' => 'php'
                ]
            );
        } ?>
    </div>
</div>

<?php
if ($showBottomPager && (!empty($arResult['NAV_STRING']) || $showLazyLoad)) { ?>
    <div class="position-relative d-flex flex-sm-wrap flex-row-reverse justify-content-between align-items-center catalog__bottom_navigate"
         data-pagination-num="<?= $navParams['NavNum'] ?>">

        <?php
        if ($showLazyLoad) { ?>
            <button class="catalog-section__show-more-btn btn btn-secondary"
                    data-use="show-more-<?= $navParams['NavNum'] ?>"
                    style="<?= $arResult['NAV_RESULT']->NavPageCount ? '' : 'display: none' ?>"
            >
                <?= $arParams['MESS_BTN_LAZY_LOAD'] ?>
            </button>
            <?php
        } ?>

        <!-- pagination-container -->
        <?= $arResult['NAV_STRING'] ?>
        <!-- pagination-container -->
    </div>
    <?php
}

$signer = new Signer();
$signedTemplate = $signer->sign($templateName, 'catalog.section');
$signedParams = $signer->sign(base64_encode(serialize($arResult['ORIGINAL_PARAMETERS'])), 'catalog.section');
?>
<script>
    BX.message({
        BTN_MESSAGE_BASKET_REDIRECT: '<?= GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_BASKET_REDIRECT') ?>',
        BASKET_URL: '<?= $arParams['BASKET_URL'] ?>',
        ADD_TO_BASKET_OK: '<?= GetMessageJS('ADD_TO_BASKET_OK') ?>',
        TITLE_ERROR: '<?= GetMessageJS('CT_BCS_CATALOG_TITLE_ERROR') ?>',
        TITLE_BASKET_PROPS: '<?= GetMessageJS('CT_BCS_CATALOG_TITLE_BASKET_PROPS') ?>',
        TITLE_SUCCESSFUL: '<?= GetMessageJS('ADD_TO_BASKET_OK', ["#BASKET_LINK#" => $arParams['BASKET_URL']]) ?>',
        TITLE_SUCCESSFUL_REMOVE: '<?= GetMessageJS(
            'REMOVE_FROM_BASKET_OK',
            ["#BASKET_LINK#" => $arParams['BASKET_URL']]
        ) ?>',
        TITLE_SUCCESSFUL_FAVORITE: '<?= GetMessageJS(
            'ADD_TO_FAVORITE_OK',
            ["#FAVORITE_LINK#" => $arParams['FAVORITE_URL']]
        ) ?>',
        TITLE_SUCCESSFUL_FAVORITE_REMOVE: '<?= GetMessageJS(
            'REMOVE_FROM_FAVORITE_OK',
            ["#FAVORITE_LINK#" => $arParams['FAVORITE_URL']]
        ) ?>',
        BASKET_UNKNOWN_ERROR: '<?= GetMessageJS('CT_BCS_CATALOG_BASKET_UNKNOWN_ERROR') ?>',
        BTN_MESSAGE_SEND_PROPS: '<?= GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_SEND_PROPS') ?>',
        BTN_MESSAGE_CLOSE: '<?= GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_CLOSE') ?>',
        BTN_MESSAGE_CLOSE_POPUP: '<?= GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_CLOSE_POPUP') ?>',
        COMPARE_MESSAGE_OK: '<?= GetMessageJS(
            'CT_BCS_CATALOG_MESS_COMPARE_OK',
            ['#COMPARE_LINK#' => $arParams['COMPARE_URL']]
        ) ?>',
        COMPARE_MESSAGE_DELETE: '<?= GetMessageJS('CT_BCS_CATALOG_MESS_COMPARE_DELETE') ?>',
        COMPARE_UNKNOWN_ERROR: '<?= GetMessageJS('CT_BCS_CATALOG_MESS_COMPARE_UNKNOWN_ERROR') ?>',
        COMPARE_TITLE: '<?= GetMessageJS('CT_BCS_CATALOG_MESS_COMPARE_TITLE') ?>',
        PRICE_TOTAL_PREFIX: '<?= GetMessageJS('CT_BCS_CATALOG_PRICE_TOTAL_PREFIX') ?>',
        PRICE_FROM: '<?= GetMessageJS('CT_BCS_TPL_MESS_PRICE_FROM') ?>',
        BTN_MESSAGE_COMPARE_REDIRECT: '<?= GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_COMPARE_REDIRECT') ?>',
        BTN_MESSAGE_LAZY_LOAD: '<?= CUtil::JSEscape($arParams['MESS_BTN_LAZY_LOAD']) ?>',
        BTN_MESSAGE_LAZY_LOAD_WAITER: '<?= GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_LAZY_LOAD_WAITER') ?>',
        CT_BCS_TPL_MESS_BTN_IN_BASKET: '<?= GetMessageJS('CT_BCS_TPL_MESS_BTN_IN_BASKET')  ?>',
        SITE_ID: '<?= CUtil::JSEscape($component->getSiteId()) ?>',
        TO_FAVORITE: '<?= GetMessageJS('CT_BC_CATALOG_TO_FAVORITE') ?>',
        IN_FAVORITE: '<?= GetMessageJS('CT_BC_CATALOG_IN_FAVORITE') ?>',
        TO_COMPARE: '<?= GetMessageJS('CT_BC_CATALOG_TO_COMPARE') ?>',
        IN_COMPARE: '<?= GetMessageJS('CT_BC_CATALOG_IN_COMPARE') ?>',
    });
    var <?= $obName ?> = new JCCatalogSectionComponent({
        siteId: '<?= CUtil::JSEscape($component->getSiteId()) ?>',
        componentPath: '<?= CUtil::JSEscape($componentPath) ?>',
        navParams: <?= CUtil::PhpToJSObject($navParams) ?>,
        deferredLoad: false, // enable it for deferred load
        initiallyShowHeader: '<?= !empty($arResult['ITEM_ROWS']) ?>',
        bigData: <?= CUtil::PhpToJSObject($arResult['BIG_DATA']) ?>,
        lazyLoad: !!'<?= $showLazyLoad ?>',
        loadOnScroll: !!'<?= ($arParams['LOAD_ON_SCROLL'] === 'Y') ?>',
        template: '<?= CUtil::JSEscape($signedTemplate) ?>',
        ajaxId: '<?= CUtil::JSEscape($arParams['AJAX_ID'] ?? '') ?>',
        parameters: '<?= CUtil::JSEscape($signedParams) ?>',
        container: '<?= $containerName ?>'
    });

    BX.onCustomEvent('catalogSectionLoaded', [Boolean(<?= $arResult['ITEMS'] ? 1 : 0 ?>)]);
</script>
<!-- component-end -->
