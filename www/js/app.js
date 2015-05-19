angular.module('skveege', [
    'ionic',
    'skveege.controllers',
    'skveege.services',
    //'skveege.mock',
    'ngResource',
    'ngCordova',
    'LocalStorageModule'
])
        .config(function($provide) {
            $provide.constant('skveegeServiceUrl', 'http://skveege.test:8084');
        })
        .run(function ($ionicPlatform, $rootScope, OrganizationSvc, $location) {
            $location.path('/login')
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleDefault();
                }

                /*var posOptions = {timeout: 10000, enableHighAccuracy: false};
                $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    // NOOP
                }, function (err) {
                    // error
                });*/

            });

            $rootScope.context = {};

            $rootScope.context = {
                backTitle: 'Back'
            };

            $rootScope.$on('login', function (event, user) {
                $rootScope.context.user = user;
                OrganizationSvc.getDefault().$promise.then(function (data) {
                    //Lets take the first one for now
                    if (data) {
                        $rootScope.context.organization = data;

                        $location.path('/tab/customers');
                    }
                });

            });

        })

        .config(function ($stateProvider, $urlRouterProvider) {

            $stateProvider

                    .state('login', {
                        url: '/login',
                        templateUrl: 'templates/login.html',
                        controller: 'LoginCtrl'

                    })
                    // setup an abstract state for the tabs directive
                    .state('tab', {
                        url: "/tab",
                        abstract: true,
                        templateUrl: "templates/tabs.html"
                    })


                    .state('tab.customers', {
                        url: '/customers',
                        views: {
                            'tab-customers': {
                                templateUrl: 'templates/tab-customers.html',
                                controller: 'ContactListCtrl'
                            }
                        }
                    })
                    .state('tab.customer-detail', {
                        url: '/customers/:contactId',
                        views: {
                            'tab-customers': {
                                templateUrl: 'templates/customer-detail.html',
                                controller: 'ContactCtrl'
                            }
                        }
                    })
                    .state('tab.customer-tasks', {
                        url: '/customers/:customerId/tasks',
                        views: {
                            'tab-customers': {
                                templateUrl: 'templates/customer-tasks.html',
                                controller: 'ContactTasksCtrl'
                            }
                        }
                    }).state('tab.logbooks', {
                        url: '/logbooks',
                        views: {
                            'tab-logbooks': {
                                templateUrl: 'templates/tab-logbooks.html',
                                controller: 'LogBooksCtrl'
                            }
                        }
                    }).state('tab.settings', {
                        url: '/settings',
                        views: {
                            'tab-settings': {
                                templateUrl: 'templates/tab-settings.html',
                                controller: 'SettingsCtrl'
                            }
                        }
                    }).state('tab.settings-profile', {
                        url: '/settings/profile',
                        views: {
                            'tab-settings': {
                                templateUrl: 'templates/settings-profile.html',
                                controller: 'ProfileCtrl'
                            }
                        }
                    });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/login');

        });
