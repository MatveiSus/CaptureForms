<?php

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}

use Bitrix\Main;
use Bitrix\Main\{Localization\Loc, UI\Extension};
use Sotbit\B2C\{Helper\Config,};

/**
 * @global CMain $APPLICATION
 * @var array $arParams
 * @var array $arResult
 * @var CatalogProductsViewedComponent $component
 * @var CBitrixComponentTemplate $this
 * @var string $templateName
 * @var string $componentPath
 * @var string $templateFolder
 */

$this->setFrameMode(true);
$this->addExternalCss(SITE_TEMPLATE_PATH . '/assets/css/common/form-popup.min.css');

if (isset($arResult['ITEM'])) {
    $componentId = $this->randString();

    $item = $arResult['ITEM'];
    $areaId = $arResult['AREA_ID'];
    $itemIds = array(
        'ID' => $areaId,
        'PICT' => $areaId . '_pict',
        'PICT_SLIDER' => $areaId . '_pict_slider',
        'STICKER_ID' => $areaId . '_sticker',
        'SECOND_STICKER_ID' => $areaId . '_secondsticker',
        'QUANTITY' => $areaId . '_quantity',
        'QUANTITY_DOWN' => $areaId . '_quant_down',
        'QUANTITY_UP' => $areaId . '_quant_up',
        'QUANTITY_LIMIT' => $areaId . '_quant_limit',
        'QUANTITY_BLOCK' => $areaId . '_quant_block',
        'BUY_LINK' => $areaId . '_buy_link',
        'NOT_AVAILABLE_MESS' => $areaId . '_not_avail',
        'SUBSCRIBE_LINK' => $areaId . '_subscribe',
        'COMPARE_LINK' => $areaId . '_compare_link',
        'PRICE' => $areaId . '_price',
        'PRICE_OLD' => $areaId . '_price_old',
        'DSC_PERC' => $areaId . '_dsc_perc',
        'SECOND_DSC_PERC' => $areaId . '_second_dsc_perc',
        'PROP_DIV' => $areaId . '_sku_tree',
        'PROP' => $areaId . '_prop_',
        'DISPLAY_PROP_DIV' => $areaId . '_sku_prop',
        'BASKET_PROP_DIV' => $areaId . '_basket_prop',
        'QUANTITY_MEASURE' => $areaId . '_quant_measure',
        'PRODUCT_NAME' => $areaId . '_product_name',
    );
    $obName = 'ob' . preg_replace("/[^a-zA-Z0-9_]/", "x", $areaId);
    $isBig = isset($arResult['BIG']) && $arResult['BIG'] === 'Y';

    $productTitle = isset($item['IPROPERTY_VALUES']['ELEMENT_PAGE_TITLE']) && $item['IPROPERTY_VALUES']['ELEMENT_PAGE_TITLE'] != ''
        ? $item['IPROPERTY_VALUES']['ELEMENT_PAGE_TITLE']
        : $item['NAME'];

    $imgTitle = isset($item['IPROPERTY_VALUES']['ELEMENT_PREVIEW_PICTURE_FILE_TITLE']) && $item['IPROPERTY_VALUES']['ELEMENT_PREVIEW_PICTURE_FILE_TITLE'] != ''
        ? $item['IPROPERTY_VALUES']['ELEMENT_PREVIEW_PICTURE_FILE_TITLE']
        : $item['NAME'];

    $skuPropsCodes = array();
    $skuProps = array();

    $haveOffers = !empty($item['OFFERS']);

    if ($haveOffers) {
        $itemIds['OFFERS_POPUP'] = $areaId . '_offers_popup';
        $itemIds['OFFERS_POPUP_OPEN_BUTTON'] = $areaId . '_offers_popup_open_button';
        $itemIds['OFFERS_POPUP_CLOSE_BUTTON'] = $areaId . '_offers_popup_close_button';
        $itemIds['OFFERS_POPUP_PICTURE'] = $areaId . '_offers_popup_picture';
        $itemIds['OFFERS_POPUP_SLIDER'] = $areaId . '_offers_popup_slider';
        $itemIds['OFFERS_POPUP_PRICE_LIST'] = $areaId . '_offers_popup_price_list';

        $actualItem = isset($item['OFFERS'][$item['OFFERS_SELECTED']])
            ? $item['OFFERS'][$item['OFFERS_SELECTED']]
            : reset($item['OFFERS']);
    } else {
        $actualItem = $item;
    }

    $morePhoto = null;
    if ($arParams['PRODUCT_DISPLAY_MODE'] === 'N' && $haveOffers) {
        $price = $item['ITEM_START_PRICE'];
        $minOffer = $item['OFFERS'][$item['ITEM_START_PRICE_SELECTED']];
        $measureRatio = $minOffer['ITEM_MEASURE_RATIOS'][$minOffer['ITEM_MEASURE_RATIO_SELECTED']]['RATIO'];
        if (isset($item['MORE_PHOTO'])) {
            $morePhoto = $item['MORE_PHOTO'];
        }
    } else {
        $price = $actualItem['ITEM_PRICES'][$actualItem['ITEM_PRICE_SELECTED']];
        $measureRatio = $price['MIN_QUANTITY'];
        if (isset($actualItem['MORE_PHOTO'])) {
            $morePhoto = $actualItem['MORE_PHOTO'];
        }
    }

    $showSlider = is_array($morePhoto) && count($morePhoto) > 1;
    $showSubscribe = $arParams['PRODUCT_SUBSCRIPTION'] === 'Y' && ($item['CATALOG_SUBSCRIBE'] === 'Y' || $haveOffers);
    $showFavorite = $haveOffers || $actualItem['CAN_BUY'];
    $showOneClick = ($haveOffers || $actualItem['CAN_BUY']) && Config::useOneClickProductList();
    $showOneClickPreview = ($haveOffers || $actualItem['CAN_BUY']) && Config::useOneClickProductPreview();

    $discountPositionClass = isset($arResult['BIG_DISCOUNT_PERCENT']) && $arResult['BIG_DISCOUNT_PERCENT'] === 'Y'
        ? 'catalog-item__discount--big catalog-item__discount'
        : 'catalog-item__discount';
    $discountPositionClass .= $arParams['DISCOUNT_POSITION_CLASS'];

    $labelPositionClass = isset($arResult['BIG_LABEL']) && $arResult['BIG_LABEL'] === 'Y'
        ? 'catalog-item__badges--big catalog-item__badges'
        : 'catalog-item__badges';
    $labelPositionClass .= $arParams['LABEL_POSITION_CLASS'];

    $buttonSizeClass = isset($arResult['BIG_BUTTONS']) && $arResult['BIG_BUTTONS'] === 'Y' ? '' : 'btn-small';
    $itemHasDetailUrl = isset($item['DETAIL_PAGE_URL']) && $item['DETAIL_PAGE_URL'] != '';

    $arParams['MESS_PRICE_RANGES_TITLE'] = Loc::getMessage('CT_BCI_CATALOG_PRICE_RANGES_TITLE');
    $useAllPrices = $arParams['FILL_ITEM_ALL_PRICES'] === true || $arParams['FILL_ITEM_ALL_PRICES'] === 'Y';
    if (is_array($actualItem['ITEM_ALL_PRICES'])) {
        $showPriceTypes = count($actualItem['ITEM_ALL_PRICES']) === 1 && count(
                $actualItem['ITEM_ALL_PRICES'][0]['PRICES']
            ) > 1;
    }
    $showRanges = !$haveOffers && count($actualItem['ITEM_QUANTITY_RANGES']) > 1;
    $useRatio = $arParams['USE_RATIO_IN_RANGES'] === 'Y';
    $showOfferProps = $arParams['PRODUCT_DISPLAY_MODE'] === 'Y' && $item['OFFERS_PROPS_DISPLAY'];

    $extensions = [];

    if ($showSlider) {
        $extensions[] = 'sotbit.b2c.keenslider';
    }

    Extension::load($extensions);
    ?>

    <div class="catalog-item position-relative"
         id="<?= $areaId ?>" data-entity="item">
        <?
        $documentRoot = Main\Application::getDocumentRoot();
        $templatePath = mb_strtolower($arResult['TYPE']) . '/template.php';
        $file = new Main\IO\File($documentRoot . $templateFolder . '/' . $templatePath);
        if ($file->isExists()) {
            include($file->getPath());
        }

        if (!$haveOffers) {
            $jsParams = array(
                'USE_PRICE_COUNT' => $arParams['USE_PRICE_COUNT'],
                'PRODUCT_TYPE' => $item['PRODUCT']['TYPE'],
                'SHOW_QUANTITY' => $arParams['USE_PRODUCT_QUANTITY'],
                'SHOW_ADD_BASKET_BTN' => false,
                'SHOW_BUY_BTN' => true,
                'SHOW_ABSENT' => true,
                'SHOW_OLD_PRICE' => $arParams['SHOW_OLD_PRICE'] === 'Y',
                'ADD_TO_BASKET_ACTION' => $arParams['ADD_TO_BASKET_ACTION'],
                'SHOW_CLOSE_POPUP' => $arParams['SHOW_CLOSE_POPUP'] === 'Y',
                'SHOW_DISCOUNT_PERCENT' => $arParams['SHOW_DISCOUNT_PERCENT'] === 'Y',
                'DISPLAY_COMPARE' => $arParams['DISPLAY_COMPARE'],
                'BIG_DATA' => $item['BIG_DATA'],
                'TEMPLATE_THEME' => $arParams['TEMPLATE_THEME'],
                'VIEW_MODE' => $arResult['TYPE'],
                'USE_SUBSCRIBE' => $showSubscribe,
                'FILL_ITEM_ALL_PRICES' => $arParams['FILL_ITEM_ALL_PRICES'],
                'PRODUCT' => array(
                    'ID' => $item['ID'],
                    'NAME' => $productTitle,
                    'DETAIL_PAGE_URL' => $item['DETAIL_PAGE_URL'],
                    'PICT' => $item['PREVIEW_PICTURE'],
                    'CAN_BUY' => $item['CAN_BUY'],
                    'CHECK_QUANTITY' => $item['CHECK_QUANTITY'],
                    'MAX_QUANTITY' => $item['CATALOG_QUANTITY'],
                    'STEP_QUANTITY' => $item['ITEM_MEASURE_RATIOS'][$item['ITEM_MEASURE_RATIO_SELECTED']]['RATIO'],
                    'QUANTITY_FLOAT' => is_float(
                        $item['ITEM_MEASURE_RATIOS'][$item['ITEM_MEASURE_RATIO_SELECTED']]['RATIO']
                    ),
                    'ITEM_PRICE_MODE' => $item['ITEM_PRICE_MODE'],
                    'ITEM_PRICES' => $item['ITEM_PRICES'],
                    'ITEM_ALL_PRICES' => $item['ITEM_ALL_PRICES'],
                    'ITEM_PRICE_SELECTED' => $item['ITEM_PRICE_SELECTED'],
                    'ITEM_QUANTITY_RANGES' => $item['ITEM_QUANTITY_RANGES'],
                    'ITEM_QUANTITY_RANGE_SELECTED' => $item['ITEM_QUANTITY_RANGE_SELECTED'],
                    'ITEM_MEASURE_RATIOS' => $item['ITEM_MEASURE_RATIOS'],
                    'ITEM_MEASURE_RATIO_SELECTED' => $item['ITEM_MEASURE_RATIO_SELECTED'],
                    'MORE_PHOTO' => $item['MORE_PHOTO'],
                    'MORE_PHOTO_COUNT' => $item['MORE_PHOTO_COUNT']
                ),
                'BASKET' => array(
                    'ADD_PROPS' => $arParams['ADD_PROPERTIES_TO_BASKET'] === 'Y',
                    'QUANTITY' => $arParams['PRODUCT_QUANTITY_VARIABLE'],
                    'PROPS' => $arParams['PRODUCT_PROPS_VARIABLE'],
                    'EMPTY_PROPS' => empty($item['PRODUCT_PROPERTIES']),
                    'BASKET_URL' => $arParams['~BASKET_URL'],
                    'ADD_URL_TEMPLATE' => $arParams['~ADD_URL_TEMPLATE'],
                    'BUY_URL_TEMPLATE' => $arParams['~BUY_URL_TEMPLATE']
                ),
                'VISUAL' => array(
                    'ID' => $itemIds['ID'],
                    'PRODUCT_NAME' => $itemIds['PRODUCT_NAME'],
                    'PICT_ID' => $itemIds['PICT'],
                    'PICT_SLIDER_ID' => $itemIds['PICT_SLIDER'],
                    'QUANTITY_ID' => $itemIds['QUANTITY'],
                    'QUANTITY_UP_ID' => $itemIds['QUANTITY_UP'],
                    'QUANTITY_DOWN_ID' => $itemIds['QUANTITY_DOWN'],
                    'QUANTITY_BLOCK' => $itemIds['QUANTITY_BLOCK'],
                    'PRICE_ID' => $itemIds['PRICE'],
                    'PRICE_OLD_ID' => $itemIds['PRICE_OLD'],
                    'BUY_ID' => $itemIds['BUY_LINK'],
                    'BASKET_PROP_DIV' => $itemIds['BASKET_PROP_DIV'],
                    'NOT_AVAILABLE_MESS' => $itemIds['NOT_AVAILABLE_MESS'],
                    'COMPARE_LINK_ID' => $itemIds['COMPARE_LINK'],
                    'SUBSCRIBE_ID' => $itemIds['SUBSCRIBE_LINK'],
                )
            );
        } else {
            $jsParams = array(
                'USE_PRICE_COUNT' => $arParams['USE_PRICE_COUNT'],
                'PRODUCT_TYPE' => $item['PRODUCT']['TYPE'],
                'SHOW_QUANTITY' => false,
                'SHOW_ADD_BASKET_BTN' => false,
                'SHOW_BUY_BTN' => true,
                'SHOW_ABSENT' => true,
                'SHOW_SKU_PROPS' => false,
                'SHOW_OLD_PRICE' => $arParams['SHOW_OLD_PRICE'] === 'Y',
                'SHOW_MAX_QUANTITY' => $arParams['SHOW_MAX_QUANTITY'],
                'RELATIVE_QUANTITY_FACTOR' => $arParams['RELATIVE_QUANTITY_FACTOR'],
                'SHOW_DISCOUNT_PERCENT' => $arParams['SHOW_DISCOUNT_PERCENT'] === 'Y',
                'ADD_TO_BASKET_ACTION' => $arParams['ADD_TO_BASKET_ACTION'],
                'SHOW_CLOSE_POPUP' => $arParams['SHOW_CLOSE_POPUP'] === 'Y',
                'DISPLAY_COMPARE' => $arParams['DISPLAY_COMPARE'],
                'BIG_DATA' => $item['BIG_DATA'],
                'TEMPLATE_THEME' => $arParams['TEMPLATE_THEME'],
                'VIEW_MODE' => $arResult['TYPE'],
                'USE_SUBSCRIBE' => $showSubscribe,
                'FILL_ITEM_ALL_PRICES' => $arParams['FILL_ITEM_ALL_PRICES'],
                'DEFAULT_PICTURE' => array(
                    'PICTURE' => $item['PRODUCT_PREVIEW'],
                    'PICTURE_SECOND' => $item['PRODUCT_PREVIEW_SECOND']
                ),
                'VISUAL' => array(
                    'ID' => $itemIds['ID'],
                    'PRODUCT_NAME' => $itemIds['PRODUCT_NAME'],
                    'PICT_ID' => $itemIds['PICT'],
                    'PICT_SLIDER_ID' => $itemIds['PICT_SLIDER'],
                    'QUANTITY_ID' => $itemIds['QUANTITY'],
                    'QUANTITY_UP_ID' => $itemIds['QUANTITY_UP'],
                    'QUANTITY_DOWN_ID' => $itemIds['QUANTITY_DOWN'],
                    'QUANTITY_MEASURE' => $itemIds['QUANTITY_MEASURE'],
                    'QUANTITY_LIMIT' => $itemIds['QUANTITY_LIMIT'],
                    'QUANTITY_BLOCK' => $itemIds['QUANTITY_BLOCK'],
                    'PRICE_ID' => $itemIds['PRICE'],
                    'PRICE_OLD_ID' => $itemIds['PRICE_OLD'],
                    'TREE_ID' => $itemIds['PROP_DIV'],
                    'TREE_ITEM_ID' => $itemIds['PROP'],
                    'BUY_ID' => $itemIds['BUY_LINK'],
                    'DSC_PERC' => $itemIds['DSC_PERC'],
                    'SECOND_DSC_PERC' => $itemIds['SECOND_DSC_PERC'],
                    'DISPLAY_PROP_DIV' => $itemIds['DISPLAY_PROP_DIV'],
                    'NOT_AVAILABLE_MESS' => $itemIds['NOT_AVAILABLE_MESS'],
                    'COMPARE_LINK_ID' => $itemIds['COMPARE_LINK'],
                    'SUBSCRIBE_ID' => $itemIds['SUBSCRIBE_LINK'],
                    'OFFERS_POPUP' => $itemIds['OFFERS_POPUP'],
                    'OFFERS_POPUP_OPEN_BUTTON' => $itemIds['OFFERS_POPUP_OPEN_BUTTON'],
                    'OFFERS_POPUP_CLOSE_BUTTON' => $itemIds['OFFERS_POPUP_CLOSE_BUTTON'],
                    'OFFERS_POPUP_PICTURE' => $itemIds['OFFERS_POPUP_PICTURE'],
                    'OFFERS_POPUP_SLIDER' => $itemIds['OFFERS_POPUP_SLIDER'],
                    'OFFERS_POPUP_PRICE_LIST' => $itemIds['OFFERS_POPUP_PRICE_LIST'],
                ),
                'BASKET' => array(
                    'QUANTITY' => $arParams['PRODUCT_QUANTITY_VARIABLE'],
                    'PROPS' => $arParams['PRODUCT_PROPS_VARIABLE'],
                    'SKU_PROPS' => $item['OFFERS_PROP_CODES'],
                    'BASKET_URL' => $arParams['~BASKET_URL'],
                    'ADD_URL_TEMPLATE' => $arParams['~ADD_URL_TEMPLATE'],
                    'BUY_URL_TEMPLATE' => $arParams['~BUY_URL_TEMPLATE']
                ),
                'PRODUCT' => array(
                    'ID' => $item['ID'],
                    'NAME' => $productTitle,
                    'DETAIL_PAGE_URL' => $item['DETAIL_PAGE_URL'],
                    'MORE_PHOTO' => $item['MORE_PHOTO'],
                    'MORE_PHOTO_COUNT' => $item['MORE_PHOTO_COUNT']
                ),
                'OFFERS' => array(),
                'OFFER_SELECTED' => 0,
                'TREE_PROPS_CODES' => $skuPropsCodes,
                'TREE_PROPS' => array(),
                'USE_SKU_TITLE' => $arParams['USE_SKU_TITLE'],
                'USE_SKU_DISTINCT_URL' => $arParams['USE_SKU_DISTINCT_URL'],
                'USE_SKU_SEO' => $arParams['USE_SKU_DISTINCT_URL']
            );

            if ($arParams['PRODUCT_DISPLAY_MODE'] === 'Y' && !empty($item['OFFERS_PROP'])) {
                $jsParams['SHOW_QUANTITY'] = $arParams['USE_PRODUCT_QUANTITY'];
                $jsParams['SHOW_SKU_PROPS'] = $item['OFFERS_PROPS_DISPLAY'];
                $jsParams['OFFERS'] = $item['JS_OFFERS'];
                $jsParams['OFFER_SELECTED'] = $item['OFFERS_SELECTED'];
                $jsParams['TREE_PROPS'] = $skuProps;
            }
        }

        $jsParams['SCROLL_ON_HOVER'] = $arParams['SCROLL_ON_HOVER'];
        $jsParams['SKU_VARIANT'] = $arParams['SKU_VISUAL_VARIANT'];

        if ($arParams['DISPLAY_COMPARE']) {
            $jsParams['COMPARE'] = array(
                'COMPARE_URL_TEMPLATE' => $arParams['~COMPARE_URL_TEMPLATE'],
                'COMPARE_DELETE_URL_TEMPLATE' => $arParams['~COMPARE_DELETE_URL_TEMPLATE'],
                'COMPARE_PATH' => $arParams['COMPARE_PATH']
            );
        }

        if ($item['BIG_DATA']) {
            $jsParams['PRODUCT']['RCM_ID'] = $item['RCM_ID'];
        }

        $jsParams['PRODUCT_DISPLAY_MODE'] = $arParams['PRODUCT_DISPLAY_MODE'];
        $jsParams['USE_ENHANCED_ECOMMERCE'] = $arParams['USE_ENHANCED_ECOMMERCE'];
        $jsParams['DATA_LAYER_NAME'] = $arParams['DATA_LAYER_NAME'];
        $jsParams['BRAND_PROPERTY'] = !empty($item['DISPLAY_PROPERTIES'][$arParams['BRAND_PROPERTY']])
            ? $item['DISPLAY_PROPERTIES'][$arParams['BRAND_PROPERTY']]['DISPLAY_VALUE']
            : null;

        $jsParams['IS_FACEBOOK_CONVERSION_CUSTOMIZE_PRODUCT_EVENT_ENABLED'] =
            $arResult['IS_FACEBOOK_CONVERSION_CUSTOMIZE_PRODUCT_EVENT_ENABLED'];

        $jsParams['PRICE_TABLE_TITLE'] = $arParams['MESS_PRICE_RANGES_TITLE'] ?: Loc::getMessage(
            'PRICE_TABLE_RANGES_TITLE'
        );
        $jsParams['USE_RATIO_IN_RANGES'] = $useRatio;

        if ($useAllPrices) {
            $jsParams['ALL_PRICES_NAMES'] = $arResult['ITEM']['ALL_PRICES_NAMES'];
        }

        $templateData = array(
            'JS_OBJ' => $obName,
            'ITEM' => array(
                'ID' => $item['ID'],
                'IBLOCK_ID' => $item['IBLOCK_ID'],
            ),
        );
        if ($haveOffers) {
            $templateData['ITEM']['OFFERS_SELECTED'] = $item['OFFERS_SELECTED'];
            $templateData['ITEM']['JS_OFFERS'] = $item['JS_OFFERS'];
        }

        $jsParams['COMPONENT_ID'] = $arParams['COMPONENT_ID'];
        ?>
        <script>
            BX.ready(() => window.<?= $obName ?> = new JCCatalogItem(<?= CUtil::PhpToJSObject(
                $jsParams,
                false,
                true
            ) ?>))
        </script>
    </div>
    <?php
    unset($item, $actualItem, $minOffer, $itemIds, $jsParams);
}
