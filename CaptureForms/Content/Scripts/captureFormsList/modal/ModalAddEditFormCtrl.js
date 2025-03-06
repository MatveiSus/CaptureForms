; (function (ng) {
    'use strict';

    var ModalAddEditFormCtrl = function ($uibModalInstance, $uibModal, $http, $q, uiGridConstants, uiGridCustomConfig, toaster, SweetAlert) {
        var ctrl = this;
        ctrl.formInited = false;

        ctrl.entityTypes = {};
        ctrl.entityType = { Id: 0, Value: "Главная страница" };

        ctrl.placementTypes = {};
        ctrl.placementType = { Id: 0, Value: "" };

        ctrl.LeadGroupIds = {};

        ctrl.showFormEntities = true;
        ctrl.showFormFields = true;

        ctrl.$onInit = function () {
            var params = ctrl.$resolve;
            ctrl.FormId = params.FormId != null ? params.FormId : 0;
            ctrl.mode = ctrl.FormId != 0 ? "edit" : "add";
            ctrl.viewMode = "main";
            ctrl.gridFormsEntitiesUrl = '../captureFormsAdmin/getFormsEntities?FormId=' + ctrl.FormId;
            ctrl.gridFormsFieldsUrl = '../captureFormsAdmin/getFormsFields?FormId=' + ctrl.FormId;

            ctrl.showFormFields = true;

            ctrl.ImageSrc = "../modules/CaptureForms/content/Images/captureBlock-small.png";
            ctrl.Entities = [];
            ctrl.Fields = [];

            if (ctrl.mode == "add") {
                ctrl.FormName = "";
                ctrl.HeaderName = "";
                ctrl.ButtonName = "Отправить";
                ctrl.Captcha = false;
                ctrl.Margin = 0;
                ctrl.Padding = 0;
                ctrl.BackColor = "e9f0f7";
                ctrl.EnabledAgreement = false;
                ctrl.TextAgreement = "";
                ctrl.LeadGroupId = -1;
                ctrl.TextAfterSend = "";
                ctrl.Enabled = true;
                ctrl.MobileActive = true;
                ctrl.formInited = true;
                ctrl.getLeadGroupIds();
            }
        };

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

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

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
                Entities: ctrl.Entities,
                rnd: Math.random()
            };

            var url = ctrl.mode == "add" ? '../captureFormsAdmin/addForm' : '../captureFormsAdmin/updateForm';

            $http.post(url, params).then(function (response) {
                var data = response.data;
                if (data.result == true) {
                    toaster.pop("success", "", ctrl.mode == "add" ? "Форма добавлена" : "Изменения сохранены");
                    $uibModalInstance.close('saveForm');
                } else {
                    toaster.pop("error", "Ошибка", "Ошибка при " + ctrl.mode == "add" ? "создании" : "редактировании");
                    ctrl.btnSleep = false;
                }
            });
        }
    };

    ModalAddEditFormCtrl.$inject = ['$uibModalInstance', '$uibModal', '$http', '$q', 'uiGridConstants', 'uiGridCustomConfig', 'toaster', 'SweetAlert'];

    ng.module('uiModal')
        .controller('ModalAddEditFormCtrl', ModalAddEditFormCtrl);

    var ModalAddEditFormEntityCtrl = function ($uibModalInstance, $http, $q, toaster, SweetAlert) {
        var ctrl = this;
        ctrl.formInited = false;

        ctrl.$onInit = function () {
            var params = ctrl.$resolve;

            ctrl.FormEntityId = params.FormEntityId != null ? params.FormEntityId : 0;
            ctrl.mode = ctrl.FormEntityId != 0 ? "edit" : "add";

            ctrl.FormId = 0;
            ctrl.formEntityTypeId = 0;
            ctrl.formEntityName = "";
            ctrl.formEntityType = "";

            ctrl.formPlacementId = 0;
            ctrl.formPlacementTypes = {};
            ctrl.formPlacementType = {};

            if (ctrl.mode == "add") {
                ctrl.enabled = true;
                ctrl.formInited = true;
            } else {
                ctrl.getFormEntity(ctrl.FormEntityId);
            }
        };


        ctrl.getPlacementTypes = function (entityType) {
            $http.get('../captureFormsAdmin/getplacementtypes', { params: { entityType: entityType, rnd: Math.random() } })
                .then(function (response) {
                    ctrl.formPlacementTypes = response.data;
                    ctrl.formPlacementType = ctrl.formPlacementTypes[0];

                    for (var i = 0; i < ctrl.formPlacementTypes.length; i++) {
                        if (ctrl.formPlacementTypes[i].Id == ctrl.formPlacementId) {
                            ctrl.formPlacementType = ctrl.formPlacementTypes[i];
                        }
                    }
                });
        }

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getFormEntity = function (FormEntityId) {
            $http.get('../captureFormsAdmin/getFormEntity', { params: { FormEntityId: FormEntityId, rnd: Math.random() } }).then(function (response) {
                var data = response.data;
                if (data != null) {
                    ctrl.FormId = data.FormId;
                    ctrl.formEntityTypeId = data.Type;
                    ctrl.formEntityName = data.EntityName;
                    ctrl.formEntityType = data.EntityType;
                    ctrl.formPlacementId = data.Placement;

                    ctrl.getPlacementTypes(ctrl.formEntityTypeId);
                }

                ctrl.captureFormsAddEditFormEntityForm.$setPristine();
                ctrl.formInited = true;
            });
        }

        ctrl.save = function () {
            ctrl.btnSleep = true;

            var params = {
                FormEntityId: ctrl.FormEntityId,
                placement: ctrl.formPlacementType.Id,
                entityName: ctrl.formEntityName,
                rnd: Math.random()
            };

            var url = '../captureFormsAdmin/updateFormEntityPlacement';

            $http.post(url, params).then(function (response) {
                var data = response.data;
                if (data.result == true) {
                    toaster.pop("success", "", "Изменения сохранены");
                    $uibModalInstance.close('saveFormEntity');
                } else {
                    toaster.pop("error", "Ошибка", data.errors[0]);
                    ctrl.btnSleep = false;
                }
            });

            ctrl.captureFormsAddEditFormEntityForm.$setPristine();

            ctrl.formInited = true;
            ctrl.getFormEntity(ctrl.FormEntityId);
        }
    };

    ModalAddEditFormEntityCtrl.$inject = ['$uibModalInstance', '$http', '$q', 'toaster', 'SweetAlert'];

    ng.module('uiModal')
        .controller('ModalAddEditFormEntityCtrl', ModalAddEditFormEntityCtrl);


    var ModalAddEditFormFieldCtrl = function ($uibModalInstance, $http, $q, toaster, SweetAlert) {
        var ctrl = this;
        ctrl.formInited = false;

        ctrl.$onInit = function () {
            var params = ctrl.$resolve;

            ctrl.FormFieldId = params.FormFieldId != null ? params.FormFieldId : 0;
            ctrl.FormId = params.FormId != null ? params.FormId : 0;
            ctrl.mode = ctrl.FormFieldId != 0 ? "edit" : "add";

            ctrl.FieldTypeId = 0;
            ctrl.FieldName = "";
            ctrl.FieldSortOrder = 0;
            ctrl.FieldRequired = false;

            ctrl.FieldType = {};
            ctrl.FieldTypes = {};

            if (ctrl.mode == "add") {
                ctrl.getFieldTypes(ctrl.FieldTypeId);
                ctrl.formInited = true;
            } else {
                ctrl.getFormField(ctrl.FormFieldId);
            }
        };


        ctrl.getFieldTypes = function (FieldType) {
            $http.get('../captureFormsAdmin/getfieldtypes', { params: { FieldType: FieldType, rnd: Math.random() } })
                .then(function (response) {
                    ctrl.FieldTypes = response.data;
                    ctrl.FieldType = ctrl.FieldTypes[0];

                    for (var i = 0; i < ctrl.FieldTypes.length; i++) {
                        if (ctrl.FieldTypes[i].Id == ctrl.FieldTypeId) {
                            ctrl.FieldType = ctrl.FieldTypes[i];
                        }
                    }
                });
        }

        ctrl.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        ctrl.getFormField = function (FormFieldId) {
            $http.get('../captureFormsAdmin/getFormField', { params: { FormFieldId: FormFieldId, rnd: Math.random() } }).then(function (response) {
                var data = response.data;
                if (data != null) {
                    ctrl.FormId = data.FormId;
                    ctrl.FieldName = data.FieldName;
                    ctrl.FieldTypeId = data.FieldTypeId;
                    ctrl.FieldSortOrder = data.FieldSortOrder;
                    ctrl.FieldType = data.FieldType;
                    ctrl.FieldRequired = data.FieldRequired;

                    ctrl.getFieldTypes(ctrl.FieldTypeId);
                }

                ctrl.captureFormsAddEditFormFieldForm.$setPristine();
                ctrl.formInited = true;
            });
        }

        ctrl.save = function () {
            ctrl.btnSleep = true;

            var params = {
                FormFieldId: ctrl.FormFieldId,
                FormId: ctrl.FormId,
                FieldName: ctrl.FieldName,
                FieldTypeId: ctrl.FieldType.Id,
                FieldSortOrder: ctrl.FieldSortOrder,
                FieldRequired: ctrl.FieldRequired,
                rnd: Math.random()
            };

            var url = ctrl.mode == "add" ? '../captureFormsAdmin/addFormField' : '../captureFormsAdmin/updateFormField';

            $http.post(url, params).then(function (response) {
                var data = response.data;
                if (data.result == true) {
                    toaster.pop("success", "", "Изменения сохранены");
                    $uibModalInstance.close('saveFormField');
                } else {
                    toaster.pop("error", "Ошибка", data.errors[0]);
                    ctrl.btnSleep = false;
                }
            });

            ctrl.captureFormsAddEditFormFieldForm.$setPristine();

            ctrl.formInited = true;
            ctrl.getFormField(ctrl.FormFieldId);
        }
    };

    ModalAddEditFormFieldCtrl.$inject = ['$uibModalInstance', '$http', '$q', 'toaster', 'SweetAlert'];

    ng.module('uiModal')
        .controller('ModalAddEditFormFieldCtrl', ModalAddEditFormFieldCtrl);

})(window.angular);