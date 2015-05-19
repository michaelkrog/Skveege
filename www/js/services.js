angular.module('skveege.services', [])
        .factory('LoginSvc', function (localStorageService, $http, $rootScope, $log, skveegeServiceUrl, $q) {
            var currentUser = null;
            return {
                authenticate: function (username, password, remember) {

                    var user = null,
                            authHeader, token, headers;


                    if (!username && !password) {
                        token = localStorageService.get('LoginToken');
                    } else if (username && password) {
                        token = btoa(username + ':' + password);
                    }

                    if (token) {
                        authHeader = 'Basic ' + token;
                        headers = {
                            'Authorization': authHeader
                        };
                    }
                    return $http.get(skveegeServiceUrl + '/accounts/current', {
                        headers: headers
                    }).success(function (data) {

                        if (remember) {
                            localStorageService.add('LoginToken', token);
                        }

                        $rootScope.credentials = {
                            username: username,
                            password: password
                        };
                        user = data;

                        $log.info('Authenticated. Returning user.');
                        $http.defaults.headers.common.Authorization = authHeader;

                        $log.info('Logged in as ' + user.login);
                        currentUser = user;
                        $rootScope.$broadcast("login", user);
                        return user;
                    }).
                    error(function(data) {
                        var reason = data;
                        if (!reason || '' === reason) {
                            reason = 'Unable to communicate with server';
                        }
                        localStorageService.remove('LoginToken');
                        $log.info('Unable to authenticate: ' + reason.message);
                        return $q.reject('Unable to authenticate. Reason: ' + reason.message);
                        
                    });


                },
                getCurrentUser: function () {
                    return currentUser;
                },
                deauthenticate: function () {
                    $http.defaults.headers.common.Authorization = undefined;
                    localStorageService.remove('LoginToken');
                    $rootScope.$broadcast("logout", currentUser);
                    currentUser = null;
                }
            };
        })
        .factory('OrderSvc', function ($resource, skveegeServiceUrl) {
            return $resource(skveegeServiceUrl + '/orders/:id', {id: '@id'});
        })

        .factory('AccountSvc', function ($resource, skveegeServiceUrl) {
            return $resource(skveegeServiceUrl + '/accounts/:id',
                    {id: '@id'},
            {
                getDefault: {method: 'GET', url: skveegeServiceUrl + '/account'}
            });
        })

        .factory('PaymentSvc', function ($resource, skveegeServiceUrl) {
            return $resource(skveegeServiceUrl + '/payments/:id', {id: '@id'});
        })

        .factory('OrganizationSvc', function ($resource, skveegeServiceUrl) {
            return $resource(skveegeServiceUrl + '/organizations/:id',
                    {id: '@id'},
            {
                getDefault: {method: 'GET', url: skveegeServiceUrl + '/organization'}
            });
        })

        .factory('RouteSvc', function ($resource, skveegeServiceUrl) {
            return $resource(skveegeServiceUrl + '/routes/:id', {id: '@id'});
        })

        .factory('AgreementSvc', function ($resource, skveegeServiceUrl) {
            return $resource(skveegeServiceUrl + '/agreements/:id', {id: '@id'});
        })

        .factory('ContactSvc', function ($resource, skveegeServiceUrl) {
            return $resource(skveegeServiceUrl + '/contacts/:id', {id: '@id'});
        })

        .factory('TaskSvc', function ($resource, skveegeServiceUrl) {
            return $resource(skveegeServiceUrl + '/tasks');
        });