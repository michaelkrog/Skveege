angular.module('skveege', [
    'ionic', 
    'skveege.controllers', 
    'skveege.services', 
    //'skveege.mock', 
    'ngResource',
    'ngCordova',
    'LocalStorageModule'
])
.config(function($provide, $httpProvider) {
            var serviceUrl = 'http://192.168.87.104:8084';
            $provide.constant('skveegeServiceUrl', serviceUrl);
            $httpProvider.interceptors.push(function ($location, $q) {
                return {
                    'responseError': function (rejection) {
                        if(rejection.config.url.substring(0,serviceUrl.length) === serviceUrl) {
                            if (rejection.status === 401) {
                                $location.path('/login');
                                return $q.reject("Not authorized.");
                            }
                            if (rejection.status === 0) {
                                $location.path('/login');
                                return $q.reject("Cannot contact server.");
                            }
                        }
                        return $q.reject(rejection);
                    }
                };
            });

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

            });

            $rootScope.context = {};

            $rootScope.context = {
                backTitle: 'Back'
            };

            $rootScope.$on('login', function () {
                OrganizationSvc.getDefault().$promise.then(function (data) {
                    if (data) {
                        $rootScope.context.organization = data;
                        $location.path('/tab/plan');
                    }
                });

            });

        })

        .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
            $ionicConfigProvider.tabs.position('bottom');
            $ionicConfigProvider.navBar.alignTitle('center');
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

                    // Each tab has its own nav history stack:

                    .state('tab.plan', {
                        url: '/plan',
                        views: {
                            'tab-plan': {
                                templateUrl: 'templates/tab-plan.html',
                                controller: 'PlanCtrl'
                            }
                        }
                    })

                    .state('tab.routes', {
                        url: '/routes',
                        views: {
                            'tab-routes': {
                                templateUrl: 'templates/tab-routes.html',
                                controller: 'RoutesCtrl'
                            }
                        }
                    })
                    .state('tab.route-detail', {
                        url: '/routes/:routeId',
                        views: {
                            'tab-routes': {
                                templateUrl: 'templates/route-detail.html',
                                controller: 'RouteDetailCtrl'
                            }
                        }
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
                    });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/login');

        });
