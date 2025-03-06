; (function (ng) {

    'use strict';

    var CaptureFormsFeedbackCtrl = function ($http, toaster) {
        var ctrl = this;

        ctrl.$onInit = function () {
            ctrl.feedback = JSON.parse(ctrl.feedbackString);
        }

        ctrl.send = function (form) {
            if (form.$valid)
            {
                $http.post('../captureFormsadmin/feedback', { feedback: ctrl.feedback }).then(function (response) {
                    var success = response.data.success;
                    var type = success ? 'success' : 'error';
                    toaster.pop(type, '', response.data.msg);
                    if (success)
                    {
                        ctrl.feedback = JSON.parse(ctrl.feedbackString);
                        form.$setPristine();
                        form.$setUntouched();
                    }
                });
            }
        }
    }

    CaptureFormsFeedbackCtrl.$inject = ['$http', 'toaster'];

    ng.module('promofeedback',[])
        .controller('CaptureFormsFeedbackCtrl', CaptureFormsFeedbackCtrl)
        .component('captureFormsFeedback', {
            templateUrl: '../modules/CaptureForms/content/scripts/captureFormsFeedback/templates/captureFormsFeedback.html',
            controller: 'CaptureFormsFeedbackCtrl',
            bindings: {
                feedbackString: '@'
            }
        });

})(window.angular);