<?php

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}

/**
 * @var CBitrixComponentTemplate $this
 * @var CatalogSectionComponent $component
 * @var array $arParams
 * @var array $arResult
 */

use Bitrix\Catalog\ProductTable;
use Bitrix\Main\{ArgumentException, Loader};
use Sotbit\B2C\{Catalog\ComponentHelper, Helper\Config, Public\Image};
use Sotbit\B2C\Public\Enums\Animation;

Loader::includeModule('sotbit.b2c');

$component = $this->getComponent();
$arParams = $component->applyTemplateModifications();

// 'FILL_ITEM_ALL_PRICES' parameter fills all price types for product, even if they are not available for current user
$allPriceTypesFilled = $arParams['FILL_ITEM_ALL_PRICES'] === 'Y' || $arParams['FILL_ITEM_ALL_PRICES'] === true;

$arParams['ARTICLE_PROPERTY'] = Config::get('CATALOG_ARTICLE_PROPERTY');
$arParams['OFFER_ARTICLE_PROPERTY'] = Config::get('CATALOG_OFFER_ARTICLE_PROPERTY');
$arResult['ANIMATION_CLASS'] = Animation::tryFromIndex($arParams['ITEM_HOVER_ANIMATION'])?->getCssClassName();

foreach ($arResult['ITEMS'] as &$item) {
    $hasOffers = $item['PRODUCT']['TYPE'] === ProductTable::TYPE_SKU;

    if ($allPriceTypesFilled) {
        ComponentHelper::fillItemAllPrices($arParams, $item);
    }

    // fix Bitrix leaving only 5 images in MORE_PHOTO
    unset($item['MORE_PHOTO']);
    $item['MORE_PHOTO'] = ComponentHelper::getSliderForItem(
        $item,
        $arParams['ADD_PICT_PROP']
    ) ?: [$arResult['DEFAULT_PICTURE']];
    $item['MORE_PHOTO_COUNT'] = count($item['MORE_PHOTO']);

    // resize images
    if ($item['DETAIL_PICTURE']['ID']) {
        $item['DETAIL_PICTURE'] = Image::resize(
            $item['DETAIL_PICTURE'],
            [
                'width' => 260,
                'height' => 260,
            ]
        );
    }

    if ($item['PREVIEW_PICTURE']['ID']) {
        $item['PREVIEW_PICTURE'] = Image::resize(
            $item['PREVIEW_PICTURE'],
            [
                'width' => 260,
                'height' => 260,
            ]
        );
    }

    if ($item['MORE_PHOTO']) {
        foreach ($item['MORE_PHOTO'] as &$morePhoto) {
            if (!$morePhoto['ID']) {
                continue;
            }

            try {
                $morePhoto = Image::resize(
                    $morePhoto,
                    [
                        'width' => 260,
                        'height' => 260,
                    ]
                );
            } catch (ArgumentException) {
                unset($morePhoto);
            }
        }

        unset($morePhoto);
    }

    if ($hasOffers) {
        $productArticlePropertyCode = $arParams['ARTICLE_PROPERTY'];
        $skuArticlePropertyCode = $arParams['OFFER_ARTICLE_PROPERTY'];
        // index here means array index, not $offer['ID']
        $cheapestOfferIndex = 0;
        $smallestOfferPrice = 0;

        foreach ($item['OFFERS'] as $offerIndex => &$offer) {
            if (!$offer['DISPLAY_PROPERTIES'][$skuArticlePropertyCode]['VALUE']) {
                $offer['DISPLAY_PROPERTIES'][$skuArticlePropertyCode] = $item['DISPLAY_PROPERTIES'][$productArticlePropertyCode];
                $item['JS_OFFERS'][$offerIndex]['DISPLAY_PROPERTIES'][$skuArticlePropertyCode] = $item['DISPLAY_PROPERTIES'][$productArticlePropertyCode];
            }

            unset($offer['MORE_PHOTO']);
            $offer['MORE_PHOTO'] = ComponentHelper::getSliderForItem(
                $offer,
                $arParams['OFFER_ADD_PICT_PROP']
            ) ?: $item['MORE_PHOTO'];
            $offer['MORE_PHOTO_COUNT'] = count($offer['MORE_PHOTO']);

            $item['JS_OFFERS'][$offerIndex]['MORE_PHOTO'] = $offer['MORE_PHOTO'];
            $item['JS_OFFERS'][$offerIndex]['MORE_PHOTO_COUNT'] = $offer['MORE_PHOTO_COUNT'];

            if ($offer['DETAIL_PICTURE']['ID']) {
                $offer['DETAIL_PICTURE'] = Image::resize(
                    $offer['DETAIL_PICTURE'],
                    [
                        'width' => 260,
                        'height' => 260,
                    ]
                );
            }

            if ($offer['PREVIEW_PICTURE']['ID']) {
                $offer['PREVIEW_PICTURE'] = Image::resize(
                    $offer['PREVIEW_PICTURE'],
                    [
                        'width' => 260,
                        'height' => 260,
                    ]
                );
            }

            foreach ($offer['MORE_PHOTO'] as $morePhotoIndex => &$morePhoto) {
                if (!$morePhoto['ID']) {
                    continue;
                }

                try {
                    $resizedPhoto = Image::resize(
                        $morePhoto,
                        [
                            'width' => 260,
                            'height' => 260,
                        ]
                    );
                } catch (ArgumentException) {
                    unset($item['JS_OFFERS'][$offerIndex]['MORE_PHOTO'][$morePhotoIndex]);
                }

                $item['JS_OFFERS'][$offerIndex]['MORE_PHOTO'][$morePhotoIndex] = $resizedPhoto;
            }

            unset($morePhotoIndex, $morePhoto);

            /**
             * Determine offer with the smallest price available and set it
             * as current offer (change OFFERS_SELECTED and OFFER_ID_SELECTED)
             */
            if ($cheapestOfferIndex === null) {
                $cheapestOfferIndex = $offerIndex;
            } else {
                /**
                 * ITEM_PRICES and ITEM_ALL_PRICES have different structure, the first level of ITEM_ALL_PRICES array
                 * has price blocks (differentiated by quantity, e.g. 1-9, 10-99 etc.), which have a key named PRICES,
                 * that's why we have to use array_map twice, first for a price block, then for the actual prices
                 */
                if ($allPriceTypesFilled) {
                    if (!$offer['ITEM_ALL_PRICES']) {
                        continue;
                    }

                    $offerMinimalQuantityPriceItems = current(
                        array_map(fn($priceBlock) => $priceBlock['PRICES'], $offer['ITEM_ALL_PRICES'])
                    );
                    $offerPrices = array_map(fn($price) => $price['RATIO_PRICE'], $offerMinimalQuantityPriceItems);
                } else {
                    $offerPrices = array_map(fn($price) => $price['RATIO_PRICE'], $offer['ITEM_PRICES']);

                    if (!$offerPrices) {
                        continue;
                    }
                }

                $smallestPrice = min($offerPrices);

                if (!$smallestOfferPrice) {
                    $smallestOfferPrice = $smallestPrice;
                } else {
                    $smallestOfferPrice = min($smallestOfferPrice, $smallestPrice);

                    if ($smallestOfferPrice === $smallestPrice) {
                        $cheapestOfferIndex = $offerIndex;
                    }
                }
            }
        }

        $item['OFFERS_SELECTED'] = $cheapestOfferIndex;
        $item['OFFER_ID_SELECTED'] = $item['OFFERS'][$cheapestOfferIndex]['ID'];

        if ($arParams['USE_SKU_DISTINCT_URL'] === 'Y') {
            // index here means array index, not $offer['ID']
            $selectedOfferIndex = $item['OFFERS_SELECTED'];
            $offersUrlMode = ComponentHelper::getOffersUrlMode();
            $selectedOfferId = $item['OFFERS'][$selectedOfferIndex]['ID'];

            if (isset($selectedOfferIndex) && isset($selectedOfferId)) {
                if ($offersUrlMode === 'CODE') {
                    $selectedOfferCode = $item['OFFERS'][$selectedOfferIndex]['CODE'];

                    $item['DETAIL_PAGE_URL'] = $item['DETAIL_PAGE_URL'] . "$selectedOfferCode/";
                } elseif ($offersUrlMode === 'ID') {
                    $item['DETAIL_PAGE_URL'] = $item['DETAIL_PAGE_URL'] . "$selectedOfferId/";
                }
            }
        }

        unset($offerIndex, $item['DISPLAY_PROPERTIES'][$productArticlePropertyCode], $offer);
    }
}

unset($item);
