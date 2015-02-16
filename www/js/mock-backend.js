
function Repository(queryFilter) {
    var entities = [], count=0;
    var indexFromId = function (data, id) {
        for (i = 0; i < data.length; i++) {
            if (data[i].id === id) {
                return i;
            }
        }
        return -1;
    };
    
    var newId = function() {
        return new Date().getTime().toString() + '' + count++;
    }
    
    return {
        get: function (id) {
            var index = indexFromId(entities, id);
            if (index >= 0) {
                return angular.copy(entities[index]);
            }
            return null;
        },
        query: function (data) {
            return angular.copy(queryFilter ? queryFilter(entities, data) : entities);
        },
        save: function (organization) {
            organization = angular.copy(organization);
            if (organization.id) {
                var index = indexFromId(entities, organization.id);
                if (index >= 0) {
                    entities[index] = organization;
                }
            } else {
                organization.id = newId();
                entities.push(organization);
            }
            return angular.copy(organization);
        },
        delete: function(id) {
            var index = indexFromId(entities, id);
            if (index >= 0) {
                return entities.splice(index,1);
            }
        }
    };
}

var OrgEntityFilter = function(entities, data) {
    var result = [];
    var organizationId = data.organizationId;
    
    if(organizationId) {
        angular.forEach(entities, function(entity) {
            if(entity.organizationId === organizationId) {
                result.push(entity);
            }
        });
    }
    return result;
};

var AgreementFilter = function(entities, data) {
    var result = [];
    var organizationId = data.organizationId;
    
    if(organizationId) {
        angular.forEach(entities, function(entity) {
            if(entity.organizationId === organizationId) {
                result.push(entity);
            }
        });
    }
    return result;
};


angular.module('skveege.mock', ['ngMockE2E'])
        //Mock run
        .run(function ($httpBackend) {
            var orgRepo = Repository();
            var personRepo = Repository(OrgEntityFilter);
            var eventRepo = Repository(OrgEntityFilter);
            var invoiceRepo = Repository(OrgEntityFilter);
            var contactRepo = Repository(OrgEntityFilter);
            var accountRepo = Repository(OrgEntityFilter);
            var paymentRepo = Repository(OrgEntityFilter);
            var intervalAgreementRepo = Repository(AgreementFilter);
            var routeRepo = Repository(OrgEntityFilter);
            var productRepo = Repository(OrgEntityFilter);
    
            var org = orgRepo.save({name:'Apaq',url:'http://apaq.dk', address:'Bornholmsgade 57, 9000 Aalborg', countryCode: 'DK', phone:'+4593100718', email:'info@apaq.dk', companyNo: '12345678', terminated:false, terminationTime: null, emailValidated: true})
            var person = personRepo.save({name: 'Michael Krog', address: 'Bornholmsgade 57, 9000 Aalborg', countryCode: 'DK', phone:'+4593100718', email:'mic@apaq.dk', archived: false, username:'michael.krog', role:'user', emailValidated: true});
            var route1 = routeRepo.save({organizationId: org.id, name:'Nørresundby', averageIntervalTotal:2304.96, averageMonthlyTotal:4994.08});
            var route2 = routeRepo.save({organizationId: org.id, name:'Hjørring', averageIntervalTotal:2304.96, averageMonthlyTotal:4994.08});
            var contact1 = contactRepo.save({organizationId: org.id, name: 'Hannah Krog', address: 'Flintevej 3, 9400 Nørrresundby', countryCode: 'DK', number: '1', phone: '+45 12 34 56 78', email: 'hannah@mail.dk', companyNumber: null, paymentTermsDays: 8, archived: false, defaultRouteId: route1.id});
            var contact2 = contactRepo.save({organizationId: org.id, name: 'Michael Krog', address: 'Flintevej 3, 9400 Nørrresundby', countryCode: 'DK', number: '1', phone: '+45 12 34 56 78', email: 'hannah@mail.dk', companyNumber: null, paymentTermsDays: 8, archived: false, defaultRouteId: route1.id});
            var contact3 = contactRepo.save({organizationId: org.id, name: 'Otto Sørensen', address: 'Flintevej 3, 9400 Nørrresundby', countryCode: 'DK', number: '1', phone: '+45 12 34 56 78', email: 'hannah@mail.dk', companyNumber: null, paymentTermsDays: 8, archived: false, defaultRouteId: route1.id});
            var contact4 = contactRepo.save({organizationId: org.id, name: 'Silas Carlsen', address: 'Flintevej 3, 9800 Hjørring', countryCode: 'DK', number: '1', phone: '+45 12 34 56 78', email: 'hannah@mail.dk', companyNumber: null, paymentTermsDays: 8, archived: false, defaultRouteId: route2.id});
            var productAccount= accountRepo.save({organizationId: org.id, name:'Salg', currency: 'DKK', description: 'Alt salg der vedrører normal forretningsmæssig aktivitet.', accountNo: null});
            var cashAccount= accountRepo.save({organizationId: org.id, name:'Kasse', currency: 'DKK', description: 'Kontant beholdning', accountNo: null});
            var product = productRepo.save({organizationId: org.id, name: 'Vinduespolering', description: '', accountId: productAccount.id, archived:false});
            var invoice1 = invoiceRepo.save({organizationId: org.id, type: 'invoice', number: '2002', contactId: contact1.id, notes: '', date: '2015-01-01', dueDate: '2015-01-08', paymentTermsDays: 7, creditInvoiceId: null, state: 'draft', lines: [{description: '', productId: null, quantity: 1, unitPrice: 100.00, tax: 25.0}]});
            var payment1 = paymentRepo.save({organizationId: org.id, amount:125.0, currency:'DKK', accountId: cashAccount.id});
            var agreement1 = intervalAgreementRepo.save({organizationId: org.id, description: 'Eksternt glas', amount: 100, productId: product.id, contactId: contact1.id, recurrence: 'FREQ=WEEKLY;INTERVAL=2', dateStart: '2015-01-01', dateEnd: null, archived: false});
            var agreement2 = intervalAgreementRepo.save({organizationId: org.id, description: 'Internt glas', amount: 200, productId: product.id, contactId: contact1.id, recurrence: 'FREQ=WEEKLY;INTERVAL=4', dateStart: '2015-01-01', dateEnd: null, archived: false});
            var agreement3 = intervalAgreementRepo.save({organizationId: org.id, description: 'Eksternt glas', amount: 150, productId: product.id, contactId: contact2.id, recurrence: 'FREQ=WEEKLY;INTERVAL=2', dateStart: '2015-01-01', dateEnd: null, archived: false});
            var agreement4 = intervalAgreementRepo.save({organizationId: org.id, description: 'Eksternt glas', amount: 150, productId: product.id, contactId: contact3.id, recurrence: 'FREQ=WEEKLY;INTERVAL=2', dateStart: '2015-01-01', dateEnd: null, archived: false});
            var agreement5 = intervalAgreementRepo.save({organizationId: org.id, description: 'Eksternt glas', amount: 150, productId: product.id, contactId: contact4.id, recurrence: 'FREQ=WEEKLY;INTERVAL=2', dateStart: '2015-01-01', dateEnd: null, archived: false});
            
            var buildPlan = function(orgId) {
                var agreements = intervalAgreementRepo.query({organizationId:orgId});
                var entries = [];
                var i,e;
                for(i=0;i<agreements.length;i++) {
                    var agreement = agreements[i];
                    var entry = null;
                    var contact = contactRepo.get(agreement.contactId);
                    
                    for(e=0;e<entries.length;e++) {
                        var route = routeRepo.get(entries[e].routeId);
                        if(route.id === contact.defaultRouteId && agreement.nextInterval === entries[e].date) {
                            entry = entries[e];
                        }
                    }
                    
                    if(entry === null) {
                        var route = routeRepo.get(contact.defaultRouteId);
                        entry = {
                            routeId: route.id,
                            routeName: route.name,
                            agreements: [],
                            total: 0,
                            date: agreement.nextInterval
                        };
                        entries.push(entry);
                    }
                    
                    entry.agreements.push(agreement);
                    entry.total += agreement.amount;
                    
                }
                return entries;
            }
            
            $httpBackend.whenGET(/organizations/).respond(function (method, url, data) {
                return [200, orgRepo.query()];
            });

            $httpBackend.whenGET(/contacts\/(\d+)/).respond(function (method, url, data) {
                var searchResult = url.match(/contacts\/(\d+)/);
                var id = searchResult[1];
                return [200, contactRepo.get(id)];
            });
            
            $httpBackend.whenGET(/contacts/).respond(function (method, url, data) {
                var searchResult = url.match(/\?organizationId=(\d+)/);
                var orgId = searchResult[1];
                return [200, contactRepo.query({organizationId:orgId})];
            });
            
            $httpBackend.whenGET(/routes\/(\d+)/).respond(function (method, url, data) {
                var searchResult = url.match(/routes\/(\d+)/);
                var id = searchResult[1];
                return [200, routeRepo.get(id)];
            });
            
            $httpBackend.whenGET(/^\/routes\?organizationId=(\d+)$/).respond(function (method, url, data) {
                var searchResult = url.match(/\?organizationId=(\d+)/);
                var orgId = searchResult[1];
                return [200, routeRepo.query({organizationId:orgId})];
            });

            $httpBackend.whenGET(/^\/plan\?organizationId=(\d+)$/).respond(function (method, url, data) {
                var searchResult = url.match(/\?organizationId=(\d+)/);
                var orgId = searchResult[1];
                return [200, buildPlan(orgId)];
            });


            $httpBackend.whenGET(/^templates\//).passThrough();
        });