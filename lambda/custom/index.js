//aws account: 576515628@qq.com
//pwd: Dante24hyy
// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const {
  getRequestType,
  getIntentName,
  getSlotValue,
  getDialogState,
} = require('ask-sdk-core');

//load the file that can query the workers status based on the name
const getworkers = require("queryworkers");
// Load the AWS SDK for Node.js
//const AWS = require('aws-sdk');
// Set the region 
//AWS.config.update({region: 'REGION'});

// Create the DynamoDB service object
//var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        
        const speakOutput = 'Welcome come to crowdsoucing platform, sign in your name to do the following step!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
//sigin in intent
//ask for user name and store the name as a session attribute
//and output the name 
//question1:  if I want to add the user into database, can I just direct do like this？ to call dynanodb in the handler? but I think ddb.putitem is a function
// there are no nested function in nodejs right? 
//question2: As I have a id attribute in dynanodb, is that means I have to find what the number if id are existe now and plus one? but how to do that?
// I think is too tricky to read from db and plus one and write to db? Is there easier way to acheive that? Or just give up worker id, is that affect the system?
const SignInIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SignInIntent';
    },
    handle(handlerInput) {
       const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
       var workersname= getSlotValue(handlerInput.requestEnvelope, 'workername');
       sessionAttributes.signin_Name = workersname;
       handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        const speakOutput =  'Hi' +sessionAttributes.signin_Name;

       /*var params = {
            TableName: 'worker',
            Item: {
              'workername' : {N: '0002'},
              'workerid' : {S: sessionAttributes.signin_Name},
              'task_complete':{L:[ { "N" : "1" }, { "N" : "2" }, { "N" : "3" }, { "N" : "4" }, { "N" : "5" }, { "N" : "6" } ]},
              'task_incomplete':{L:[]}
            }
          };

          // Call DynamoDB to add the item to the table
          ddb.putItem(params, function(err, data) {
            if (err) {
              console.log("Error", err);
            } else {
              console.log("Success", data);
            }
          });*/

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('what do you want? Check task? Do task?')
            .getResponse();
    }
};


//check avalble task for the signin user
//use the name that user have sign in and return the avalble task from dynanodb
// the require task are store as number list
//TODO: How can I out put all the item in num list
//error: 

const CheckAvalibleIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckAvalible';
    },
    handle(handlerInput) {
        return new Promise((resolve,reject)=>{
            //resolve the user name 
            const sessionAttribute = handlerInput.attributesManager.getSessionAttributes();
            const name  = sessionAttribute.signin_Name;
            let lowername =name.toLowerCase();
            let speakOutput;
            //const speakOutput =  "Here is the task that avalable to you :";
            getworkers.getWorkerByName(lowername,the_worker =>{
                if (the_worker){
                    //I have put workerid here because I don't know how to output a list , so just let the dabatabse things work!
                    speakOutput = "Here is the task that avalable to you : "+the_worker.workerid;
                }else{
                    speakOutput = "I can't find your name with " + lowername;
                }
                reprompt = "what are you going to do next?";
                const response = handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(reprompt)
                    .withSimpleCard(name,speakOutput)
                    .getResponse();
                resolve(response);
                return;
            })
        })
    },
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SignInIntentHandler,
        CheckAvalibleIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
        ) 
    .addErrorHandlers(
        ErrorHandler,
        )
    .lambda();
