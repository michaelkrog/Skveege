angular.module('skveege', [
    'ionic', 
    'skveege.controllers', 
    'skveege.services', 
    'skveege.mock', 
    'ngResource',
    'ngCordova'
])

        .run(function ($ionicPlatform, $rootScope, OrganizationSvc, $location, $cordovaBackgroundGeolocation, $cordovaGeolocation) {
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

                var posOptions = {timeout: 10000, enableHighAccuracy: false};
                $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
                    var lat = position.coords.latitude;
                    var long = position.coords.longitude;
                    alert(lat+'/'+long);
                }, function (err) {
                    // error
                });

                var options = {
                    url: 'http://only.for.android.com/update_location.json', // <-- Android ONLY:  your server url to send locations to
                    params: {
                        auth_token: 'user_secret_auth_token', //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
                        foo: 'bar'                              //  <-- Android ONLY:  HTTP POST params sent to your server when persisting locations.
                    },
                    headers: {// <-- Android ONLY:  Optional HTTP headers sent to your configured #url when persisting locations
                        "X-Foo": "BAR"
                    },
                    desiredAccuracy: 10,
                    stationaryRadius: 20,
                    distanceFilter: 30,
                    notificationTitle: 'Background tracking', // <-- android only, customize the title of the notification
                    notificationText: 'ENABLED', // <-- android only, customize the text of the notification
                    activityType: 'AutomotiveNavigation',
                    debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
                    stopOnTerminate: false // <-- enable this to clear background location settings when the app terminates
                };

                // `configure` calls `start` internally
                $cordovaBackgroundGeolocation.configure(options).then(
                        null, // Background never resolves
                        function (err) { // error callback
                            console.error(err);
                        },
                        function (location) { // notify callback
                            console.log(location);
                        });


                $rootScope.$geolocationStop = function () {
                    $cordovaBackgroundGeolocation.stop();
                };



            });

            $rootScope.context = {};

            $rootScope.context = {
                backTitle: 'Back'
            };

            $rootScope.$on('Login', function () {
                OrganizationSvc.query().$promise.then(function (data) {
                    //Lets take the first one for now
                    if (data.length > 0) {
                        $rootScope.context.organization = data[0];

                        $location.path('/tab/plan');
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
                                controller: 'CustomerTasksCtrl'
                            }
                        }
                    });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/login');

        });
