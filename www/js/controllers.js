angular.module('skveege.controllers', [])

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
                LoginSvc.authenticate(credentials.username, credentials.password).then(function () {
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

        .controller('LogBooksCtrl', function ($scope, LogBookSvc, $cordovaGeolocation, $ionicModal, GeoSvc) {
            $scope.logbook = null;
            $scope.state = null;
            $scope.entries = [];
            $scope.maxStationaryLocationAttempts = 4;
            $scope.maxSpeedAcquistionAttempts = 3;
            $scope.stationaryMillisForValidParking = 10000;
            $scope.currentTrip = {
                isMoving: false,
                lastMovement: null,
                isAcquiringStationaryLocation: false,
                stationaryLocation: null,
                locationError: null,
                locationAcquisitionAttempts: 0,
                isParked: true,
                locations: []
            };

            $scope.$on('$ionicView.beforeEnter', function () {
                $scope.state = 'loading';
                LogBookSvc.query({organizationId: $scope.context.organization.id}).$promise.then(function (data) {
                    if (data.length > 0) {
                        $scope.logbook = data[0];
                        $scope.logbook.$active = false;
                    } else {
                        $scope.logbook = null;
                    }
                    $scope.state = null;
                });
            });

            $ionicModal.fromTemplateUrl('templates/logbook-create.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.addLogbook = function () {
                $scope.newLogbook = {vehicle: '', registration: ''};
                $scope.modal.show();
            };
            $scope.cancelAddLogbook = function () {
                $scope.modal.hide();
            };

            $scope.doAddLogbook = function (logbook) {
                logbook.organizationId = $scope.context.organization.id;
                LogBookSvc.save(logbook).$promise.then(function (result) {
                    $scope.logbook = result;
                    $scope.modal.hide();
                });
            };

            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });

            $scope.getLengthOfCurrentTrip = function() {
                var length = 0, i;
                
                if($scope.currentTrip.locations.length>1) {
                    for(i=1;i<$scope.currentTrip.locations.length;i++) {
                        length += $scope.getDistanceFromLatLonInKm($scope.currentTrip.locations[i-1].coords, $scope.currentTrip.locations[i].coords);
                    }
                }
                return length;
            };
            
            $scope.getKmPerHourFromMeterPerSecond = function(mps) {
                return mps * 3600 / 1000;
            };
            
            $scope.getDistanceFromLatLonInKm = function (coords1, coords2) {
                var R = 6371; // Radius of the earth in km
                var dLat = $scope.deg2rad(coords2.latitude - coords1.latitude);  // deg2rad below
                var dLon = $scope.deg2rad(coords2.longitude - coords1.longitude);
                var a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos($scope.deg2rad(coords1.latitude)) * Math.cos($scope.deg2rad(coords2.latitude)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
                        ;
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c; // Distance in km
                return d;
            };

            $scope.deg2rad = function (deg) {
                return deg * (Math.PI / 180)
            };

            $scope.onNewPosition = function (location) {
                console.log(location);

                //if(location.coords.altitudeAccuracy < 0) {
                //    console.log('Invalid location recieved. Ignoring it.');
                //    return;
                //}
                var now = new Date();
                $scope.currentTrip.locationError = null;
                $scope.currentTrip.location = location;
                $scope.currentTrip.isMoving = location.coords.speed !== null && location.coords.speed > 0;
                
                if($scope.currentTrip.isMoving) {
                    $scope.currentTrip.lastMovement = location.timestamp;
                }
                
                if($scope.currentTrip.isMoving && !$scope.currentTrip.isParked && !$scope.currentTrip.isAcquiringStationaryLocation) {
                    $scope.currentTrip.locations.push(location);
                }

                // If we are parked but moving with a speed of 20Km+ more than 0.1Km from our parking lot, then we are not parked anymore.
                if ($scope.currentTrip.isMoving && $scope.currentTrip.isParked &&
                        $scope.getKmPerHourFromMeterPerSecond(location.coords.speed) > 20 && 
                        ($scope.currentTrip.stationaryLocation === null || $scope.getDistanceFromLatLonInKm($scope.currentTrip.location.coords, $scope.currentTrip.stationaryLocation.coords) > 0.1)) {
                    $scope.currentTrip.isParked = false;
                    if($scope.currentTrip.stationaryLocation) {
                        $scope.currentTrip.locations = [$scope.currentTrip.stationaryLocation];
                        $scope.currentTrip.stationaryLocation = null;
                    }
                }

                if (!$scope.currentTrip.isMoving && !$scope.currentTrip.isAcquiringStationaryLocation && !$scope.currentTrip.stationaryLocation) {
                    $scope.currentTrip.stationaryLocation = location;
                    $scope.currentTrip.isAcquiringStationaryLocation = true;
                    $scope.currentTrip.locationAcquisitionAttempts = 0;
                }
                
                // If we have a stationary location and enough time has passed then we must be parked.
                if($scope.currentTrip.stationaryLocation && now.getTime() - $scope.currentTrip.lastMovement > $scope.stationaryMillisForValidParking) {
                    $scope.currentTrip.isParked = true;
                }
                

                // test the age of the location measurement to determine if the measurement is cached
                // in most cases you will not want to rely on cached measurements
                //if(isOldLocation(location)) return;

                // test the measurement to see if it is more accurate than the previous measurement
                if ($scope.currentTrip.isAcquiringStationaryLocation) {
                    console.log('- Acquiring stationary location, accuracy: ' + location.coords.altitudeAccuracy);
                    //if (isDebugging) {
                    //    AudioServicesPlaySystemSound (acquiringLocationSound);
                    //}
                    if ($scope.currentTrip.stationaryLocation === null || $scope.currentTrip.stationaryLocation.coords.altitudeAccuracy > location.coords.altitudeAccuracy) {
                        $scope.currentTrip.stationaryLocation = location;
                    }
                    if (++$scope.currentTrip.locationAcquisitionAttempts === $scope.maxStationaryLocationAttempts) {
                        $scope.currentTrip.isAcquiringStationaryLocation = false;
                    } else {
                        // Unacceptable stationary-location: bail-out and wait for another.
                        return;
                    }
                }/* else if ($scope.currentTrip.isAcquiringSpeed) {
                 //if (isDebugging) {
                 //    AudioServicesPlaySystemSound (acquiringLocationSound);
                 //}
                 if (++$scope.currentTrip.locationAcquisitionAttempts === $scope.maxSpeedAcquistionAttempts) {
                 //if (isDebugging) {
                 //    [self notify:@"Aggressive monitoring engaged"];
                 //}
                 // We should have a good sample for speed now, power down our GPS as configured by user.
                 $scope.currentTrip.isAcquiringSpeed = false;
                 //[locationManager setDesiredAccuracy:desiredAccuracy];
                 //[locationManager setDistanceFilter:[self calculateDistanceFilter:location.speed]];
                 //[self startUpdatingLocation];
                 } else {
                 return;
                 }
                 } else if ($scope.currentTrip.isMoving) {
                 // Adjust distanceFilter incrementally based upon current speed
                 //var newDistanceFilter = [self calculateDistanceFilter:location.speed];
                 //if (newDistanceFilter != locationManager.distanceFilter) {
                 //    NSLog(@"- CDVBackgroundGeoLocation updated distanceFilter, new: %f, old: %f", newDistanceFilter, locationManager.distanceFilter);
                 //    [locationManager setDistanceFilter:newDistanceFilter];
                 //    [self startUpdatingLocation];
                 //}
                 }*/ /*else if ([self locationIsBeyondStationaryRegion:location]) {
                  //if (isDebugging) {
                  //    [self notify:@"Manual stationary exit-detection"];
                  //}
                  //[self setPace:YES];
                  }*/
            };

            $scope.$watch('logbook.$active', function (active) {
                if (active) {
                    var watchOptions = {
                        maximumAge: 10000,
                        timeout: 60000,
                        enableHighAccuracy: false // may cause errors if true
                    };

                    $scope.watch = $cordovaGeolocation.watchPosition(watchOptions);
                    $scope.watch.then(
                            null,
                            function (err) {
                                console.log(err);
                                $scope.currentTrip.locationError = err;
                            },
                            $scope.onNewPosition);
                } else {
                    if ($scope.watch) {
                        $scope.watch.clearWatch();
                    }
                }
            });


        })
        .controller('SettingsCtrl', function ($scope) {

        })

        .controller('ProfileCtrl', function ($scope) {
            $scope.user = angular.copy($scope.context.user);
        });
