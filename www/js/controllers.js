angular.module('skveege.controllers', [])
        
        .controller('PlanCtrl', function ($scope, TaskSvc) {
            $scope.entries = TaskSvc.query();
        })

        .controller('RoutesCtrl', function ($scope, RouteSvc) {
            $scope.routes = RouteSvc.query();

        })

        .controller('RouteDetailCtrl', function ($scope, $stateParams, RouteSvc) {
            $scope.route = RouteSvc.get({id: $stateParams.routeId});
        })

        .controller('LoginCtrl', function ($scope, LoginSvc) {
            $scope.mode = 'idle';

            $scope.signIn = function (credentials) {
                if ($scope.mode !== 'idle') {
                    return;
                }

                if (!credentials) {
                    alert("Indtast brugernavn og password.");
                    return;
                }

                $scope.mode = 'login';
                LoginSvc.authenticate(credentials.username, credentials.password, true).then(function () {
                    $scope.mode = 'idle';
                });

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
            $scope.addContact = function () {
                $scope.modal.show();
            };
            $scope.cancelAddContact = function () {
                $scope.modal.hide();
            };
            
            $scope.okAddContact = function () {
                ContactSvc.save($scope.contact)
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
                $scope.editContact = angular.copy($scope.contact);
            };
            
            $scope.endEdit = function () {
                if(!angular.equals($scope.editContact, $scope.contact)) {
                    delete $scope.editContact.createdDate;
                    ContactSvc.save($scope.editContact).$promise.then(function(data) {
                        $scope.contact = data;
                    });
                }
                $scope.mode = 'view';
            };
        })

        .controller('ContactTasksCtrl', function ($scope, $stateParams, ContactSvc) {
            $scope.prevBackTitle = $scope.context.backTitle;
            ContactSvc.get({id:$stateParams.customerId}).$promise.then(function(contact) {
                $scope.contact = contact;
                $scope.context.backTitle = $scope.contact.name;
            });
            
            $scope.$on('$destroy', function () {
                $scope.context.backTitle = $scope.prevBackTitle;
            });
            

        })

        .controller('AccountCtrl', function ($scope) {
            $scope.settings = {
                enableFriends: true
            };
        });
