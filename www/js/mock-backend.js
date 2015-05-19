
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
        save: function (entity) {
            entity = angular.copy(entity);
            if (entity.id) {
                var index = indexFromId(entities, entity.id);
                if (index >= 0) {
                    entities[index] = entity;
                }
            } else {
                entity.id = newId();
                entities.push(entity);
            }
            return angular.copy(entity);
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

var LogbookEntryFilter = function(entities, data) {
    var result = [];
    var logBookId = data.logBookId;
    
    if(logBookId) {
        angular.forEach(entities, function(entity) {
            if(entity.logBookId === logBookId) {
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
            var personRepo = Repository();
            var contactRepo = Repository(OrgEntityFilter);
            var logBookRepo = Repository(OrgEntityFilter);
            var logBookEntryRepo = Repository(OrgEntityFilter);
            
            var org = orgRepo.save({name:'Apaq',url:'http://apaq.dk', address:'Bornholmsgade 57, 9000 Aalborg', countryCode: 'DK', phone:'+4593100718', email:'info@apaq.dk', companyNo: '12345678', terminated:false, terminationTime: null, emailValidated: true})
            var person = personRepo.save({name: 'Michael Krog', address: 'Bornholmsgade 57, 9000 Aalborg', countryCode: 'DK', phone:'+4593100718', email:'mic@apaq.dk', archived: false, username:'michael.krog', password:'test', role:'user', emailValidated: true});
            var contact1 = contactRepo.save({organizationId: org.id, name: 'Hannah Krog', address: 'Flintevej 3, 9400 Nørrresundby', countryCode: 'DK', number: '1', phone: '+45 12 34 56 78', email: 'hannah@mail.dk', companyNumber: null, paymentTermsDays: 8, archived: false});
            var contact2 = contactRepo.save({organizationId: org.id, name: 'Michael Krog', address: 'Flintevej 3, 9400 Nørrresundby', countryCode: 'DK', number: '1', phone: '+45 12 34 56 78', email: 'hannah@mail.dk', companyNumber: null, paymentTermsDays: 8, archived: false});
            var contact3 = contactRepo.save({organizationId: org.id, name: 'Otto Sørensen', address: 'Flintevej 3, 9400 Nørrresundby', countryCode: 'DK', number: '1', phone: '+45 12 34 56 78', email: 'hannah@mail.dk', companyNumber: null, paymentTermsDays: 8, archived: false});
            var contact4 = contactRepo.save({organizationId: org.id, name: 'Silas Carlsen', address: 'Flintevej 3, 9800 Hjørring', countryCode: 'DK', number: '1', phone: '+45 12 34 56 78', email: 'hannah@mail.dk', companyNumber: null, paymentTermsDays: 8, archived: false});
            var logbook = logBookRepo.save({organizationId: org.id, vehicle: 'VW Transporter', registration: 'lg 13 351'});
            
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
            
            $httpBackend.whenGET(/accounts\/(\w+)/).respond(function (method, url, data) {
                var searchResult = url.match(/persons\/(\w+)/);
                var id = searchResult[1];
                
                if(id === 'current') {
                    return [200, personRepo.query()[0]];
                } else {
                    return [200, personRepo.get(id)];
                }
            });
            
            $httpBackend.whenGET(/logBooks/).respond(function (method, url, data) {
                var searchResult = url.match(/\?organizationId=(\d+)/);
                var orgId = searchResult[1];
                return [200, logBookRepo.query({organizationId:orgId})];
            });
            
            $httpBackend.whenPOST(/logBooks/).respond(function (method, url, data) {
                var logbook = angular.fromJson(data);
                logbook = logBookRepo.save(logbook);
                return [200, logbook];
            });
            
            
            $httpBackend.whenGET(/^templates\//).passThrough();
        });