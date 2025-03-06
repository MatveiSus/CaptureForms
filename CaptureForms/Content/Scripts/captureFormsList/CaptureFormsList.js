; (function (ng) {
    'use strict';

    var captureFormsListCtrl = function ($http, $uibModal, uiGridConstants, uiGridCustomConfig, toaster, SweetAlert, $q) {
        var ctrl = this;

        ctrl.mode = 'main';

        ctrl.$onInit = function () {
            var menuBlock = $('.row .flex-grow-n.col-fixed-size-md')[0];
            var contentBlock = $('.row .flex-grow.flex-basis-n.flex-width-n')[0];

            if (menuBlock != null && menuBlock.length > 0) {
                menuBlock.classList.add('col-xs-2');
            }

            if (contentBlock != null && contentBlock.length > 0) {
                contentBlock.classList.remove('flex-width-n');
                contentBlock.classList.add('col-xs-10');
                contentBlock.classList.add('capture-content-padding');
            }
        };

        var columnDefsForms = [
            {
                name: 'FormName',
                displayName: 'Название',
                filter: {
                    placeholder: 'Название',
                    type: uiGridConstants.filter.INPUT,
                    name: 'FormName',
                },
                enableCellEdit: true
            },
            {
                name: 'HeaderName',
                displayName: 'Заголовок',
                filter: {
                    placeholder: 'Заголовок',
                    type: uiGridConstants.filter.INPUT,
                    name: 'HeaderName',
                },
                enableCellEdit: true
            },
            {
                name: 'Enabled',
                displayName: 'Активен',
                enableCellEdit: false,
                cellTemplate: '<ui-grid-custom-switch row="row" class="js-grid-not-clicked"></ui-grid-custom-switch>',
                width: 90,
                filter: {
                    placeholder: 'Активность',
                    name: 'Enabled',
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [{ label: 'Активные', value: true }, { label: 'Неактивные', value: false }]
                }
            },
            {
                name: '_serviceColumn',
                displayName: '',
                width: 80,
                cellTemplate:
                    '<div class="ui-grid-cell-contents js-grid-not-clicked"><div>' +
                    '<a href="" class="link-invert ui-grid-custom-service-icon fa fa-pencil fa-pencil-alt" ng-click="grid.appScope.$ctrl.gridExtendCtrl.loadForm(row.entity.FormId)"></a> ' +
                    '<ui-grid-custom-delete url="../captureFormsAdmin/deleteForm" params="{\'FormId\': row.entity.FormId}"></ui-grid-custom-delete>' +
                    '</div></div>'
            }
        ];

        ctrl.gridFormsOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs: columnDefsForms,
            uiGridCustom: {
                rowClick: function ($event, row) {
                    ctrl.loadForm(row.entity.FormId);
                },
                selectionOptions: [
                    {
                        text: 'Удалить выделенные',
                        url: '../captureFormsAdmin/deleteForms',
                        field: 'FormId',
                        before: function () {
                            return SweetAlert.confirm("Вы уверены, что хотите удалить?", { title: "Удаление" }).then(function (result) {
                                return result === true || result.value ? $q.resolve('sweetAlertConfirm') : $q.reject('sweetAlertCancel');
                            });
                        }
                    }
                ]
            }
        });

        ctrl.gridFormsOnInit = function (grid) {
            ctrl.gridForms = grid;
        };

        ctrl.loadForm = function (id) {
            ctrl.selectForm(id);
        };

        ctrl.resetForm = function () {
            ctrl.mode = 'main';

            ctrl.entityTypes = {};
            ctrl.entityType = { Id: 0, Value: "Главная страница" };

            ctrl.placementTypes = {};
            ctrl.placementType = { Id: 0, Value: "" };

            ctrl.LeadGroupIds = {};

            ctrl.showFormEntities = true;
            ctrl.showFormFields = true;
        }

        ctrl.entityTypes = {};
        ctrl.entityType = { Id: 0, Value: "Главная страница" };

        ctrl.placementTypes = {};
        ctrl.placementType = { Id: 0, Value: "" };

        ctrl.LeadGroupIds = {};

        ctrl.showFormEntities = true;
        ctrl.showFormFields = true;

        ctrl.selectForm = function (formId) {
            ctrl.FormId = formId;

            ctrl.mode = ctrl.FormId !== undefined && ctrl.FormId !== 0 ? 'edit' : 'add';

            ctrl.viewMode = "main";
            ctrl.gridFormsEntitiesUrl = '../captureFormsAdmin/getFormsEntities?FormId=' + ctrl.FormId;
            ctrl.gridFormsFieldsUrl = '../captureFormsAdmin/getFormsFields?FormId=' + ctrl.FormId;

            ctrl.showFormFields = true;

            ctrl.ImageSrc = "../modules/CaptureForms/content/Images/captureBlock-small.png";
            ctrl.Entities = [];
            ctrl.Fields = [];

            ctrl.getForm(ctrl.FormId);

            ctrl.getEntityTypes();
            ctrl.getPlacementTypes(ctrl.entityType.Id);

            ctrl.BackColorCodeRequired = true;

            ctrl.BackColorPickerOptions = {
                swatchBootstrap: false,
                format: 'hex',
                alpha: false,
                'case': 'lower',
                swatchOnly: false,
                allowEmpty: true,
                required: false,
                preserveInputFormat: false,
                restrictToFormat: false,
                inputClass: 'form-control'
            };
            ctrl.BackColorPickerEventApi = {};

            ctrl.BackColorPickerEventApi.onBlur = function () {
                ctrl.BackColorPickerApi.getScope().AngularColorPickerController.update();
            };
        };

        ctrl.changeEntityType = function () {
            ctrl.getPlacementTypes(ctrl.entityType.Id);
        }

        ctrl.getEntityTypes = function () {
            $http.get('../captureFormsAdmin/getentitytypes', { params: { rnd: Math.random() } })
                .then(function (response) {
                    ctrl.entityTypes = response.data;
                    ctrl.entityType = ctrl.entityTypes[0];
                });
        }

        ctrl.getPlacementTypes = function (entityType) {
            $http.get('../captureFormsAdmin/getplacementtypes', { params: { entityType: entityType, rnd: Math.random() } })
                .then(function (response) {
                    ctrl.placementTypes = response.data;
                    ctrl.placementType = ctrl.placementTypes[0];
                });
        }

        ctrl.getLeadGroupIds = function () {
            $http.get('../captureFormsAdmin/getLeadGroupIds', { params: { rnd: Math.random() } })
                .then(function (response) {
                    ctrl.LeadGroupIds = response.data;
                    if (ctrl.LeadGroupId > 0) {
                        ctrl.LeadGroup = ctrl.LeadGroupIds.filter(x => x.Id === ctrl.LeadGroupId)[0];
                    }
                    else {
                        ctrl.LeadGroup = { Id: ctrl.LeadGroupIds[1].Id, Value: ctrl.LeadGroupIds[1].Value };
                    }
                });
        };

        ctrl.getForm = function (FormId) {
            $http.get('../captureFormsAdmin/getForm', { params: { FormId: FormId, rnd: Math.random() } }).then(function (response) {
                var data = response.data;
                if (data != null) {
                    ctrl.FormName = data.FormName;
                    ctrl.HeaderName = data.HeaderName;
                    ctrl.ButtonName = data.ButtonName;
                    ctrl.Captcha = data.Captcha;
                    ctrl.Margin = data.Margin;
                    ctrl.Padding = data.Padding;
                    ctrl.BackColor = data.BackColor;
                    ctrl.EnabledAgreement = data.EnabledAgreement;
                    ctrl.TextAgreement = data.TextAgreement;
                    ctrl.LeadGroupId = data.LeadGroupId;
                    ctrl.TextAfterSend = data.TextAfterSend;
                    ctrl.Enabled = data.Enabled;
                    ctrl.MobileActive = data.MobileActive;
                    ctrl.NoShowForm = data.NoShowForm;
                    ctrl.Entities = data.Entities;
                    ctrl.Fields = data.Fields;
                    ctrl.getLeadGroupIds();
                }

                ctrl.formInited = true;
            });
        }

        ctrl.save = function () {
            ctrl.btnSleep = true;

            if (ctrl.LeadGroup !== undefined && ctrl.LeadGroup.Id !== undefined) {
                ctrl.LeadGroupId = ctrl.LeadGroup.Id;
            }

            var params = {
                FormId: ctrl.FormId,
                FormName: ctrl.FormName,
                HeaderName: ctrl.HeaderName,
                Enabled: ctrl.Enabled,
                MobileActive: ctrl.MobileActive,
                ButtonName: ctrl.ButtonName,
                Captcha: ctrl.Captcha,
                Margin: ctrl.Margin,
                Padding: ctrl.Padding,
                BackColor: ctrl.BackColor,
                EnabledAgreement: ctrl.EnabledAgreement,
                TextAgreement: ctrl.TextAgreement,
                LeadGroupId: ctrl.LeadGroupId,
                TextAfterSend: ctrl.TextAfterSend,
                NoShowForm: ctrl.NoShowForm,
                Entities: ctrl.Entities,
                rnd: Math.random()
            };

            var url = ctrl.mode == "add" ? '../captureFormsAdmin/addForm' : '../captureFormsAdmin/updateForm';

            $http.post(url, params).then(function (response) {
                var data = response.data;
                if (data.result == true) {
                    toaster.pop("success", "", ctrl.mode == "add" ? "Форма добавлена" : "Изменения сохранены");
                    ctrl.resetForm();
                } else {
                    toaster.pop("error", "Ошибка", "Ошибка при " + ctrl.mode == "add" ? "создании" : "редактировании");
                }
                ctrl.btnSleep = false;
            });
        }

        ctrl.bindingEntity = function (result, type) {
            var entityId = ctrl.getEntityIdByType(result, type);
            if (entityId == -1 || entityId == undefined) {
                toaster.pop('error', '', 'Не удалось привязать объект');
                return;
            }

            entityId = result.ids != undefined && result.ids.length > 0 ? entityId[0] : entityId;
            entityId = Number(entityId);
            $http.post('../captureFormsAdmin/bindingEntity',
                {
                    FormId: ctrl.FormId,
                    entityId: entityId,
                    entityType: ctrl.entityType.Id,
                    placement: ctrl.placementType.Id,
                    productsIds: result.ids
                }).then(function (response) {
                    if (response.data.result === true) {
                        toaster.pop('success', '', result.ids != null && result.ids.length > 0 ? response.data.obj : 'Объект привязан к форме.');
                    }
                    else {
                        toaster.pop('error', '', response.data.errors.length > 0 ? response.data.errors[0] : 'Не удалось привязать объект');
                    }

                    ctrl.gridFormsEntities.fetchData();
                });
        };

        ctrl.getEntityIdByType = function (result, type) {
            switch (type) {
                case 'product': return result.ids.length > 0 ? result.ids : -1;
                case 'category':
                case 'productsofcategory':
                    return result.categories[0];
                case 'brand': return result.brandId;
                case 'new': return result.newsId;
                case 'staticpage': return result.staticPageId;
                case 'mainpage': return 0;
            }
            return -1;
        }

        var columnDefsFormsEntitites = [
            {
                name: 'EntityName',
                displayName: 'Название',
                cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{row.entity.Link}}/edit/{{row.entity.EntityId}}" target="_blank">{{COL_FIELD}}</a></div>',
                filter: {
                    placeholder: 'Название',
                    type: uiGridConstants.filter.INPUT,
                    name: 'EntityName',
                }
            },
            {
                name: 'EntityType',
                displayName: 'Тип объекта',
                filter: {
                    placeholder: 'Тип объекта',
                    name: 'Type',
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [
                        { label: 'Главная страница', value: 0 },
                        { label: 'Товар', value: 1 },
                        { label: 'Категория', value: 2 },
                        { label: 'Бренд', value: 3 },
                        { label: 'Новость', value: 4 },
                        { label: 'Статическая страница', value: 5 },
                        { label: 'Все товары категории', value: 6 }
                    ]
                },
                enableSorting: false
            },
            {
                name: 'PlacementType',
                displayName: 'Место',
                filter: {
                    placeholder: 'Место',
                    name: 'Placement',
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [
                        { label: 'Начало страницы', value: 0 },
                        { label: 'Конец страницы', value: 1 },
                        { label: 'Над вкладками', value: 2 },
                        { label: 'Под вкладками', value: 3 },
                        { label: 'Над описанием', value: 4 },
                        { label: 'Над товарами', value: 5 },
                        { label: 'Под товарами', value: 6 },
                        { label: 'Над каруселью', value: 7 },
                        { label: 'Под каруселью', value: 8 },
                        { label: 'Под товарами на главной', value: 9 }
                    ]
                },
                enableSorting: true
            },
            {
                name: '_serviceColumn',
                displayName: '',
                width: 80,
                cellTemplate:
                    '<div class="ui-grid-cell-contents js-grid-not-clicked"><div>' +
                    '<a href="" class="link-invert ui-grid-custom-service-icon fa fa-pencil fa-pencil-alt" ng-click="grid.appScope.$ctrl.gridExtendCtrl.loadFormEntity(row.entity.FormEntityId)"></a> ' +
                    '<ui-grid-custom-delete url="../captureFormsAdmin/deleteFormEntity" params="{\'FormEntityId\': row.entity.FormEntityId}"></ui-grid-custom-delete>' +
                    '</div></div>',
                enableSorting: false
            }
        ];

        ctrl.gridFormsEntitiesOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs: columnDefsFormsEntitites,
            uiGridCustom: {
                rowClick: function ($event, row) {
                    ctrl.loadFormEntity(row.entity.FormEntityId);
                },
                selectionOptions: [
                    {
                        text: 'Удалить выделенные',
                        url: '../captureFormsAdmin/deleteFormEntities',
                        field: 'FormEntityId',
                        before: function () {
                            return SweetAlert.confirm("Вы уверены, что хотите удалить?", { title: "Удаление" }).then(function (result) {
                                return result === true || result.value ? $q.resolve('sweetAlertConfirm') : $q.reject('sweetAlertCancel');
                            });
                        }
                    }
                ]
            }
        });

        ctrl.loadFormEntity = function (id) {
            $uibModal.open({
                bindToController: true,
                controller: 'ModalAddEditFormEntityCtrl',
                controllerAs: 'ctrl',
                templateUrl: '../modules/captureForms/content/scripts/captureFormsList/modal/addEditFormEntity.html',
                resolve: {
                    FormEntityId: function () {
                        return id;
                    }
                }
            }).result.then(function (result) {
                ctrl.gridFormsEntities.fetchData();
                return result;
            }, function (result) {
                return result;
            });
        };

        ctrl.gridFormsEntitiesOnInit = function (grid) {
            ctrl.gridFormsEntities = grid;
        };

        var columnDefsFormsFields = [
            {
                name: 'FieldName',
                displayName: 'Название',
                filter: {
                    placeholder: 'Название',
                    type: uiGridConstants.filter.INPUT,
                    name: 'FieldName',
                }
            },
            {
                name: 'FieldType',
                displayName: 'Тип поля',
                filter: {
                    placeholder: 'Тип поля',
                    name: 'FieldTypeId',
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [
                        { label: 'Текстовое поле', value: 0 },
                        { label: 'Email', value: 1 },
                        { label: 'Телефон', value: 2 },
                        { label: 'Многострочное текстовое поле', value: 3 }
                    ]
                },
                enableSorting: false
            },
            {
                name: 'FieldSortOrder',
                displayName: 'Сортировка',
                filter: {
                    placeholder: 'Сортировка',
                    type: uiGridConstants.filter.INPUT,
                    name: 'FieldSortOrder',
                }
            },
            {
                name: '_serviceColumn',
                displayName: '',
                width: 80,
                cellTemplate:
                    '<div class="ui-grid-cell-contents js-grid-not-clicked"><div>' +
                    '<a href="" class="link-invert ui-grid-custom-service-icon fa fa-pencil fa-pencil-alt" ng-click="grid.appScope.$ctrl.gridExtendCtrl.loadFormField(row.entity.FormFieldId)"></a> ' +
                    '<ui-grid-custom-delete url="../captureFormsAdmin/deleteFormField" params="{\'FormFieldId\': row.entity.FormFieldId}"></ui-grid-custom-delete>' +
                    '</div></div>',
                enableSorting: false
            }
        ];

        ctrl.gridFormsFieldsOptions = ng.extend({}, uiGridCustomConfig, {
            columnDefs: columnDefsFormsFields,
            uiGridCustom: {
                rowClick: function ($event, row) {
                    ctrl.loadFormField(row.entity.FormFieldId);
                },
                selectionOptions: [
                    {
                        text: 'Удалить выделенные',
                        url: '../captureFormsAdmin/deleteFormFields',
                        field: 'FormFieldId',
                        before: function () {
                            return SweetAlert.confirm("Вы уверены, что хотите удалить?", { title: "Удаление" }).then(function (result) {
                                return result === true || result.value ? $q.resolve('sweetAlertConfirm') : $q.reject('sweetAlertCancel');
                            });
                        }
                    }
                ]
            }
        });

        ctrl.loadFormField = function (id) {
            $uibModal.open({
                bindToController: true,
                controller: 'ModalAddEditFormFieldCtrl',
                controllerAs: 'ctrl',
                templateUrl: '../modules/captureForms/content/scripts/captureFormsList/modal/addEditFormField.html',
                resolve: {
                    FormFieldId: function () {
                        return id;
                    }
                }
            }).result.then(function (result) {
                ctrl.gridFormsFields.fetchData();
                return result;
            }, function (result) {
                return result;
            });
        };

        ctrl.gridFormsFieldsOnInit = function (grid) {
            ctrl.gridFormsFields = grid;
        };
    };

    captureFormsListCtrl.$inject = ['$http', '$uibModal', 'uiGridConstants', 'uiGridCustomConfig', 'toaster', 'SweetAlert', '$q'];

    ng.module('captureFormsList', [])
        .controller('captureFormsListCtrl', captureFormsListCtrl)
        .component('captureFormsList', {
            templateUrl: '../modules/captureForms/content/Scripts/captureFormsList/templates/captureFormsList.html',
            controller: 'captureFormsListCtrl',
            bindings: {
                redirectUrl: '=',
            }
        });

})(window.angular);