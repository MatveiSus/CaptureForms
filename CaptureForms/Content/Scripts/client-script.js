$(document).ready(function () {
    var Forms = $('.capture-form-module-form');
    setTimeout(function () {
        Forms = $('.capture-form-module-form');
        if (Forms.length > 0) {
            Forms.each(function () {
                var placement = $(this).attr('data-capture-form-placement');
                var isMobile = $(this).attr('data-capture-form-is-mobile');
                var type = $(this).attr("data-capture-form-entity-type");

                if (placement !== undefined) {
                    var selector = '';
                    var after = false;
                    switch (placement) {

                        case "aftertabs":
                            after = true;
                            selector = '[data-tabs]';
                            break;

                        case "beforetabs":
                            after = false;
                            selector = '[data-tabs]';
                            break;

                        case "startofpage":
                        case "endofpage":
                            after = placement === "endofpage";

                            switch (type) {
                                case "brand":
                                    selector = $('.brand-txt');
                                    break;
                                case "new":
                                    selector = $('.news-item-content').last();
                                    break;
                                case "staticpage":
                                    selector = $('.staticpage-content').last();
                                    if (isMobile === "True" && selector.length < 1) {
                                        selector = $('.block-usr-txt');
                                    }
                                    break;
                                case "mainpage":
                                    selector = $('.site-body-main').last().children().last();
                                    after = true;
                                    if (isMobile === "True") {
                                        selector = $('.site-footer');
                                        if (selector.length < 1) {
                                            selector = $('#footer');
                                        }
                                        after = false;
                                    }
                                    break;
                            }

                            break;

                        case "afterproducts":
                            after = true;

                            if (isMobile === "True") {
                                selector = $('.catalog-view');
                                if (selector.length == 0) {
                                    selector = $('.table-responsive-scroll-wrap');
                                }

                                if (selector.length == 0) {
                                    selector = $('.prod-cell').first().parent('tr').parent('tbody').parent('table');
                                }
								
                                if (selector.length == 0) {
                                    selector = $('.main-product-cell');
                                }

                                if (selector.length > 0) {
                                    $(this).insertAfter(selector);
                                    $(this).css('display', 'block');
                                }
                                return;
                            } else { // Desktop version
								selector = $('.pagenumberer'); // Находим элемент пагинации
								if (selector.length > 0) {
									$(this).insertAfter(selector);
									$(this).css('display', 'block');
									return; // Прерываем выполнение case, форма уже размещена
								}
								  // Если пагинация не найдена, можно добавить fallback логику:
									selector = $('.products-view-block').first().parent('.products-view');
									if (selector.length < 1) {
										selector = $('.product-categories');
									}
									if (selector.length < 1) {
										selector = $('.category-description').first();
									}
									if (selector.length < 1) {
										selector = $('.breads');
									}
								
							}
							break;

                        case "beforeproducts":
                            after = false;

                            if (isMobile === "True") {
                                selector = $('.catalog-view');
                                if (selector.length == 0) {
                                    selector = $('.table-responsive-scroll-wrap');
                                }

                                if (selector.length == 0) {
                                    selector = $('.prod-cell').first().parent('tr').parent('tbody').parent('table');
                                }

                                if (selector.length == 0) {
                                    selector = $('.catalog-view');
                                }

                                if (selector.length == 0) {
                                    after = true;
                                    selector = $('.main-product-cell');
                                }

                                if (selector.length > 0) {
                                    if (after)
                                        $(this).insertAfter(selector);
                                    else
                                        $(this).insertBefore(selector);

                                    $(this).css('display', 'block');
                                }
                                return;
                            }

                            selector = $('.products-view-block').first().parent('.products-view');
                            if (selector.length > 0) {
                                $(this).insertBefore(selector);
                                $(this).css('display', 'block');
                                return;

                            }

                            if (selector.length < 1) {
                                selector = $('.category-description').first();
                                if (selector.length > 0) {
                                    $(this).insertAfter(selector);
                                    $(this).css('display', 'block');
                                    return;
                                }
                            }

                            if (selector.length < 1) {
                                selector = $('.tags');
                            }
                            if (selector.length < 1) {
                                selector = $('.products-view-sort').parent('.row').parent('.row');
                            }
                            if (selector.length < 1) {
                                selector = $('.product-categories');
                            }
                            if (selector.length < 1) {
                                selector = $('.category-description').first();
                            }
                            if (selector.length < 1) {
                                selector = $('.breads');
                                after = true;
                            }

                            if (selector.length < 1) {
                                selector = $('.page-title-row');
                                if (selector.length > 0) {
                                    $(this).insertAfter(selector);
                                    $(this).css('display', 'block');
                                    return;
                                }
                            }

                            break;

                        case "beforedescription":
                            after = false;
                            //if (selector.length < 1) {
                            //    selector = $('.tags');
                            //}
                            selector = $('.category-description').first();
                            if (selector.length > 0) {
                                var selectorBefore = selector.prev('.breads');
                                if (selectorBefore.length < 1) {
                                    selector = selectorBefore;
                                }
                            }

                            if (isMobile === "True") {
                                if (selector.length < 1) {
                                    selector = $('.main-product-cell');
                                    if (selector.length < 1) {
                                        selector = $('.back-link');
                                    }
                                    if (selector.length > 0) {
                                        $(this).insertAfter(selector);
                                        $(this).css('display', 'block');
                                        return;
                                    }
                                }
                            }

                            if (selector.length < 1) {
                                selector = $('.products-view-sort').parent('.row').parent('.row');
                                if (selector.length < 1) {
                                    selector = $('.products-view-sort').parent('.row').parent().parent('.row');
                                }
                            }
                            if (selector.length < 1) {
                                selector = $('.product-categories');
                            }
                            if (selector.length < 1) {
                                selector = $('.breads');
                                after = true;
                            }

                            if (selector.length < 1) {
                                selector = $('.page-title-row');
                                if (selector.length > 0) {
                                    $(this).insertAfter(selector);
                                    $(this).css('display', 'block');
                                    return;
                                }
                            }
                            break;

                        case "aftermainpageproducts":
                            after = true;
                            selector = $('.products-specials-container');

                            if (isMobile === "True") {
                                selector = $('.sale-section');
                                if (selector.length < 1) {
                                    selector = $('.novelty-section');
                                }
                                if (selector.length < 1) {
                                    selector = $('.bestsellers-section');
                                }
                            }
                            break;

                        case "aftercarousel":
                        case "beforecarousel":
                            after = placement === "aftercarousel";
                            selector = $('.slider-main-block');
                            if (isMobile === "True") {
                                if (after === false) {
                                    selector = $('#content');
                                }
                                else {
                                    selector = $('.bestsellers-section');
                                    if (selector.length < 1) {
                                        selector = $('.novelty-section');
                                    }
                                    if (selector.length < 1) {
                                        selector = $('.sale-section');
                                    }
                                    after = false;
                                }
                            }
                            break;
                    }


                    if (selector != '' && selector != null && selector.length > 0) {
                        if (after) {
                            $(this).insertAfter(selector);
                        } else {
                            $(this).insertBefore(selector);
                        }

                        $(this).css('display', 'block');
                    }

                }
            });
        }
    }, 500);

    var captureFormBlock = $('.capture-form-module-form');

    if (captureFormBlock.length > 0) {
        var parentWidth = captureFormBlock.parent().width();
        if (parentWidth !== undefined) {
            var captureFormBlockWidth = captureFormBlock.width();
            if (parentWidth < captureFormBlockWidth) {
                captureFormBlock.css('width', '100%');
                captureFormBlock = captureFormBlock.find('.capture-form-br');
                captureFormBlock.remove();
            }
        }
    }

    var fieldPhone = $('.lp-form__field_phone');
    if (fieldPhone.length > 0) {
        fieldPhone.on('click', function () {
            $(this).attr("placeholder", "+7___ ___ ____");
        });
    }
});

function addLead(item) {
    var leadGroupId = $(item).attr("lead-groupid");
    var root = $(item).parent().parent().parent().parent();
    var fields = root.find(".capture-forms");
    var paramstring = "";
    var isValid = true;
    fields.each(function () {
        var obj = $(this);
        var required = obj.attr("required");
        if (!!required) {
            if (required.length > 0 && obj.val().length == 0) {
                isValid = false;
            }
        }
        var label = obj.attr("placeholder");
        var attrType = obj.attr("type");
        if (!!!attrType) attrType = "";
        if (attrType == "email" && (obj.val().indexOf("@") == -1 || obj.val().indexOf(".") == -1)) {
            isValid = false;
        }
        paramstring = paramstring + label + ":" + obj.val() + ":" + attrType + ";";
    });

    var iframe = root.find(".iframe-capture-forms");
    var captchaFrame = iframe.length > 0 ? iframe[0].contentWindow.CaptchaSource : null;

    var captchaExist = typeof (captchaFrame) != "undefined" && captchaFrame != null;
    var captchaSource = captchaExist ? captchaFrame.InstanceId : null;

    var captchaCode = !!($("#CaptchaCode")) ? $("#CaptchaCode").val() : null;

    var agreement = root.find("#EnabledAgreement");
    if (agreement.length > 0 && agreement[0].checked !== true) {
        isValid = false;
    }

    if (isValid) {
        $.ajax({
            dataType: "text",
            cache: false,
            type: "GET",
            url: "CaptureFormsClient/AddLead",
            data: {
                paramstring: paramstring,
                leadGroupId: leadGroupId,
                captchaCode: captchaCode,
                captchaSource: captchaSource
            },
            success: function (data) {
                if (data != null && data.length > 0 && data.indexOf("error") == -1) {
                    root.find(".capture-form-module-form-form").hide();
                    root.find(".capture-form-module-form-success").show();
                }
                else {
                    root.find("#captchaError").show();
                    if (captchaExist) {
                        captchaFrame.ReloadImage();
                    }
                    setTimeout(function () {
                        root.find("#captchaError").hide()
                    }, 2000);
                }
            },
            error: function (data) {
                //console.log(data);
            }
        });
    }
}

function reloadCaptcha() {
    var iframe = document.getElementById('iframe-capture-forms');
    if (iframe != undefined) {
        iframe.src = iframe.src;
    }
}
document.addEventListener('DOMContentLoaded', function () {
    reloadCaptcha();
    setTimeout(function () { reloadCaptcha() }, 1000);
});