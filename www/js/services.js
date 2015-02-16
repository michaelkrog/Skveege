angular.module('skveege.services', [])

.factory('InvoiceSvc', function($resource) {
    return $resource('/invoices/:id', {id:'@id'});
})

.factory('AccountSvc', function($resource) {
    return $resource('/accounts/:id', {id:'@id'});
})

.factory('PaymentSvc', function($resource) {
    return $resource('/payments/:id', {id:'@id'});
})

.factory('OrganizationSvc', function($resource) {
    return $resource('/organizations/:id', {id:'@id'});
})

.factory('RouteSvc', function($resource) {
    return $resource('/routes/:id', {id:'@id'});
})

.factory('AgreementSvc', function($resource) {
    return $resource('/agreements/:id', {id:'@id'});
})

.factory('ContactSvc', function($resource) {
  return $resource('/contacts/:id', {id:'@id'});
})

.factory('PlanSvc', function($resource) {
  return $resource('/plan');
});