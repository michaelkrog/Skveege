angular.module('skveege.services', [])

        .factory('OrganizationSvc', function ($resource) {
            return $resource('/organizations/:id', {id: '@id'});
        })

        .factory('ContactSvc', function ($resource) {
            return $resource('/contacts/:id', {id: '@id'});
        })
        .factory('LogBookSvc', function ($resource) {
            return $resource('/logBooks/:id', {id: '@id'});
        })
        .factory('LogBookEntrySvc', function ($resource) {
            return $resource('/logBookEntries/:id', {id: '@id'});
        })
        .factory('PersonSvc', function ($resource) {
            return $resource('/persons/:id', {id: '@id'});
        })
        .factory('GeoSvc', function ($q) {
            return {
                reverseGeocode: function(position) {
                    // 57.0419555,9.9343251
                    var deferred = $q.defer();
                    deferred.resolve('Bornholmsgade 57, 9000 Aalborg');
                    return deferred;
                },
                geocode: function(address) {
                    var deferred = $q.defer();
                    deferred.resolve({latitude: 57.0419555, longitude: 9.9343251});
                    return deferred;
                }
            }
        })
        .factory('LoginSvc', function (localStorageService, $http, $rootScope, $log) {
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
                    return $http.get('/persons/current', {
                        headers: headers
                    }).then(function (response) {

                        if (response.status !== 200) {
                            var reason = response.data;
                            if (!reason || '' === reason) {
                                reason = 'Unable to communicate with server';
                            }
                            localStorageService.remove('LoginToken');
                            console.info('Unable to authenticate: ' + reason.message);
                            return $q.reject('Unable to authenticate. Reason: ' + reason.message);
                        }

                        if (remember) {
                            localStorageService.add('LoginToken', token);
                        }

                        $rootScope.credentials = {
                            username: username,
                            password: password
                        };
                        user = response.data;

                        $log.info('Authenticated. Returning user.');
                        $http.defaults.headers.common.Authorization = authHeader;

                        $log.info('Logged in as ' + user.username);
                        currentUser = user;
                        $rootScope.$broadcast("login", user);
                        return user;
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
        });