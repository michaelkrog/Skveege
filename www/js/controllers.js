angular.module('skveege.controllers', [])

        .controller('PlanCtrl', function ($scope, PlanSvc) {
            $scope.entries = PlanSvc.query({organizationId: $scope.context.organization.id});
        })

        .controller('RoutesCtrl', function ($scope, RouteSvc) {
            $scope.routes = RouteSvc.query({organizationId: $scope.context.organization.id});

        })

        .controller('RouteDetailCtrl', function ($scope, $stateParams, RouteSvc) {
            $scope.route = RouteSvc.get({id: $stateParams.routeId});
        })

        .controller('LoginCtrl', function ($scope, $timeout) {
            $scope.mode = 'idle';

            $scope.signIn = function (user) {
                if ($scope.mode !== 'idle') {
                    return;
                }
                $scope.mode = 'login';
                $timeout(function () {
                    $scope.$emit('Login');
                    $scope.mode = 'idle';
                }, 1000);
            };

        })



        .controller('ContactListCtrl', function ($scope, ContactSvc, $ionicModal) {
            $scope.contacts = ContactSvc.query({organizationId: $scope.context.organization.id});
            $scope.editable = false;

            $ionicModal.fromTemplateUrl('templates/customer-create.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.addCustomer = function () {
                $scope.modal.show();
            };
            $scope.cancelAddCustomer = function () {
                $scope.modal.hide();
            };
            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });

            $scope.toggleEditable = function () {
                $scope.editable = !$scope.editable;
            }
        })

        .controller('ContactCtrl', function ($scope, $stateParams, ContactSvc) {
            $scope.contact = ContactSvc.get({id: $stateParams.contactId});
            $scope.mode = 'view';
            $scope.context.backTitle = 'Kunder';

            $scope.startEdit = function () {
                $scope.mode = 'edit';
            }
        })

        .controller('CustomerTasksCtrl', function ($scope, $stateParams, ContactSvc) {
            $scope.contact = ContactSvc.get($stateParams.customerId);
            $scope.context.backTitle = $scope.customer.name;

        })

        .controller('AccountCtrl', function ($scope) {
            $scope.settings = {
                enableFriends: true
            };
        });
