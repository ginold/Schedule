'use strict';


var User = require('../api/user/user.model');
var Attribution = require('../api/attribution/attribution.model');


User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test',
    competences : ["Back-office", "Spécial"]
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin',
    competences : ["Spécial"]
  }, function() {
      console.log('finished populating users');
    }
  );
});
Attribution.find({}).remove(function() {
  Attribution.create({
    coursier : {},
    shifts : [],
    monthYear : {
      "07-2015": {
        1 : {

        }
      },
      "08-2015":{
        1 : {
          
        }
      }
    },
  
  })
});

