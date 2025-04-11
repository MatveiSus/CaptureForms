(function (window) {
    'use strict';

    if (window.JCCatalogItem)
        return;

    window.JCCatalogItem = function (arParams) {
        this.productType = 0;
        this.showQuantity = true;
        this.showAbsent = true;
        this.showOldPrice = false;
        this.showMaxQuantity = 'N';
        this.relativeQuantityFactor = 5;
        this.showPercent = false;
        this.showSkuProps = false;
        this.basketAction = 'ADD';
        this.showClosePopup = false;
        this.useCompare = false;
        this.showSubscription = false;
        this.visual = {
            ID: '',
            PICT_ID: '',
            SECOND_PICT_ID: '',
            PICT_SLIDER_ID: '',
            QUANTITY_ID: '',
            QUANTITY_UP_ID: '',
            QUANTITY_DOWN_ID: '',
            QUANTITY_BLOCK: '',
            PRICE_ID: '',
            PRICE_OLD_ID: '',
            DSC_PERC: '',
            SECOND_DSC_PERC: '',
            DISPLAY_PROP_DIV: '',
            BASKET_PROP_DIV: '',
            SUBSCRIBE_ID: ''
        };
        this.product = {
            checkQuantity: false,
            maxQuantity: 0,
            stepQuantity: 1,
            isDblQuantity: false,
            canBuy: true,
            name: '',
            pict: {},
            id: 0,
            addUrl: '',
            buyUrl: ''
        };

        this.basketMode = '';
        this.basketData = {
            useProps: false,
            emptyProps: false,
            quantity: 'quantity',
            props: 'prop',
            basketUrl: '',
            sku_props: '',
            sku_props_var: 'basket_props',
            add_url: '',
            buy_url: ''
        };

        this.compareData = {
            compareUrl: '',
            compareDeleteUrl: '',
            comparePath: ''
        };

        this.defaultPict = {
            pict: null,
        };
        this.touch = null;

        this.quantityDelay = null;
        this.quantityTimer = null;

        this.checkQuantity = false;
        this.maxQuantity = 0;
        this.minQuantity = 0;
        this.stepQuantity = 1;
        this.isDblQuantity = false;
        this.canBuy = true;
        this.precision = 6;
        this.precisionFactor = Math.pow(10, this.precision);
        this.bigData = false;
        this.fullDisplayMode = false;
        this.viewMode = '';
        this.templateTheme = '';

        this.currentPriceMode = '';
        this.currentPrices = [];
        this.currentPriceSelected = 0;
        this.currentQuantityRanges = [];
        this.currentQuantityRangeSelected = 0;

        this.offers = [];
        this.offerNum = 0;
        this.treeProps = [];
        this.selectedValues = {};

        this.obProduct = null;
        this.blockNodes = {};
        this.obQuantity = null;
        this.obQuantityUp = null;
        this.obQuantityDown = null;
        this.obQuantityLimit = {};
        this.obPict = null;
        this.obPictSlider = null;
        this.obPrice = null;
        this.obTree = null;
        this.obBuyBtn = null;
        this.obNotAvail = null;
        this.obSubscribe = null;
        this.obDscPerc = null;
        this.obSkuProps = null;
        this.obFavorite = [];
        this.obCompare = [];

        this.basketUrl = '';
        this.basketParams = {};
        this.basketActionProps = {};
        this.hoverTimer = null;
        this.hoverStateChangeForbidden = false;
        this.mouseX = null;
        this.mouseY = null;

        this.useEnhancedEcommerce = false;
        this.dataLayerName = 'dataLayer';
        this.brandProperty = false;
        this.offersPopupOverlay = null;

        this.errorCode = 0;

        /* Quantity of items to add to basket at one time,
           if user clicks "add button" multiple times in a row */
        this.basketActionItemQuantity = 0;

        /* Timeout ID for add/delete from basket actions */
        this.debouncedBasketActionTimeout = null;

        this.sliders = new Map();
        this.isOffersPopupOpen = false;
        this.isOffersPopupFirstOpen = false;

        if (typeof arParams === 'object') {
            if (arParams.PRODUCT_TYPE) {
                this.productType = parseInt(arParams.PRODUCT_TYPE, 10);
            }

            this.componentId = arParams.COMPONENT_ID;
            this.showQuantity = arParams.SHOW_QUANTITY;
            this.showAbsent = arParams.SHOW_ABSENT;
            this.showOldPrice = arParams.SHOW_OLD_PRICE;
            this.showMaxQuantity = arParams.SHOW_MAX_QUANTITY;
            this.relativeQuantityFactor = parseInt(arParams.RELATIVE_QUANTITY_FACTOR);
            this.showPercent = arParams.SHOW_DISCOUNT_PERCENT;
            this.showSkuProps = arParams.SHOW_SKU_PROPS;
            this.showSubscription = arParams.USE_SUBSCRIBE;

            if (arParams.ADD_TO_BASKET_ACTION) {
                this.basketAction = arParams.ADD_TO_BASKET_ACTION;
            }

            this.showClosePopup = arParams.SHOW_CLOSE_POPUP;
            this.useCompare = arParams.DISPLAY_COMPARE;
            this.fullDisplayMode = arParams.PRODUCT_DISPLAY_MODE === 'Y';
            this.bigData = arParams.BIG_DATA;
            this.viewMode = arParams.VIEW_MODE || '';
            this.templateTheme = arParams.TEMPLATE_THEME || '';
            this.useEnhancedEcommerce = arParams.USE_ENHANCED_ECOMMERCE === 'Y';
            this.dataLayerName = arParams.DATA_LAYER_NAME;
            this.brandProperty = arParams.BRAND_PROPERTY;

            this.fillItemAllPrices = arParams.FILL_ITEM_ALL_PRICES === 'Y' || arParams.FILL_ITEM_ALL_PRICES === true;
            this.scrollSliderOnHover = arParams.SCROLL_ON_HOVER === 'Y';
            this.skuVariant = arParams.SKU_VARIANT;

            this.visual = arParams.VISUAL;

            switch (this.productType) {
                case 0: // no catalog
                case 1: // product
                case 2: // set
                case 7: // service
                    if (arParams.PRODUCT && typeof arParams.PRODUCT === 'object') {
                        this.currentPriceMode = arParams.PRODUCT.ITEM_PRICE_MODE;
                        this.currentPrices = arParams.PRODUCT.ITEM_PRICES;
                        this.allCurrentPrices = arParams.PRODUCT.ITEM_ALL_PRICES;
                        this.currentPriceSelected = arParams.PRODUCT.ITEM_PRICE_SELECTED;
                        this.currentQuantityRanges = arParams.PRODUCT.ITEM_QUANTITY_RANGES;
                        this.currentQuantityRangeSelected = arParams.PRODUCT.ITEM_QUANTITY_RANGE_SELECTED;

                        if (this.showQuantity) {
                            this.product.checkQuantity = arParams.PRODUCT.CHECK_QUANTITY;
                            this.product.isDblQuantity = arParams.PRODUCT.QUANTITY_FLOAT;

                            if (this.product.checkQuantity) {
                                this.product.maxQuantity = (this.product.isDblQuantity ? parseFloat(arParams.PRODUCT.MAX_QUANTITY) : parseInt(arParams.PRODUCT.MAX_QUANTITY, 10));
                            }

                            this.product.stepQuantity = (this.product.isDblQuantity ? parseFloat(arParams.PRODUCT.STEP_QUANTITY) : parseInt(arParams.PRODUCT.STEP_QUANTITY, 10));

                            this.checkQuantity = this.product.checkQuantity;
                            this.isDblQuantity = this.product.isDblQuantity;
                            this.stepQuantity = this.product.stepQuantity;
                            this.maxQuantity = this.product.maxQuantity;
                            this.minQuantity = this.currentPriceMode === 'Q'
                                ? parseFloat(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY)
                                : this.stepQuantity;

                            if (this.isDblQuantity) {
                                this.stepQuantity = Math.round(this.stepQuantity * this.precisionFactor) / this.precisionFactor;
                            }
                        }

                        this.product.canBuy = arParams.PRODUCT.CAN_BUY;

                        if (arParams.PRODUCT.MORE_PHOTO_COUNT) {
                            this.product.morePhotoCount = arParams.PRODUCT.MORE_PHOTO_COUNT;
                            this.product.morePhoto = arParams.PRODUCT.MORE_PHOTO;
                        }

                        if (arParams.PRODUCT.RCM_ID) {
                            this.product.rcmId = arParams.PRODUCT.RCM_ID;
                        }

                        this.canBuy = this.product.canBuy;
                        this.product.name = arParams.PRODUCT.NAME;
                        this.product.pict = arParams.PRODUCT.PICT;
                        this.product.id = arParams.PRODUCT.ID;
                        this.product.DETAIL_PAGE_URL = arParams.PRODUCT.DETAIL_PAGE_URL;

                        if (arParams.PRODUCT.ADD_URL) {
                            this.product.addUrl = arParams.PRODUCT.ADD_URL;
                        }

                        if (arParams.PRODUCT.BUY_URL) {
                            this.product.buyUrl = arParams.PRODUCT.BUY_URL;
                        }

                        if (arParams.BASKET && typeof arParams.BASKET === 'object') {
                            this.basketData.useProps = arParams.BASKET.ADD_PROPS;
                            this.basketData.emptyProps = arParams.BASKET.EMPTY_PROPS;
                        }
                    } else {
                        this.errorCode = -1;
                    }

                    break;
                case 3: // sku
                    if (arParams.PRODUCT && typeof arParams.PRODUCT === 'object') {
                        this.product.name = arParams.PRODUCT.NAME;
                        this.product.id = arParams.PRODUCT.ID;
                        this.product.DETAIL_PAGE_URL = arParams.PRODUCT.DETAIL_PAGE_URL;

                        if (arParams.PRODUCT.RCM_ID) {
                            this.product.rcmId = arParams.PRODUCT.RCM_ID;
                        }
                    }

                    if (arParams.OFFERS && BX.type.isArray(arParams.OFFERS)) {
                        this.offers = arParams.OFFERS;
                        this.offerNum = 0;

                        if (arParams.OFFER_SELECTED) {
                            this.offerNum = parseInt(arParams.OFFER_SELECTED, 10);
                        }

                        if (isNaN(this.offerNum)) {
                            this.offerNum = 0;
                        }

                        if (arParams.TREE_PROPS) {
                            this.treeProps = arParams.TREE_PROPS;
                        }

                        if (arParams.TREE_PROPS_CODES) {
                            this.treePropsCodes = arParams.TREE_PROPS_CODES;
                        }

                        if (arParams.DEFAULT_PICTURE) {
                            this.defaultPict.pict = arParams.DEFAULT_PICTURE.PICTURE;
                        }

                        if (arParams.USE_SKU_TITLE) {
                            this.useSkuTitle = arParams.USE_SKU_TITLE;
                        }

                        if (arParams.USE_SKU_DISTINCT_URL) {
                            this.useSkuDistinctUrl = arParams.USE_SKU_DISTINCT_URL;
                        }

                        if (arParams.USE_SKU_SEO) {
                            this.useSkuSeo = arParams.USE_SKU_SEO;
                        }
                    }

                    break;
                default:
                    this.errorCode = -1;
            }
            if (arParams.BASKET && typeof arParams.BASKET === 'object') {
                if (arParams.BASKET.QUANTITY) {
                    this.basketData.quantity = arParams.BASKET.QUANTITY;
                }

                if (arParams.BASKET.PROPS) {
                    this.basketData.props = arParams.BASKET.PROPS;
                }

                if (arParams.BASKET.BASKET_URL) {
                    this.basketData.basketUrl = arParams.BASKET.BASKET_URL;
                }

                if (3 === this.productType) {
                    if (arParams.BASKET.SKU_PROPS) {
                        this.basketData.sku_props = arParams.BASKET.SKU_PROPS;
                    }
                }

                if (arParams.BASKET.ADD_URL_TEMPLATE) {
                    this.basketData.add_url = arParams.BASKET.ADD_URL_TEMPLATE;
                }

                if (arParams.BASKET.BUY_URL_TEMPLATE) {
                    this.basketData.buy_url = arParams.BASKET.BUY_URL_TEMPLATE;
                }

                if (this.basketData.add_url === '' && this.basketData.buy_url === '') {
                    this.errorCode = -1024;
                }
            }

            if (this.useCompare) {
                if (arParams.COMPARE && typeof arParams.COMPARE === 'object') {
                    if (arParams.COMPARE.COMPARE_PATH) {
                        this.compareData.comparePath = arParams.COMPARE.COMPARE_PATH;
                    }

                    if (arParams.COMPARE.COMPARE_URL_TEMPLATE) {
                        this.compareData.compareUrl = arParams.COMPARE.COMPARE_URL_TEMPLATE;
                    } else {
                        this.useCompare = false;
                    }

                    if (arParams.COMPARE.COMPARE_DELETE_URL_TEMPLATE) {
                        this.compareData.compareDeleteUrl = arParams.COMPARE.COMPARE_DELETE_URL_TEMPLATE;
                    } else {
                        this.useCompare = false;
                    }
                } else {
                    this.useCompare = false;
                }
            }

            this.isFacebookConversionCustomizeProductEventEnabled
                = arParams.IS_FACEBOOK_CONVERSION_CUSTOMIZE_PRODUCT_EVENT_ENABLED;

            this.priceTableTitle = arParams.PRICE_TABLE_TITLE;

            if (arParams.ALL_PRICES_NAMES) {
                this.allItemsNames = arParams.ALL_PRICES_NAMES;
            }

            this.usePriceRanges = arParams.USE_PRICE_COUNT;
            this.useRatioInRanges = arParams.USE_RATIO_IN_RANGES;
        }

        if (this.errorCode === 0) {
            BX.ready(BX.delegate(this.init, this));
        } else {
            console.error(`Product card render error, code: ${this.errorCode}`);
        }
    };

    window.JCCatalogItem.prototype = {
        init: function () {
            var i = 0,
                treeItems = null;

            this.obProduct = BX(this.visual.ID);
            if (!this.obProduct) {
                this.errorCode = -1;
            }

            this.obPictSlider = BX(this.visual.PICT_SLIDER_ID);
            this.obPict = BX(this.visual.PICT_ID);

            if (!this.obPict && !this.obPictSlider) {
                this.errorCode = -2;
            }

            this.obPrice = this.obProduct.querySelectorAll('[data-entity="price"]');
            this.obPriceOld = this.obProduct.querySelectorAll('[data-entity="price-old"]');

            if (!this.obPrice.length) {
                this.errorCode = -16;
            }

            if (this.usePriceRanges) {
                this.obPriceRanges = this.getEntities(
                    this.obProduct,
                    "price-table"
                );
            }

            this.obOffersPopup = BX(this.visual.OFFERS_POPUP);
            this.obOffersPopupOpenButton = BX(this.visual.OFFERS_POPUP_OPEN_BUTTON);
            this.obOffersPopupCloseButton = BX(this.visual.OFFERS_POPUP_CLOSE_BUTTON);
            this.obOffersPopupPicture = BX(this.visual.OFFERS_POPUP_PICTURE);
            this.obOffersPopupSliderContainer = BX(this.visual.OFFERS_POPUP_SLIDER);
            this.obOffersPriceList = BX(this.visual.OFFERS_POPUP_PRICE_LIST);

            if (this.obOffersPopupCloseButton) {
                this.obOffersPopupCloseButton.addEventListener('click', this.closeOffersPopup.bind(this));
            }

            if (this.showQuantity && this.visual.QUANTITY_ID) {
                this.obQuantity = BX(this.visual.QUANTITY_ID);
                this.blockNodes.quantity = BX(this.visual.QUANTITY_BLOCK);

                if (this.visual.QUANTITY_UP_ID) {
                    this.obQuantityUp = BX(this.visual.QUANTITY_UP_ID);
                }

                if (this.visual.QUANTITY_DOWN_ID) {
                    this.obQuantityDown = BX(this.visual.QUANTITY_DOWN_ID);
                }
            }

            if (this.visual.QUANTITY_LIMIT && this.showMaxQuantity !== "N") {
                this.obQuantityLimit.all = this.getEntities(this.obProduct, this.visual.QUANTITY_LIMIT);
                if (this.obQuantityLimit.all.length) {
                    this.obQuantityLimit.value = this.getEntities(
                        this.obProduct,
                        "quantity-limit-value"
                    );
                    if (!this.obQuantityLimit.value.length) {
                        this.obQuantityLimit.all = null;
                    }
                }
            }

            if (this.visual.BUY_ID) {
                this.obBuyBtn = BX(this.visual.BUY_ID);
            }

            if (this.visual.TREE_ID) {
                this.obTree = BX(this.visual.TREE_ID);
                if (!this.obTree) {
                    this.errorCode = -256;
                }
            }

            if (this.visual.QUANTITY_MEASURE) {
                this.obMeasure = BX(this.visual.QUANTITY_MEASURE);
            }

            this.obNotAvail = this.getEntities(this.obProduct, this.visual.NOT_AVAILABLE_MESS);

            if (this.showSubscription) {
                this.obSubscribe = BX(this.visual.SUBSCRIBE_ID);
            }

            if (this.showPercent) {
                this.obDscPerc = this.obProduct.querySelectorAll('[data-entity="price-discount-percent"]');
            }

            if (this.showSkuProps) {
                if (this.visual.DISPLAY_PROP_DIV) {
                    this.obSkuProps = this.getEntities(this.obProduct, this.visual.DISPLAY_PROP_DIV);
                }
            }

            if (this.errorCode === 0) {
                if (this.bigData) {
                    var links = BX.findChildren(this.obProduct, {tag: 'a'}, true);
                    if (links) {
                        for (i in links) {
                            if (links.hasOwnProperty(i)) {
                                if (links[i].getAttribute('href') == this.product.DETAIL_PAGE_URL) {
                                    BX.bind(links[i], 'click', BX.proxy(this.rememberProductRecommendation, this));
                                }
                            }
                        }
                    }
                }

                if (this.showQuantity) {
                    if (this.obQuantityUp) {
                        BX.bind(this.obQuantityUp, 'click', BX.delegate(this.quantityUp, this));
                    }

                    if (this.obQuantityDown) {
                        BX.bind(this.obQuantityDown, 'click', BX.delegate(this.quantityDown, this));
                    }

                    if (this.obQuantity) {
                        BX.bind(this.obQuantity, 'change', BX.delegate(this.quantityChange, this));
                        BX.bind(this.obQuantity, 'focus', BX.delegate(this.quantityInputFocus, this));
                    }
                }

                setTimeout(() => this.initFavorite(), 0);
                this.initOneClick();

                const morePhotoCount = this.productType === 3
                    ? parseInt(this.offers[this.offerNum]?.MORE_PHOTO_COUNT)
                    : parseInt(this.product.morePhotoCount);

                if (morePhotoCount > 1 && this.obPictSlider) {
                    this.initProductSlider();
                }

                switch (this.productType) {
                    case 0: // no catalog
                    case 1: // product
                    case 2: // set
                    case 7: // service
                        this.setPrice();
                        break;
                    case 3: // sku
                        if (this.offers.length > 0) {
                            const treeItems = BX.findChildren(this.obTree, {tagName: 'li'}, true);

                            if (treeItems && treeItems.length) {
                                for (let i = 0; i < treeItems.length; i++) {
                                    BX.bind(treeItems[i], 'click', BX.delegate(this.selectOfferProp, this));
                                }
                            }

                            this.setCurrent();
                        }
                        break;
                }

                if (this.productType === 3 && this.obOffersPopupOpenButton && this.skuVariant === 'PREVIEW') {
                    BX.bind(this.obOffersPopupOpenButton, 'click', this.openOffersPopup.bind(this));
                }

                if (this.obBuyBtn) {
                    if (this.basketAction === 'ADD') {
                        /* ex add2Basket */
                        BX.bind(this.obBuyBtn, 'click', this.doBasketAction.bind(this, 'ADD'));
                    } else {
                        /* ex buyBasket */
                        BX.bind(this.obBuyBtn, 'click', this.doBasketAction.bind(this, 'BUY'));
                    }
                }

                if (this.useCompare) {
                    this.obCompare = this.obProduct.querySelectorAll(`[data-compared]`);
                    if (this.obCompare.length) {
                        this.obCompare.forEach((button) => {
                            button.addEventListener('click', () => this.compare());
                        });
                    }

                    BX.addCustomEvent('onCatalogDeleteCompare', (event) => this.checkDeletedCompare(event));
                }
            } else {
                if (this.errorCode === -256) {
                    this.obBuyBtn && (this.obBuyBtn.style.display = 'none');
                }

                console.error(`Product card render error, code: ${this.errorCode}`);
            }
        },

        getEntity: function (parent, entity, additionalFilter) {
            if (!parent || !entity) return null;

            additionalFilter = additionalFilter || "";

            return parent.querySelector(
                additionalFilter + '[data-entity="' + entity + '"]'
            );
        },

        getEntities: function (parent, entity, additionalFilter) {
            if (!parent || !entity) return {length: 0};

            additionalFilter = additionalFilter || "";

            return parent.querySelectorAll(
                additionalFilter + '[data-entity="' + entity + '"]'
            );
        },

        openOffersPopup: function () {
            /* when popup is opened the first time, basket products data is fetched */
            if (!this.isOffersPopupFirstOpen) {
                // @todo BX.ajax.runAction()

                this.isOffersPopupFirstOpen = true;
            }

            this.showOffersPopup();
            this.sliders.get(this.obOffersPopupSliderContainer)?.update();
        },

        showOffersPopup: function () {
            this.offersPopupOverlay = BX.Sotbit.B2C.showOverlay();
            BX.Sotbit.B2C.fixBodyScroll();

            BX.Sotbit.B2C.showElement(this.obOffersPopup, {
                callback: (element) => {
                    if (parseInt(this.product.morePhotoCount) > 1) {
                        this.initOffersPopupSlider();
                    }

                    document.addEventListener('click', (event) => {
                        if (!event.composedPath().includes(element) && this.isOffersPopupOpen) {
                            this.closeOffersPopup();
                        }
                    });

                    this.isOffersPopupOpen = true;
                }
            });
        },

        closeOffersPopup: function () {
            this.offersPopupOverlay?.hide();
            BX.Sotbit.B2C.unfixBodyScroll();
            BX.Sotbit.B2C.hideElement(this.obOffersPopup);

            this.isOffersPopupOpen = false;
        },

        initFavorite: function () {
            this.obFavorite = this.obProduct.querySelectorAll('[data-favorite]');
            if (this.obFavorite.length) {
                this.obFavorite.forEach(favoriteButton => {
                    BX.bind(favoriteButton, 'click', BX.proxy(this.toggleFavorite, this));
                });

                if (this.productType === 3) {
                    if (this.obFavorite[0].dataset.favorite === 'true') {
                        this.offers[this.offerNum].IS_FAVORITE = true;
                    }
                }
            }
        },

        setFavorite: async function () {
            if (this.offers[this.offerNum].IS_FAVORITE === undefined) {
                const result = await BX.ajax.runAction('sotbit:b2c.favorite.check', {
                    data: {
                        productId: this.offers[this.offerNum].ID,
                        siteId: BX.message('SITE_ID')
                    }
                });

                if (result.status === 'success') {
                    this.offers[this.offerNum].IS_FAVORITE = result.data;
                } else {
                    BX.Sotbit.B2C.showMessage(BX.message('TITLE_ERROR'), {icon: 'error'});
                }
            }

            if (this.offers[this.offerNum].IS_FAVORITE) {
                if (this.obFavorite.length) {
                    this.obFavorite.forEach(favoriteButton => {
                        favoriteButton.classList.add('active');
                        favoriteButton.setAttribute('title', BX.message('IN_FAVORITE'));
                        favoriteButton.dataset.favorite = true;
                    });
                }
            } else {
                if (this.obFavorite.length) {
                    this.obFavorite.forEach(favoriteButton => {
                        favoriteButton.classList.remove('active');
                        favoriteButton.setAttribute('title', BX.message('TO_FAVORITE'));
                        favoriteButton.dataset.favorite = false;
                    });
                }
            }
        },

        toggleFavorite: function (event) {
            event.preventDefault();

            const isFavorite = this.obFavorite[0].dataset.favorite === 'true';

            isFavorite ? this.removeFromFavorite() : this.addToFavorite();
        },

        addToFavorite: function () {
            const data = {
                productId: this.productType === 3 ? this.offers[this.offerNum].ID : this.product.id.toString(),
                siteId: BX.message('SITE_ID')
            };

            if (this.productType === 3) {
                const skuProps = [];

                for (const prop in this.selectedValues) {
                    if (this.selectedValues.hasOwnProperty(prop)) {
                        const propId = prop.slice(prop.indexOf('_') + 1);
                        const propValue = this.selectedValues[prop];
                        const propValueName = this.treeProps.find((item) => +item.ID === +propId)['VALUES'][propValue]['NAME'];

                        skuProps.push({
                            'NAME': this.treePropsCodes[propId].NAME,
                            'CODE': this.treePropsCodes[propId].CODE,
                            'VALUE': propValueName,
                        });
                    }
                }

                data.options = {
                    PROPS: skuProps
                }
            }

            BX.ajax.runAction('sotbit:b2c.favorite.add', {data}).then(result => {
                if (result.status === 'success') {
                    BX.Sotbit.B2C.showMessage(BX.message('TITLE_SUCCESSFUL_FAVORITE'));

                    this.obFavorite.forEach(favoriteButton => {
                        favoriteButton.dataset.favorite = 'true';
                        favoriteButton.setAttribute('title', BX.message('IN_FAVORITE'));
                        favoriteButton.classList.add('active');
                    });

                    this.productType === 3 && (this.offers[this.offerNum].IS_FAVORITE = true);

                    BX.onCustomEvent('OnBasketChange');
                } else {
                    BX.Sotbit.B2C.showMessage(BX.message('TITLE_ERROR'), {icon: 'error'});
                }
            });
        },

        removeFromFavorite: function () {
            BX.ajax.runAction('sotbit:b2c.favorite.remove', {
                data: {
                    productId: this.productType === 3 ? this.offers[this.offerNum].ID : this.product.id.toString(),
                    siteId: BX.message('SITE_ID')
                }
            }).then(result => {
                if (result.status === 'success') {
                    BX.Sotbit.B2C.showMessage(BX.message('TITLE_SUCCESSFUL_FAVORITE_REMOVE'));

                    this.obFavorite.forEach(favoriteButton => {
                        favoriteButton.dataset.favorite = 'false';
                        favoriteButton.setAttribute('title', BX.message('TO_FAVORITE'));
                        favoriteButton.classList.remove('active');
                    });

                    this.productType === 3 && (this.offers[this.offerNum].IS_FAVORITE = false);

                    BX.onCustomEvent('OnBasketChange');
                } else {
                    BX.Sotbit.B2C.showMessage(BX.message('TITLE_ERROR'), {icon: 'error'});
                }
            });
        },

        initOneClick: function () {
            this.obOneClick = this.obProduct.querySelectorAll('[data-oneclick]');
            if (this.obOneClick.length) {
                this.obOneClick.forEach(oneClickButton => {
                    BX.bind(oneClickButton, 'click', () => {
                        BX.Sotbit.B2C.showOneClick({
                            PRODUCT_ID: this.productType === 3 ? this.offers[this.offerNum].ID : this.product.id.toString(),
                            PRODUCT_MEASURE_RATIO: this.stepQuantity
                        }, '', {
                            width: 957
                        }).then(() => {
                            this.isOffersPopupOpen && this.closeOffersPopup();
                        });
                    });
                });
            }
        },

        setAnalyticsDataLayer: function (action) {
            if (!this.useEnhancedEcommerce || !this.dataLayerName)
                return;

            var item = {},
                info = {},
                variants = [],
                i, k, j, propId, skuId, propValues;

            switch (this.productType) {
                case 0: //no catalog
                case 1: //product
                case 2: //set
                case 7: // service
                    item = {
                        'id': this.product.id,
                        'name': this.product.name,
                        'price': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].PRICE,
                        'brand': BX.type.isArray(this.brandProperty) ? this.brandProperty.join('/') : this.brandProperty
                    };
                    break;
                case 3: //sku
                    for (i in this.offers[this.offerNum].TREE) {
                        if (this.offers[this.offerNum].TREE.hasOwnProperty(i)) {
                            propId = i.substring(5);
                            skuId = this.offers[this.offerNum].TREE[i];

                            for (k in this.treeProps) {
                                if (this.treeProps.hasOwnProperty(k) && this.treeProps[k].ID == propId) {
                                    for (j in this.treeProps[k].VALUES) {
                                        propValues = this.treeProps[k].VALUES[j];
                                        if (propValues.ID == skuId) {
                                            variants.push(propValues.NAME);
                                            break;
                                        }
                                    }

                                }
                            }
                        }
                    }

                    item = {
                        'id': this.offers[this.offerNum].ID,
                        'name': this.offers[this.offerNum].NAME,
                        'price': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].PRICE,
                        'brand': BX.type.isArray(this.brandProperty) ? this.brandProperty.join('/') : this.brandProperty,
                        'variant': variants.join('/')
                    };
                    break;
            }

            switch (action) {
                case 'addToCart':
                    info = {
                        'ecommerce': {
                            'currencyCode': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].CURRENCY || '',
                            'add': {
                                'products': [{
                                    'name': item.name || '',
                                    'id': item.id || '',
                                    'price': item.price || 0,
                                    'brand': item.brand || '',
                                    'category': item.category || '',
                                    'variant': item.variant || '',
                                    'quantity': this.showQuantity && this.obQuantity ? this.obQuantity.value : 1
                                }]
                            }
                        }
                    };
                    break;
            }

            window[this.dataLayerName] = window[this.dataLayerName] || [];
            window[this.dataLayerName].push(info);
        },

        hoverOn: function (event) {
            clearTimeout(this.hoverTimer);
            this.obProduct.style.height = getComputedStyle(this.obProduct).height;
            BX.addClass(this.obProduct, 'hover');

            BX.PreventDefault(event);
        },

        hoverOff: function (event) {
            if (this.hoverStateChangeForbidden)
                return;

            BX.removeClass(this.obProduct, 'hover');
            this.hoverTimer = setTimeout(
                BX.delegate(function () {
                    this.obProduct.style.height = 'auto';
                }, this),
                300
            );

            BX.PreventDefault(event);
        },

        getCookie: function (name) {
            var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));

            return matches ? decodeURIComponent(matches[1]) : null;
        },

        rememberProductRecommendation: function () {
            // save to RCM_PRODUCT_LOG
            var cookieName = BX.cookie_prefix + '_RCM_PRODUCT_LOG',
                cookie = this.getCookie(cookieName),
                itemFound = false;

            var cItems = [],
                cItem;

            if (cookie) {
                cItems = cookie.split('.');
            }

            var i = cItems.length;

            while (i--) {
                cItem = cItems[i].split('-');

                if (cItem[0] == this.product.id) {
                    // it's already in recommendations, update the date
                    cItem = cItems[i].split('-');

                    // update rcmId and date
                    cItem[1] = this.product.rcmId;
                    cItem[2] = BX.current_server_time;

                    cItems[i] = cItem.join('-');
                    itemFound = true;
                } else {
                    if ((BX.current_server_time - cItem[2]) > 3600 * 24 * 30) {
                        cItems.splice(i, 1);
                    }
                }
            }

            if (!itemFound) {
                // add recommendation
                cItems.push([this.product.id, this.product.rcmId, BX.current_server_time].join('-'));
            }

            // serialize
            var plNewCookie = cItems.join('.'),
                cookieDate = new Date(new Date().getTime() + 1000 * 3600 * 24 * 365 * 10).toUTCString();

            document.cookie = cookieName + "=" + plNewCookie + "; path=/; expires=" + cookieDate + "; domain=" + BX.cookie_domain;
        },

        getQuantityInputValue: function () {
            return this.isDblQuantity ? parseFloat(this.obQuantity.value) : Math.round(this.obQuantity.value);
        },

        quantityUp: function () {
            if (this.errorCode === 0 && this.showQuantity && this.canBuy) {
                let currentValue = this.getQuantityInputValue();

                if (Number.isNaN(currentValue)) {
                    return;
                }

                currentValue += this.stepQuantity;

                if (this.checkQuantity && currentValue > this.maxQuantity) {
                    return;
                }

                if (this.isDblQuantity) {
                    currentValue = Math.round(currentValue * this.precisionFactor) / this.precisionFactor;
                }

                this.basketActionItemQuantity += this.stepQuantity;
                this.obQuantity.value = currentValue;

                this.doBasketAction('ADD');

                this.setPrice();
            } else {
                console.error(`Product card render error, code: ${this.errorCode}, showQuantity = ${this.showQuantity}, canBuy = ${this.canBuy}`);
            }
        },

        quantityDown: function () {
            if (this.errorCode === 0 && this.showQuantity && this.canBuy) {
                let currentValue = this.getQuantityInputValue();

                if (Number.isNaN(currentValue)) {
                    return;
                }

                currentValue -= this.stepQuantity;

                this.checkPriceRange(currentValue);

                if (this.isDblQuantity) {
                    currentValue = Math.round(currentValue * this.precisionFactor) / this.precisionFactor;
                }

                this.basketActionItemQuantity -= this.stepQuantity;
                this.obQuantity.value = currentValue;

                this.doBasketAction('REMOVE');

                if (currentValue === 0) {
                    this.hideQuantityBlock();
                }

                this.setPrice();
            } else {
                console.error(`Product card render error, code: ${this.errorCode}, showQuantity = ${this.showQuantity}, canBuy = ${this.canBuy}`);
            }
        },

        quantityInputFocus: function (event) {
            this.oldQuantity = event.target.value;
        },

        quantityChange: function () {
            var curValue = 0,
                intCount;

            if (this.errorCode === 0 && this.showQuantity) {
                if (this.canBuy) {
                    curValue = this.getQuantityInputValue();
                    if (!isNaN(curValue)) {
                        if (this.checkQuantity) {
                            if (curValue > this.maxQuantity) {
                                curValue = this.maxQuantity;
                            }
                        }

                        this.checkPriceRange(curValue);

                        intCount = Math.floor(
                            Math.round(curValue * this.precisionFactor / this.stepQuantity) / this.precisionFactor
                        ) || 1;
                        curValue = (intCount <= 1 ? this.stepQuantity : intCount * this.stepQuantity);
                        curValue = Math.round(curValue * this.precisionFactor) / this.precisionFactor;

                        if (curValue < this.minQuantity) {
                            curValue = this.minQuantity;
                        }

                        if (this.oldQuantity > curValue) {
                            this.basketActionItemQuantity = this.oldQuantity - curValue;

                            this.doBasketAction('REMOVE');
                        } else if (this.oldQuantity < curValue) {
                            this.basketActionItemQuantity = curValue - this.oldQuantity;

                            this.doBasketAction('ADD');
                        } else {
                            clearTimeout(this.debouncedBasketActionTimeout);
                        }

                        this.obQuantity.value = curValue;
                    } else {
                        this.obQuantity.value = this.minQuantity;
                    }
                } else {
                    this.obQuantity.value = this.minQuantity;
                }

                this.setPrice();
            } else {
                console.error(`Product card render error, code: ${this.errorCode}, showQuantity = ${this.showQuantity}`);
            }
        },

        quantitySet: function (index) {
            var resetQuantity, strLimit;

            var newOffer = this.offers[index],
                oldOffer = this.offers[this.offerNum];

            if (this.errorCode === 0) {
                this.canBuy = newOffer.CAN_BUY;

                this.currentPriceMode = newOffer.ITEM_PRICE_MODE;
                this.currentPrices = newOffer.ITEM_PRICES;
                this.currentPriceSelected = newOffer.ITEM_PRICE_SELECTED;
                this.currentQuantityRanges = newOffer.ITEM_QUANTITY_RANGES;
                this.currentQuantityRangeSelected = newOffer.ITEM_QUANTITY_RANGE_SELECTED;

                if (this.canBuy) {
                    if (this.blockNodes.quantity) {
                        if (parseFloat(newOffer.currentBasketQuantity)) {
                            this.blockNodes.quantity.style.display = '';

                            if (this.obBuyBtn) {
                                this.obBuyBtn.style.display = 'none';
                                this.obBuyBtn.removeAttribute('disabled');
                            }
                        } else {
                            this.blockNodes.quantity.style.display = 'none';

                            if (this.obBuyBtn) {
                                this.obBuyBtn.style.display = '';
                                this.obBuyBtn.removeAttribute('disabled');
                            }
                        }
                    } else {
                        if (this.obBuyBtn) {
                            this.obBuyBtn.style.display = '';
                            this.obBuyBtn.removeAttribute('disabled');
                        }
                    }

                    if (this.obNotAvail.length) {
                        this.obNotAvail.forEach((element) => element.style.display = 'none');
                    }

                    if (this.obSubscribe) {
                        this.obSubscribe.style.display = 'none';
                    }

                    if (this.obOneClick.length) {
                        this.obOneClick.forEach((element) => {
                            element.style.display = '';

                            const popupMobileOneclickContainer = element.closest('.catalog-item-popup-bottom-oneclick');

                            popupMobileOneclickContainer?.closest('.catalog-item-popup-buttons').classList.remove('one-click');
                        });
                    }
                } else {
                    if (this.blockNodes.quantity) {
                        this.blockNodes.quantity.style.display = 'none';
                    }

                    if (this.obBuyBtn) {
                        this.obBuyBtn.setAttribute('disabled', 'disabled');
                    }

                    if (this.obNotAvail.length) {
                        this.obNotAvail.forEach((element) => element.style.display = '');
                    }

                    if (this.obOneClick.length) {
                        this.obOneClick.forEach((element) => {
                            element.style.display = 'none';

                            const popupMobileOneclickContainer = element.closest('.catalog-item-popup-bottom-oneclick');

                            popupMobileOneclickContainer?.closest('.catalog-item-popup-buttons').classList.add('one-click');
                        });
                    }

                    if (this.obSubscribe) {
                        if (newOffer.CATALOG_SUBSCRIBE === 'Y') {
                            this.obSubscribe.style.display = '';
                            this.obBuyBtn.style.display = 'none';
                        } else {
                            this.obSubscribe.style.display = 'none';
                        }
                    }
                }

                this.isDblQuantity = newOffer.QUANTITY_FLOAT;
                this.checkQuantity = newOffer.CHECK_QUANTITY;

                if (this.isDblQuantity) {
                    this.stepQuantity = Math.round(parseFloat(newOffer.STEP_QUANTITY) * this.precisionFactor) / this.precisionFactor;
                    this.maxQuantity = parseFloat(newOffer.MAX_QUANTITY);
                    this.minQuantity = this.currentPriceMode === 'Q' ? parseFloat(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY) : this.stepQuantity;
                } else {
                    this.stepQuantity = parseInt(newOffer.STEP_QUANTITY, 10);
                    this.maxQuantity = parseInt(newOffer.MAX_QUANTITY, 10);
                    this.minQuantity = this.currentPriceMode === 'Q' ? parseInt(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY) : this.stepQuantity;
                }

                if (this.showQuantity) {
                    var isDifferentMinQuantity = oldOffer.ITEM_PRICES.length
                        && oldOffer.ITEM_PRICES[oldOffer.ITEM_PRICE_SELECTED]
                        && oldOffer.ITEM_PRICES[oldOffer.ITEM_PRICE_SELECTED].MIN_QUANTITY != this.minQuantity;

                    if (this.isDblQuantity) {
                        resetQuantity = Math.round(parseFloat(oldOffer.STEP_QUANTITY) * this.precisionFactor) / this.precisionFactor !== this.stepQuantity
                            || isDifferentMinQuantity
                            || oldOffer.MEASURE !== newOffer.MEASURE
                            || (
                                this.checkQuantity
                                && parseFloat(oldOffer.MAX_QUANTITY) > this.maxQuantity
                                && parseFloat(this.obQuantity.value) > this.maxQuantity
                            );
                    } else {
                        resetQuantity = parseInt(oldOffer.STEP_QUANTITY, 10) !== this.stepQuantity
                            || isDifferentMinQuantity
                            || oldOffer.MEASURE !== newOffer.MEASURE
                            || (
                                this.checkQuantity
                                && parseInt(oldOffer.MAX_QUANTITY, 10) > this.maxQuantity
                                && parseInt(this.obQuantity.value, 10) > this.maxQuantity
                            );
                    }

                    this.obQuantity.disabled = !this.canBuy;

                    if (resetQuantity) {
                        this.obQuantity.value = this.minQuantity;
                    }
                }

                if (this.obQuantityLimit.all) {
                    if (!this.checkQuantity || this.maxQuantity == 0 || !this.canBuy) {
                        this.obQuantityLimit.value.forEach((element) => {
                            BX.adjust(element, {html: ""});
                        });

                        this.obQuantityLimit.all.forEach((element) => {
                            BX.adjust(element, {style: {display: "none"}});
                        });
                    } else {
                        if (this.showMaxQuantity === 'M') {
                            strLimit = (this.maxQuantity / this.stepQuantity >= this.relativeQuantityFactor)
                                ? BX.message(`RELATIVE_QUANTITY_MANY_${this.componentId}`)
                                : BX.message(`RELATIVE_QUANTITY_FEW_${this.componentId}`);
                        } else {
                            strLimit = this.maxQuantity;

                            if (newOffer.MEASURE) {
                                strLimit += (' ' + newOffer.MEASURE);
                            }
                        }

                        this.obQuantityLimit.value.forEach((element) => {
                            BX.adjust(element, {html: strLimit});
                        });

                        this.obQuantityLimit.all.forEach((element) => {
                            BX.adjust(element, {style: {display: ""}});
                        });
                    }
                }

                if (this.obMeasure) {
                    if (newOffer.MEASURE) {
                        BX.adjust(this.obMeasure, {html: newOffer.MEASURE});
                    } else {
                        BX.adjust(this.obMeasure, {html: ''});
                    }
                }

                if (this.usePriceRanges && this.obPriceRanges.length) {
                    this.obPriceRanges.forEach((element) => {
                        const hasMultipleRanges = Object.keys(this.currentQuantityRanges).length > 1;
                        const hasOneRange = newOffer.ITEM_ALL_PRICES && Object.keys(newOffer.ITEM_ALL_PRICES[0].PRICES).length > 1;

                        if (hasMultipleRanges || hasOneRange) {
                            const priceTableHeader = this.getEntity(element, 'price-table-header');
                            const priceTableItemsContainer = this.getEntity(element, 'price-table-items');

                            priceTableHeader.textContent = BX.message('PRICE_TABLE_RANGES_HEADER')
                                .replace('#TITLE#', this.priceTableTitle)
                                .replace('#RATIO#', `${this.stepQuantity || 1} ${newOffer.MEASURE}`);
                            priceTableItemsContainer.replaceChildren();

                            const priceTableContent = new DocumentFragment();

                            if (hasMultipleRanges) {
                                if (newOffer.ITEM_ALL_PRICES) {
                                    for (const priceBlock of newOffer.ITEM_ALL_PRICES) {
                                        const fromText = BX.message('PRICE_TABLE_RANGE_FROM').replace('#FROM#', `${priceBlock.QUANTITY_FROM} ${newOffer.MEASURE}`);
                                        const toText = priceBlock.QUANTITY_TO
                                            ? BX.message('PRICE_TABLE_RANGE_TO').replace('#TO#', `${priceBlock.QUANTITY_TO} ${newOffer.MEASURE}`)
                                            : BX.message('PRICE_TABLE_RANGE_MORE');
                                        const priceBlockTitleElement = BX.create('li', {
                                            text: `${fromText} ${toText}`
                                        });
                                        const priceElements = [];

                                        for (const priceId in priceBlock.PRICES) {
                                            if (priceBlock.PRICES.hasOwnProperty(priceId)) {
                                                const price = priceBlock.PRICES[priceId];

                                                const displayPrice = this.useRatioInRanges
                                                    ? price.PRINT_RATIO_PRICE
                                                    : price.PRINT_PRICE;
                                                const priceElement = BX.create('li', {
                                                    html: `${this.allItemsNames[price.PRICE_TYPE_ID]} - <span>${displayPrice}</span>`
                                                });

                                                priceElements.push(priceElement);
                                            }
                                        }

                                        priceTableContent.appendChild(BX.create('li', {
                                            children: [
                                                BX.create('ul', {
                                                    children: [
                                                        priceBlockTitleElement,
                                                        ...priceElements
                                                    ]
                                                })
                                            ]
                                        }));
                                    }
                                } else {
                                    for (const priceRange in newOffer.ITEM_QUANTITY_RANGES) {
                                        if (newOffer.ITEM_QUANTITY_RANGES.hasOwnProperty(priceRange)) {
                                            const priceRangeData = newOffer.ITEM_QUANTITY_RANGES[priceRange];

                                            if (priceRangeData['HASH'] !== 'ZERO-INF') {
                                                const price = newOffer.ITEM_PRICES.find((price) => price.QUANTITY_HASH === priceRangeData['HASH']);

                                                if (price) {
                                                    const fromText = BX.message('PRICE_TABLE_RANGE_FROM')
                                                        .replace('#FROM#', `${priceRangeData.SORT_FROM} ${newOffer.MEASURE}`);
                                                    const toText = priceRangeData.QUANTITY_TO
                                                        ? BX.message('PRICE_TABLE_RANGE_TO')
                                                            .replace('#TO#', `${priceRangeData.SORT_TO} ${newOffer.MEASURE}`)
                                                        : BX.message('PRICE_TABLE_RANGE_MORE');
                                                    const priceBlockTitleElement = BX.create('li', {
                                                        html: `${fromText} ${toText} - <span>${this.useRatioInRanges
                                                            ? price.PRINT_RATIO_PRICE
                                                            : price.PRINT_PRICE}</span>`
                                                    });

                                                    priceTableContent.appendChild(priceBlockTitleElement);
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                for (const priceId in newOffer.ITEM_ALL_PRICES[0].PRICES) {
                                    if (newOffer.ITEM_ALL_PRICES[0].PRICES.hasOwnProperty(priceId)) {
                                        const price = newOffer.ITEM_ALL_PRICES[0].PRICES[priceId];
                                        const displayPrice = this.useRatioInRanges
                                            ? price.PRINT_RATIO_PRICE
                                            : price.PRINT_PRICE;
                                        const priceElement = BX.create('li', {
                                            html: `${this.allItemsNames[price.PRICE_TYPE_ID]} - <span>${displayPrice}</span>`
                                        });

                                        priceTableContent.appendChild(priceElement);
                                    }
                                }
                            }

                            priceTableItemsContainer.appendChild(priceTableContent);
                            element.classList.remove('d-none');
                        } else {
                            element.classList.add('d-none');
                        }
                    });
                }
            } else {
                console.error(`Product card render error, code: ${this.errorCode}`);
            }
        },

        initSlider: function (sliderContainer, options = {}) {
            const sliderOptions = {
                pagination: {
                    enabled: true,
                    element: sliderContainer.closest('[data-entity="item"]').querySelector('.keen-slider__pagination')
                },
                defaultAnimation: {duration: 2500},
                plugins: [
                    (slider) => {
                        const crosssellTabChangeHandler = () => slider.update();

                        BX.addCustomEvent('crosssellTabChange', crosssellTabChangeHandler);
                        slider.on('destroyed', () => BX.removeCustomEvent('crosssellTabChange', crosssellTabChangeHandler));
                    }
                ]
            };

            if (this.scrollSliderOnHover) {
                sliderOptions.optionsChanged = sliderOptions.created = this.updateSlidersOverlayPagination;
            }

            sliderContainer.style.display = '';

            const slider = BX.Sotbit.B2C.createSlider(sliderContainer, {...sliderOptions, ...options}, 'KeenSlider');

            this.sliders.set(sliderContainer, slider);
        },

        initProductSlider: function () {
            this.initSlider(this.obPictSlider);
        },

        initOffersPopupSlider: function () {
            this.initSlider(this.obOffersPopupSliderContainer, {
                pagination: {
                    enabled: true,
                    element: this.obProduct.querySelector('.catalog-item-popup__pagination')
                }
            });
        },

        changeSliderPictures: function (sliderContainer, newPictures, offerIndex) {
            // clear slider wrapper
            sliderContainer.replaceChildren(...newPictures.map((picture, index) => {
                return BX.create('div', {
                    props: {
                        className: `catalog-item__image keen-slider__slide ${index == 0 ? ' active' : ''}`
                    },
                    children: [
                        BX.Sotbit.B2C.loadLazy(
                            newPictures[index].SRC,
                            this.offers[offerIndex].NAME || this.product.name,
                            {className: 'img-contain'}
                        )
                    ]
                })
            }));
        },

        updateSlidersOverlayPagination: function (slider) {
            const overlayPaginationElement = slider.container.parentElement.querySelector('.overlay-pagination-container');

            if (overlayPaginationElement) {
                overlayPaginationElement.remove();
            }

            const overlayPaginationContainer = document.createElement('div');
            overlayPaginationContainer.classList.add('overlay-pagination-container');

            slider.slides.forEach((_, i) => {
                const overlayPaginationElement = document.createElement('div');

                overlayPaginationElement.classList.add('overlay-pagination-slide');
                overlayPaginationContainer.appendChild(overlayPaginationElement);
                overlayPaginationElement.addEventListener('mouseenter', () => slider.moveToIdx(i));
            });

            slider.container.parentElement.appendChild(overlayPaginationContainer);
        },

        selectOfferProp: function () {
            var i = 0,
                value = '',
                strTreeValue = '',
                arTreeItem = [],
                rowItems = null,
                target = BX.proxy_context;

            if (target && target.hasAttribute('data-treevalue')) {
                if (BX.hasClass(target, 'selected'))
                    return;

                strTreeValue = target.getAttribute('data-treevalue');
                arTreeItem = strTreeValue.split('_');
                if (this.searchOfferPropIndex(arTreeItem[0], arTreeItem[1])) {
                    rowItems = BX.findChildren(target.parentNode, {tagName: 'li'}, false);
                    if (rowItems && 0 < rowItems.length) {
                        for (i = 0; i < rowItems.length; i++) {
                            value = rowItems[i].getAttribute('data-onevalue');
                            if (value === arTreeItem[1]) {
                                BX.addClass(rowItems[i], 'selected');
                            } else {
                                BX.removeClass(rowItems[i], 'selected');
                            }
                        }
                    }

                    if (
                        this.isFacebookConversionCustomizeProductEventEnabled
                        && BX.Type.isArrayFilled(this.offers)
                        && BX.Type.isObject(this.offers[this.offerNum])
                    ) {
                        BX.ajax.runAction(
                            'sale.facebookconversion.customizeProduct',
                            {
                                data: {
                                    offerId: this.offers[this.offerNum]['ID']
                                }
                            }
                        );
                    }
                }
            }
        },

        searchOfferPropIndex: function (strPropID, strPropValue) {
            var strName = '',
                arShowValues = false,
                i, j,
                arCanBuyValues = [],
                allValues = [],
                index = -1,
                arFilter = {},
                tmpFilter = [];

            for (i = 0; i < this.treeProps.length; i++) {
                if (this.treeProps[i].ID === strPropID) {
                    index = i;
                    break;
                }
            }

            if (-1 < index) {
                for (i = 0; i < index; i++) {
                    strName = 'PROP_' + this.treeProps[i].ID;
                    arFilter[strName] = this.selectedValues[strName];
                }
                strName = 'PROP_' + this.treeProps[index].ID;
                arShowValues = this.getRowValues(arFilter, strName);
                if (!arShowValues) {
                    return false;
                }
                if (!BX.util.in_array(strPropValue, arShowValues)) {
                    return false;
                }
                arFilter[strName] = strPropValue;
                for (i = index + 1; i < this.treeProps.length; i++) {
                    strName = 'PROP_' + this.treeProps[i].ID;
                    arShowValues = this.getRowValues(arFilter, strName);
                    if (!arShowValues) {
                        return false;
                    }
                    allValues = [];
                    if (this.showAbsent) {
                        arCanBuyValues = [];
                        tmpFilter = [];
                        tmpFilter = BX.clone(arFilter, true);
                        for (j = 0; j < arShowValues.length; j++) {
                            tmpFilter[strName] = arShowValues[j];
                            allValues[allValues.length] = arShowValues[j];
                            if (this.getCanBuy(tmpFilter))
                                arCanBuyValues[arCanBuyValues.length] = arShowValues[j];
                        }
                    } else {
                        arCanBuyValues = arShowValues;
                    }
                    if (this.selectedValues[strName] && BX.util.in_array(this.selectedValues[strName], arCanBuyValues)) {
                        arFilter[strName] = this.selectedValues[strName];
                    } else {
                        if (this.showAbsent)
                            arFilter[strName] = (arCanBuyValues.length > 0 ? arCanBuyValues[0] : allValues[0]);
                        else
                            arFilter[strName] = arCanBuyValues[0];
                    }
                    this.updateRow(i, arFilter[strName], arShowValues, arCanBuyValues);
                }
                this.selectedValues = arFilter;
                this.changeInfo();
            }
            return true;
        },

        updateRow: function (intNumber, activeID, showID, canBuyID) {
            var i = 0,
                value = '',
                isCurrent = false,
                rowItems = null;

            var lineContainer = this.obTree.querySelectorAll('[data-entity="sku-line-block"]');

            if (intNumber > -1 && intNumber < lineContainer.length) {
                rowItems = BX.findChildren(lineContainer[intNumber], {tagName: 'li'}, false);
                if (rowItems && 0 < rowItems.length) {
                    for (i = 0; i < rowItems.length; i++) {
                        value = rowItems[i].getAttribute('data-onevalue');
                        isCurrent = value === activeID;

                        if (isCurrent) {
                            BX.addClass(rowItems[i], 'selected');
                        } else {
                            BX.removeClass(rowItems[i], 'selected');
                        }

                        if (BX.util.in_array(value, canBuyID)) {
                            BX.removeClass(rowItems[i], 'notallowed');
                        } else {
                            BX.addClass(rowItems[i], 'notallowed');
                        }

                        rowItems[i].style.display = BX.util.in_array(value, showID) ? '' : 'none';

                        if (isCurrent) {
                            lineContainer[intNumber].style.display = (value == 0 && canBuyID.length == 1) ? 'none' : '';
                        }
                    }
                }
            }
        },

        getRowValues: function (arFilter, index) {
            var i = 0,
                j,
                arValues = [],
                boolSearch = false,
                boolOneSearch = true;

            if (0 === arFilter.length) {
                for (i = 0; i < this.offers.length; i++) {
                    if (!BX.util.in_array(this.offers[i].TREE[index], arValues)) {
                        arValues[arValues.length] = this.offers[i].TREE[index];
                    }
                }
                boolSearch = true;
            } else {
                for (i = 0; i < this.offers.length; i++) {
                    boolOneSearch = true;
                    for (j in arFilter) {
                        if (arFilter[j] !== this.offers[i].TREE[j]) {
                            boolOneSearch = false;
                            break;
                        }
                    }
                    if (boolOneSearch) {
                        if (!BX.util.in_array(this.offers[i].TREE[index], arValues)) {
                            arValues[arValues.length] = this.offers[i].TREE[index];
                        }
                        boolSearch = true;
                    }
                }
            }
            return (boolSearch ? arValues : false);
        },

        getCanBuy: function (arFilter) {
            var i, j,
                boolSearch = false,
                boolOneSearch = true;

            for (i = 0; i < this.offers.length; i++) {
                boolOneSearch = true;
                for (j in arFilter) {
                    if (arFilter[j] !== this.offers[i].TREE[j]) {
                        boolOneSearch = false;
                        break;
                    }
                }
                if (boolOneSearch) {
                    if (this.offers[i].CAN_BUY) {
                        boolSearch = true;
                        break;
                    }
                }
            }

            return boolSearch;
        },

        setCurrent: function () {
            var i,
                j = 0,
                arCanBuyValues = [],
                strName = '',
                arShowValues = false,
                arFilter = {},
                tmpFilter = [],
                current = this.offers[this.offerNum].TREE;

            for (i = 0; i < this.treeProps.length; i++) {
                strName = 'PROP_' + this.treeProps[i].ID;
                arShowValues = this.getRowValues(arFilter, strName);
                if (!arShowValues) {
                    break;
                }
                if (BX.util.in_array(current[strName], arShowValues)) {
                    arFilter[strName] = current[strName];
                } else {
                    arFilter[strName] = arShowValues[0];
                    this.offerNum = 0;
                }
                if (this.showAbsent) {
                    arCanBuyValues = [];
                    tmpFilter = [];
                    tmpFilter = BX.clone(arFilter, true);
                    for (j = 0; j < arShowValues.length; j++) {
                        tmpFilter[strName] = arShowValues[j];
                        if (this.getCanBuy(tmpFilter)) {
                            arCanBuyValues[arCanBuyValues.length] = arShowValues[j];
                        }
                    }
                } else {
                    arCanBuyValues = arShowValues;
                }
                this.updateRow(i, arFilter[strName], arShowValues, arCanBuyValues);
            }
            this.selectedValues = arFilter;
            this.changeInfo();
        },

        changeInfo: function () {
            var i, j,
                index = -1,
                boolOneSearch = true,
                quantityChanged;

            for (i = 0; i < this.offers.length; i++) {
                boolOneSearch = true;
                for (j in this.selectedValues) {
                    if (this.selectedValues[j] !== this.offers[i].TREE[j]) {
                        boolOneSearch = false;
                        break;
                    }
                }
                if (boolOneSearch) {
                    index = i;
                    break;
                }
            }
            if (index <= -1) {
                return;
            }

            if (parseInt(this.offers[index].MORE_PHOTO_COUNT) > 1 && this.obPictSlider) {
                // hide pict and second_pict containers
                if (this.obPict) {
                    this.obPict.style.display = 'none';
                }

                // show slider container
                this.obPictSlider.style.display = '';
                this.changeSliderPictures(this.obPictSlider, this.offers[index].MORE_PHOTO, index);

                const productSlider = this.sliders.get(this.obPictSlider);

                productSlider?.destroy();
                this.initProductSlider();

                if (this.skuVariant === 'PREVIEW') {
                    this.obOffersPopupSliderContainer.style.display = '';

                    this.changeSliderPictures(this.obOffersPopupSliderContainer, this.offers[index].MORE_PHOTO, index);

                    const offersPopupSlider = this.sliders.get(this.obOffersPopupSliderContainer);

                    offersPopupSlider?.destroy();
                    this.initOffersPopupSlider();
                }
            } else {
                // hide slider container
                if (this.obPictSlider) {
                    this.obPictSlider.style.display = 'none';

                    const productSlider = this.sliders.get(this.obPictSlider);

                    if (productSlider) {
                        productSlider.destroy();
                        this.sliders.delete(this.obPictSlider);
                    }
                }

                if (this.obOffersPopupSliderContainer) {
                    this.obOffersPopupSliderContainer.style.display = 'none';

                    const offersPopupSlider = this.sliders.get(this.obOffersPopupSliderContainer);

                    if (offersPopupSlider) {
                        offersPopupSlider.destroy();
                        this.sliders.delete(this.obOffersPopupSliderContainer);
                    }
                }

                // show pict containers
                if (this.obPict) {
                    this.obPict.replaceChildren(BX.Sotbit.B2C.loadLazy(
                        this.offers[index].PREVIEW_PICTURE
                            ? this.offers[index].PREVIEW_PICTURE.SRC
                            : this.defaultPict.pict.SRC,
                        this.offers[index].NAME || this.product.name,
                        {className: 'img-contain'}
                    ));

                    this.obPict.style.display = '';
                }

                if (this.obOffersPopupPicture) {
                    this.obOffersPopupPicture.replaceChildren(BX.Sotbit.B2C.loadLazy(
                        this.offers[index].PREVIEW_PICTURE
                            ? this.offers[index].PREVIEW_PICTURE.SRC
                            : this.defaultPict.pict.SRC,
                        this.offers[index].NAME || this.product.name,
                        {className: 'img-contain'}
                    ));

                    this.obOffersPopupPicture.style.display = '';
                }
            }

            if (this.showSkuProps && this.obSkuProps.length) {
                this.obSkuProps.forEach((element) => {
                    if (this.offers[index].DISPLAY_PROPERTIES.length) {
                        BX.adjust(element, {style: {display: ''}, html: this.offers[index].DISPLAY_PROPERTIES});
                    } else {
                        BX.adjust(element, {style: {display: 'none'}, html: ''});
                    }
                });
            }

            this.quantitySet(index);
            this.setCompared(this.offers[index].COMPARED);

            const oldOfferNum = this.offerNum;

            this.offerNum = index;

            this.setName();
            this.setFavorite();

            if (this.showQuantity && this.obQuantity) {
                this.obQuantity.value = this.offers[this.offerNum].currentBasketQuantity ? this.offers[this.offerNum].currentBasketQuantity : this.stepQuantity;
            }

            this.setPrice();

            if (this.offerNum !== oldOfferNum) {
                // new event
                const eventData = {
                    needSubscribeCheck: !this.offers[this.offerNum].CAN_BUY,
                    newId: this.offers[this.offerNum].ID
                }
                BX.onCustomEvent("onCatalogProductOfferChange", [eventData]);
            }
        },

        setName: function () {
            if (this.useSkuTitle !== 'Y') {
                return;
            }

            this.getEntities(this.obProduct, this.visual.PRODUCT_NAME).forEach((element) => {
                element.textContent = this.offers[this.offerNum].NAME ? this.offers[this.offerNum].NAME : this.product.name;
            });
        },

        setOfferPopupTitle: function () {
            const currentSku = this.offers[this.offerNum];
            const title = this.obOffersPopup.querySelector('[data-entity="offers-popup-title"]');

            if (this.useSkuTitle === 'Y') {
                title.textContent = currentSku.NAME ? currentSku.NAME : this.product.name;
            } else {
                title.textContent = this.product.name;
            }
        },

        checkPriceRange: function (quantity) {
            if (typeof quantity === 'undefined' || this.currentPriceMode != 'Q')
                return;

            var range, found = false;

            for (var i in this.currentQuantityRanges) {
                if (this.currentQuantityRanges.hasOwnProperty(i)) {
                    range = this.currentQuantityRanges[i];

                    if (
                        parseInt(quantity) >= parseInt(range.SORT_FROM)
                        && (
                            range.SORT_TO == 'INF'
                            || parseInt(quantity) <= parseInt(range.SORT_TO)
                        )
                    ) {
                        found = true;
                        this.currentQuantityRangeSelected = range.HASH;
                        break;
                    }
                }
            }

            if (!found && (range = this.getMinPriceRange())) {
                this.currentQuantityRangeSelected = range.HASH;
            }

            for (var k in this.currentPrices) {
                if (this.currentPrices.hasOwnProperty(k)) {
                    if (this.currentPrices[k].QUANTITY_HASH == this.currentQuantityRangeSelected) {
                        this.currentPriceSelected = k;
                        break;
                    }
                }
            }
        },

        getMinPriceRange: function () {
            var range;

            for (var i in this.currentQuantityRanges) {
                if (this.currentQuantityRanges.hasOwnProperty(i)) {
                    if (
                        !range
                        || parseInt(this.currentQuantityRanges[i].SORT_FROM) < parseInt(range.SORT_FROM)
                    ) {
                        range = this.currentQuantityRanges[i];
                    }
                }
            }

            return range;
        },

        checkQuantityControls: function () {
            if (!this.obQuantity)
                return;

            var reachedTopLimit = this.checkQuantity && parseFloat(this.obQuantity.value) + this.stepQuantity > this.maxQuantity,
                reachedBottomLimit = parseFloat(this.obQuantity.value) - this.stepQuantity < this.minQuantity;

            if (reachedTopLimit) {
                BX.addClass(this.obQuantityUp, 'disabled');
            } else if (BX.hasClass(this.obQuantityUp, 'disabled')) {
                BX.removeClass(this.obQuantityUp, 'disabled');
            }

            if (reachedTopLimit && reachedBottomLimit) {
                this.obQuantity.setAttribute('disabled', 'disabled');
            } else {
                this.obQuantity.removeAttribute('disabled');
            }
        },

        setPrice: function () {
            var obData, price;
            var multiplePrices = false;

            switch (this.productType) {
                case 3: //sku
                    var currentOffer = this.offers[this.offerNum];

                    if (currentOffer.ITEM_ALL_PRICES) {
                        currentOffer.ITEM_ALL_PRICES.forEach((priceBlock) => {
                            if (Object.keys(priceBlock.PRICES).length > 1) {
                                multiplePrices = true;
                            }
                        });
                    }

                    break;
                default:
                    if (this.allCurrentPrices) {
                        this.allCurrentPrices.forEach((priceBlock) => {
                            if (Object.keys(priceBlock.PRICES).length > 1) {
                                multiplePrices = true;
                            }
                        });
                    }
                    break;
            }

            if (this.obQuantity) {
                this.checkPriceRange(this.obQuantity.value);
            }

            if (this.productType === 3 && this.fillItemAllPrices) {
                // this.setAllPrices();
            }

            this.checkQuantityControls();

            price = this.currentPrices[this.currentPriceSelected];

            if (this.obPrice.length) {
	      if (price.RATIO_PRICE != 0){
                this.obPrice.forEach(priceElement => {
                    if (price) {
                        BX.adjust(priceElement, {
                            html: (multiplePrices
                                    ? BX.message('PRICE_FROM') + ' '
                                    : '')
                                + price.PRINT_RATIO_PRICE
                        });
                    } else {
                        BX.adjust(priceElement, {html: ''});
                    }
                });
	      }

                if (this.showOldPrice && this.obPriceOld.length) {
                    this.obPriceOld.forEach(oldPriceElement => {
                        if (price && price.RATIO_PRICE !== price.RATIO_BASE_PRICE) {
                            BX.adjust(oldPriceElement, {
                                style: {display: ''},
                                html: price.PRINT_RATIO_BASE_PRICE
                            });
                        } else {
                            BX.adjust(oldPriceElement, {
                                style: {display: 'none'},
                                html: ''
                            });
                        }
                    });
                }

                if (this.showPercent) {
                    if (price && parseInt(price.PERCENT) > 0) {
                        obData = {style: {display: ''}, html: -price.PERCENT + '%'};
                    } else {
                        obData = {style: {display: 'none'}, html: ''};
                    }

                    if (this.obDscPerc.length) {
                        this.obDscPerc.forEach(discountPercentElement => {
                            BX.adjust(discountPercentElement, obData);
                        });
                    }
                }
            }
        },

        setAllPrices: function () {
            const currentOffer = this.offers[this.offerNum];
            // console.log(currentOffer);

            // if offer has only one price range and one price in this range - no need to show price list block
            if (currentOffer.ITEM_ALL_PRICES.length === 1
                && Object.keys(currentOffer.ITEM_ALL_PRICES[0].PRICES).length === 1) {
                this.obOffersPriceList.style.display = 'none';
                return;
            }

            const priceListNodes = {};

            this.obOffersPriceList.querySelectorAll('[data-entity]').forEach(node => {
                const nodeName = node.dataset.entity;

                if (!(nodeName in priceListNodes)) {
                    priceListNodes[nodeName] = node.cloneNode(true);
                }
            });

            BX.cleanNode(this.obOffersPriceList);

            this.obOffersPriceList.appendChild(priceListNodes['price-list-block'].cloneNode(true));
        },

        compare: function () {
            this.obCompare.forEach((button) => {
                button.dataset.compared = button.dataset.compared === 'true' ? 'false' : 'true';
                button.setAttribute('title', button.dataset.compared === 'true' ? BX.message('IN_COMPARE') : BX.message('TO_COMPARE'));
            });

            const isCompared = this.obCompare[0].dataset.compared === 'true';
            const productId = this.productType === 3 ? this.offers[this.offerNum].ID : this.product.id.toString();
            let url = isCompared ? this.compareData.compareUrl : this.compareData.compareDeleteUrl;

            if (url) {
                this.setCompared(isCompared);

                url = url.replace('#ID#', productId);

                BX.ajax({
                    method: 'POST',
                    dataType: isCompared ? 'json' : 'html',
                    url: url + (url.indexOf('?') !== -1 ? '&' : '?') + 'ajax_action=Y',
                    onsuccess: (result) => isCompared ? this.compareResult(result) : this.compareDeleteResult(productId)
                });
            }
        },

        compareResult: function (result) {
            if (!result)
                return;

            if (this.offers.length > 0) {
                this.offers[this.offerNum].COMPARED = result.STATUS === 'OK';
            }

            if (result.STATUS === 'OK') {
                BX.onCustomEvent('OnCompareChange');
                BX.onCustomEvent('OnBasketChange');

                BX.Sotbit.B2C.showMessage(BX.message('COMPARE_MESSAGE_OK'));
            } else {
                BX.Sotbit.B2C.showMessage(BX.message('COMPARE_UNKNOWN_ERROR'), {
                    icon: 'error'
                });
            }
        },

        compareDeleteResult: function (productId) {
            BX.onCustomEvent('OnCompareChange');
            BX.onCustomEvent('onCatalogDeleteCompare', [productId]);

            BX.Sotbit.B2C.showMessage(BX.message('COMPARE_MESSAGE_DELETE'));
        },

        setCompared: function (state) {
            if (!this.obCompare.length)
                return;

            this.obCompare.forEach((button) => {
                button.dataset.compared = Boolean(state);
                button.setAttribute('title', button.dataset.compared === 'true' ? BX.message('IN_COMPARE') : BX.message('TO_COMPARE'));
            });
        },

        setCompareInfo: function (comparedIds) {
            if (!Array.isArray(comparedIds))
                return;

            for (var i in this.offers) {
                if (this.offers.hasOwnProperty(i)) {
                    this.offers[i].COMPARED = comparedIds.includes(this.offers[i].ID);
                }
            }
        },

        checkDeletedCompare: function (id) {
            switch (this.productType) {
                case 0: // no catalog
                case 1: // product
                case 2: // set
                case 7: // service
                    if (typeof id === 'undefined' || this.product.id == id) {
                        this.setCompared(false);
                    }

                    break;
                case 3: // sku
                    var i = this.offers.length;
                    while (i--) {
                        if (typeof id === 'undefined') {
                            id = this.offers[i].ID;
                        }

                        if (this.offers[i].ID == id) {
                            this.offers[i].COMPARED = false;
                            this.setCompared(false);
                            break;
                        }
                    }
            }
        },

        initBasketUrl: function () {
            this.basketUrl = (this.basketMode === 'ADD' ? this.basketData.add_url : this.basketData.buy_url);
            switch (this.productType) {
                case 1: // product
                case 2: // set
                case 7: // service
                    this.basketUrl = this.basketUrl.replace('#ID#', this.product.id.toString());
                    break;
                case 3: // sku
                    this.basketUrl = this.basketUrl.replace('#ID#', this.offers[this.offerNum].ID);
                    break;
            }
            this.basketParams = {
                'ajax_basket': 'Y'
            };
            if (this.showQuantity) {
                this.basketParams[this.basketData.quantity] = this.basketActionItemQuantity;
            }
            if (this.basketData.sku_props) {
                this.basketParams[this.basketData.sku_props_var] = this.basketData.sku_props;
            }
        },

        fillBasketProps: function () {
            if (!this.visual.BASKET_PROP_DIV) {
                return;
            }
            var
                i = 0,
                propCollection = null,
                foundValues = false,
                obBasketProps = null;

            if (this.basketData.useProps && !this.basketData.emptyProps) {
                if (this.obPopupProps) {
                    obBasketProps = this.obPopupProps;
                }
            } else {
                obBasketProps = BX(this.visual.BASKET_PROP_DIV);
            }

            if (obBasketProps) {
                propCollection = obBasketProps.getElementsByTagName('select');
                if (propCollection && propCollection.length) {
                    for (i = 0; i < propCollection.length; i++) {
                        if (!propCollection[i].disabled) {
                            switch (propCollection[i].type.toLowerCase()) {
                                case 'select-one':
                                    this.basketActionProps[propCollection[i].name] = propCollection[i].value;
                                    this.basketParams[propCollection[i].name] = propCollection[i].value;
                                    foundValues = true;
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
                propCollection = obBasketProps.getElementsByTagName('input');
                if (propCollection && propCollection.length) {
                    for (i = 0; i < propCollection.length; i++) {
                        if (!propCollection[i].disabled) {
                            switch (propCollection[i].type.toLowerCase()) {
                                case 'hidden':
                                    this.basketActionProps[propCollection[i].name] = propCollection[i].value;
                                    this.basketParams[propCollection[i].name] = propCollection[i].value;
                                    foundValues = true;
                                    break;
                                case 'radio':
                                    if (propCollection[i].checked) {
                                        this.basketActionProps[propCollection[i].name] = propCollection[i].value;
                                        this.basketParams[propCollection[i].name] = propCollection[i].value;
                                        foundValues = true;
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }

            if (!foundValues) {
                this.basketActionProps = {};
                this.basketParams[this.basketData.props] = [];
                this.basketParams[this.basketData.props][0] = 0;
            }
        },

        doDebouncedBasketAction: function (callback) {
            clearTimeout(this.debouncedBasketActionTimeout);

            this.debouncedBasketActionTimeout = setTimeout(callback.bind(this), 1000);
        },

        doBasketAction: function (action) {
            switch (action) {
                case 'ADD':
                    this.basketMode = 'ADD';
                    this.doDebouncedBasketAction(this.basket);
                    break;
                case 'BUY':
                    this.basketMode = 'BUY';
                    this.basket();
                    break;
                case 'REMOVE':
                    this.doDebouncedBasketAction(this.removeFromBasket);
                    break;
            }
        },

        showQuantityBlock: function () {
            this.obBuyBtn.style.display = 'none';
            this.blockNodes.quantity.style.display = '';
        },

        hideQuantityBlock: function () {
            this.obBuyBtn.style.display = '';
            this.blockNodes.quantity.style.display = 'none';
        },

        removeFromBasket: function () {
            let itemId;

            switch (this.productType) {
                case 1: // product
                case 2: // set
                case 7: // service
                    itemId = this.product.id.toString();
                    break;
                case 3: // sku
                    itemId = this.offers[this.offerNum].ID;
                    break;
            }

            this.fillBasketProps();
            BX.ajax.runAction('sotbit:b2c.basket.remove', {
                data: {
                    productData: {
                        'PRODUCT_ID': itemId,
                        'PROPS': [],
                    },
                    siteId: BX.message('SITE_ID'),
                    quantity: Math.abs(this.basketActionItemQuantity)
                }
            }).then(result => {
                if (result.status === 'success') {
                    BX.onCustomEvent('OnBasketChange');
                    BX.Sotbit.B2C.showMessage(BX.message("TITLE_SUCCESSFUL_REMOVE"));

                    if (this.productType === 3) {
                        this.offers[this.offerNum].currentBasketQuantity = parseFloat(this.offers[this.offerNum].currentBasketQuantity) - 1;
                    }
                } else {
                    BX.Sotbit.B2C.showMessage(BX.message("BASKET_UNKNOWN_ERROR"), {icon: 'error'});
                }
            });
            this.basketActionItemQuantity = 0;
        },

        sendToBasket: function () {
            if (!this.canBuy) {
                return;
            }

            // check recommendation
            if (this.product && this.product.id && this.bigData) {
                this.rememberProductRecommendation();
            }

            this.initBasketUrl();
            this.fillBasketProps();
            BX.ajax({
                method: 'POST',
                dataType: 'json',
                url: this.basketUrl,
                data: this.basketParams,
                onsuccess: BX.proxy(this.basketResult, this)
            });
            this.basketActionItemQuantity = 0;
        },

        showProductPropertiesPopup: async function () {
            const [result, popup] = await BX.Sotbit.B2C.showPopup({
                title: BX.message('TITLE_BASKET_PROPS'),
                html: BX(this.visual.BASKET_PROP_DIV).innerHTML,
                confirmButtonText: BX.message("BTN_MESSAGE_SEND_PROPS"),
                width: '650px',
                useCustomScroll: false,
                customClass: {
                    confirmButton: 'btn'
                },
                didOpen: (popup) => {
                    popup.querySelectorAll('select:not([class])').forEach((element) => BX.Sotbit.B2C.createCustomSelect(element));
                }
            });

            this.obPopupProps = popup.getHtmlContainer();

            result.then((r) => {
                if (r.isConfirmed) {
                    this.sendToBasket();
                }
            });
        },

        basket: function () {
            if (!this.canBuy) {
                return;
            }
            switch (this.productType) {
                case 1: // product
                case 2: // set
                case 7: // service
                    if (this.basketData.useProps && !this.basketData.emptyProps) {
                        this.showProductPropertiesPopup();
                    } else {
                        this.sendToBasket();
                    }
                    break;
                case 3: // sku
                    this.sendToBasket();
                    break;
            }
        },

        basketResult: async function (arResult) {
            if (!BX.type.isPlainObject(arResult))
                return;

            var successful;

            successful = arResult.STATUS === 'OK';

            if (successful) {
                this.setAnalyticsDataLayer('addToCart');
            }

            if (successful && this.basketAction === 'BUY') {
                this.basketRedirect();
            } else {
                if (successful) {
                    BX.onCustomEvent('OnBasketChange');

                    if (BX.findParent(this.obProduct, {className: 'bx_sale_gift_main_products'}, 10)) {
                        BX.onCustomEvent('onAddToBasketMainProduct', [this]);
                    }

                    const messageObject = {};
                    if (BX.Sotbit.B2C.useMinOrderPrice === true) {
                        const result = await BX.ajax.runAction('sotbit:b2c.order.getRemainderPrice', {
                            data: {
                                siteId: BX.message('SITE_ID')
                            },
                        });

                        messageObject.subMessage = result.data;
                    }

                    BX.Sotbit.B2C.showMessage(BX.message("TITLE_SUCCESSFUL"), messageObject);

                    if (this.showQuantity) {
                        this.showQuantityBlock();

                        if (!parseFloat(this.obQuantity.value)) {
                            this.obQuantity.value = this.stepQuantity;
                        }

                        if (this.productType === 3) {
                            const currentOffer = this.offers[this.offerNum];

                            if (currentOffer.currentBasketQuantity) {
                                currentOffer.currentBasketQuantity++;
                            } else {
                                currentOffer.currentBasketQuantity = 1;
                            }
                        } else {
                            if (parseFloat(this.obQuantity.value) === this.maxQuantity) {
                                this.obQuantityUp.classList.add('disabled');
                            } else {
                                this.obQuantityUp.classList.remove('disabled');
                            }
                        }
                    }
                } else {
                    BX.Sotbit.B2C.showMessage(arResult.MESSAGE || BX.message("BASKET_UNKNOWN_ERROR"), {icon: 'error'});
                }
            }
        },

        basketRedirect: function () {
            location.href = (this.basketData.basketUrl ? this.basketData.basketUrl : BX.message('BASKET_URL'));
        },
    };
})(window);
