var builder = require('botbuilder'); 
var restify = require('restify');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
    //appId: '5778e28e-35e4-4cae-80eb-66d797996152',
    //appPassword: '6zh4NJX7zO5iFEuRdKJpXzq'
});
var bot = new builder.UniversalBot(connector);
//var bot = new builder.UniversalBot(connector, function (session) {
//    session.send("Hi... I'm the EY Reserve bot. I can help you reserve a seat or a conference room.  How may I help you?");
//});
server.post('https://eyreserve.azurewebsites.net/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b775b712-5d48-4234-a325-fcec31f4fbee?subscription-key=8a605684fc204a3ea3c6f29e2a390002';
var recognizer = new builder.LuisRecognizer(model);

//var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
//bot.dialog('/', dialog);

// Add intent handlers
//dialog.matches('Reserve Seat', builder.DialogAction.send('Reserve a hot seat'));
//dialog.matches('Reserve a Conference Room', builder.DialogAction.send('Reserve a conference room'));
//dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only reserve a hot seat or a conference room."));


var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);
dialog.onBegin(function (session, args, next) {
    session.send("Hi... I'm the EY Reserve bot. I can help you reserve a seat or a conference room.  How can I assist you do today?");
   // next();
});


// Add intent handlers
dialog.matches('Reserve Seat', [
    function (session, args, next) {
        // Resolve and store any entities passed from LUIS.
        
        var cityEntity = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.city');
        var stateEntity = builder.EntityRecognizer.findEntity(args.entities, 'builtin.geography.us_state');
        var floorEntity = builder.EntityRecognizer.findEntity(args.entities, 'Floor');
        var buildingEntity = builder.EntityRecognizer.findEntity(args.entities, 'Building');
        var seatEntity = builder.EntityRecognizer.findEntity(args.entities, 'Seat');
        var durationEntity = builder.EntityRecognizer.findEntity(args.entities, 'Duration');
        var dateEntity = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.date');

        var seatassignment = session.dialogData.seatassignment = {
          cityEntity: cityEntity ? cityEntity.entity : null,
          stateEntity: stateEntity ? stateEntity.entity : null,
          buildingEntity: buildingEntity ? buildingEntity.entity : null,
          floorEntity: floorEntity ? floorEntity.entity : null,
          seatEntity: seatEntity ? seatEntity.entity : null,
          durationEntity: durationEntity ? durationEntity.entity : null,
          dateEntity: dateEntity ? dateEntity.entity : null
        };

 //       console.log('city - %s', cityEntity.entity);
 //       console.log('state - %s', stateEntity.entity);
  //      console.log('building - %s', buildingEntity.entity);
  //      console.log('floor - %s', floorEntity.entity);
       // console.log('Seat = ' + seatEntity.entity);
  //      console.log('Date = ' + dateEntity.entity);
      //  console.log('Duration = ' + durationEntity.entity);
        
        // Prompt for title
        if (!seatassignment.cityEntity) {
            builder.Prompts.text(session, 'In which city would you like to reserve your seat?');
        } else {
            next();
        }
    },
    function (session, results, next) {
        var seatassignment = session.dialogData.seatassignment;
        if (results.response) {
            seatassignment.cityEntity = results.response;
        }

        // Prompt for time (title will be blank if the user said cancel)
        if (seatassignment.cityEntity && !seatassignment.stateEntity) {
            builder.Prompts.text(session, 'Ok, and what state?');
        } else {
            next();
        }
    },
    function (session, results, next) {
        var seatassignment = session.dialogData.seatassignment;
        if (results.response) {
            seatassignment.stateEntity = results.response;
        }

        // Prompt for time (title will be blank if the user said cancel)
        if (seatassignment.cityEntity && seatassignment.stateEntity && !seatassignment.buildingEntity) {
            builder.Prompts.text(session, 'What building?');
           //var style = builder.ListStyle.button;
            //builder.Prompts.choice(session, "Got it.  There are 3 office buildings at that location.  Which building would you like?", "Building A|Building B|Building C", { listStyle: style });
        } else {
            next();
        }
    },
    function (session, results, next) {
        var seatassignment = session.dialogData.seatassignment;
        if (results.response) {
            
            seatassignment.buildingEntity = results.response;
        } 

        

        

        // Prompt for time (title will be blank if the user said cancel)
        if (seatassignment.cityEntity && seatassignment.stateEntity && seatassignment.buildingEntity && !seatassignment.floorEntity) {
           // builder.Prompts.text(session, 'What building?');
           builder.Prompts.text(session, 'And what floor?');
        } else {
            next();
        }
    },
    function (session, results, next) {
        var seatassignment = session.dialogData.seatassignment;
        if (results.response) {
            
            seatassignment.floorEntity = results.response;
        }

        // Prompt for time (title will be blank if the user said cancel)
        if (seatassignment.cityEntity && seatassignment.stateEntity && seatassignment.buildingEntity && seatassignment.floorEntity && !seatassignment.seatEntity) {
            builder.Prompts.text(session, 'What seat?');
            //var style = builder.ListStyle.button;
            //builder.Prompts.choice(session, "We have 3 hot-seats available on the " + seatassignment.floorEntity + ". Please select the seat that you would like?", "Seat H101|Seat J205|Seat K102", { listStyle: style });
        } else {
            next();
        }
    },
    function (session, results, next) {
        var seatassignment = session.dialogData.seatassignment;
        if (results.response) {
            seatassignment.seatEntity = results.response;
        } 

        // Prompt for time (title will be blank if the user said cancel)
        if (seatassignment.cityEntity && seatassignment.stateEntity && seatassignment.buildingEntity && seatassignment.floorEntity && seatassignment.seatEntity && !seatassignment.dateEntity) {
            builder.Prompts.text(session, 'What day will you be needing this seat?');
        } else {
            next();
        }
    },
    function (session, results, next) {
        var seatassignment = session.dialogData.seatassignment;
        if (results.response) {
            seatassignment.dateEntity = results.response;
        }

        // Prompt for time (title will be blank if the user said cancel)
        if (seatassignment.cityEntity && seatassignment.stateEntity && seatassignment.buildingEntity && seatassignment.floorEntity && seatassignment.seatEntity && seatassignment.dateEntity && !seatassignment.durationEntity) {
            builder.Prompts.text(session, 'Finally, how long would you like to reserve this seat?');
        } else {
            next();
        }
    },
    function (session, results) {
        var seatassignment = session.dialogData.seatassignment;
        if (results.response) {
            
            seatassignment.durationEntity = results.response;
        }
        
        // Set the alarm (if title or timestamp is blank the user said cancel)
        if (seatassignment.cityEntity && seatassignment.stateEntity && seatassignment.buildingEntity && seatassignment.floorEntity && seatassignment.seatEntity && seatassignment.dateEntity && seatassignment.durationEntity) {
            
            builder.Prompts.text(session, 'Ok, would you like me to reserve seat %s for you in %s, %s, at the %s on the %s on %s for %s',
                seatassignment.seatEntity,
                seatassignment.cityEntity,
                seatassignment.stateEntity,
                seatassignment.buildingEntity,
                seatassignment.floorEntity,
                seatassignment.dateEntity,
                seatassignment.durationEntity);
        } else {
            session.send('Ok... no problem.');
        }
    }
]);

dialog.matches('Reserve a conference room', [
    function (session, args, next) {
        // Resolve entities passed from LUIS.
        var title;
        var entity = builder.EntityRecognizer.findEntity(args.entities, 'builtin.alarm.title');
        if (entity) {
            // Verify its in our set of alarms.
            title = builder.EntityRecognizer.findBestMatch(alarms, entity.entity);
        }
        
        // Prompt for alarm name
        if (!title) {
            builder.Prompts.choice(session, 'Which alarm would you like to delete?', alarms);
        } else {
            next({ response: title });
        }
    },
    function (session, results) {
        // If response is null the user canceled the task
        if (results.response) {
            delete alarms[results.response.entity];
            session.send("Deleted the '%s' alarm.", results.response.entity);
        } else {
            session.send('Ok... no problem.');
        }
    }
]);

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only help you reserve a seat or a conference room."));

server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html'
}));