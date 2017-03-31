/**
 * A Bot for Slack!
 */


/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}


/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!

controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "I'm here!")
});

controller.hears(['show pending asset'], ['direct_message', 'direct_mention'], function(bot,message) {
    bot.reply(message, {
            'attachments': [
                {
                    'color': "1e89c0",
                    'title': "A New Asset Has Been Uploaded!",
                    'title_link': "https://demojed.mediavalet.com/browse/categories/fd10afc3-1b8d-4cd5-a2eb-0f95f53cfb6f/0d0d03c7-5ff3-4190-a730-a4c9bf1f4d9f",
                    'text': "Please review and approve or deny the content",
                    'callback_id': '123',
                    'attachment_type': 'default',
                    'image_url': "https://mediavaletteststorage.blob.core.windows.net/medialibrary-02-5f0ed843-5603-41ed-a794-f406a247aec8-r/0cce7468-384a-42ff-b693-cb3dfbdaefd2/0d0d03c7-5ff3-4190-a730-a4c9bf1f4d9f/4/pomsky.jpg?sv=2012-02-12&se=2027-03-31T03:25:12Z&sr=b&sp=r&sig=IbgOiulwYuox2xQQ0eNW07l85l90HL9mL%2Fj635mGohg%3D",
                    "fields": [
                    {
                        "title": "Title",
                        "value": "Pomsky",
                        "short": true
                    },
                    {
                        "title": "File Name",
                        "value": "Pomsky.jpg",
                        "short": true
                    },
                    {
                        "title": "Description",
                        "value": "An adorable spotted puppy",
                        "short": true
                    },
                    {
                        "title": "Categories",
                        "value": "Pets",
                        "short": true
                    },
                    {
                        "title": "Keywords",
                        "value": "Husky, Pomeranian, Pomsky",
                        "short": true
                    }
                ],
                'ts': 1490894652,
                'actions': [
                    {
                        "name": "approve",
                        "text": "Approve",
                        "type": "button",
                        "style": "primary",
                        "value": "approve"
                    },
                    {
                        "name": "reject",
                        "text": "Reject",
                        "type": "button",
                        "style": "danger",
                        "value": "reject"
                    }
                ]
            }
        ]
    });
});

controller.on('interactive_message_callback', function(bot, message) {

    // check message.actions and message.callback_id to see what action to take...
    var result = message.actions[0].value == 'approve' ? ':white_check_mark: You have approved this asset' : ':negative_squared_cross_mark: You have denied this asset';

    bot.replyInteractive(message, {
        'attachments': [
            {
                'color': "1e89c0",
                'title': "A New Asset Has Been Uploaded!",
                'title_link': "https://demojed.mediavalet.com/browse/categories/fd10afc3-1b8d-4cd5-a2eb-0f95f53cfb6f/0d0d03c7-5ff3-4190-a730-a4c9bf1f4d9f?count=25&offset=0&sort=title%20A",
                'text': "Please review and approve or deny the content",
                'callback_id': '123',
                'attachment_type': 'default',
                'image_url': "https://mediavaletteststorage.blob.core.windows.net/medialibrary-02-5f0ed843-5603-41ed-a794-f406a247aec8-r/0cce7468-384a-42ff-b693-cb3dfbdaefd2/0d0d03c7-5ff3-4190-a730-a4c9bf1f4d9f/4/pomsky.jpg?sv=2012-02-12&se=2027-03-31T03:25:12Z&sr=b&sp=r&sig=IbgOiulwYuox2xQQ0eNW07l85l90HL9mL%2Fj635mGohg%3D",
                "fields": [
                    {
                        "title": "Title",
                        "value": "Pomsky",
                        "short": true
                    },
                    {
                        "title": "File Name",
                        "value": "Pomsky.jpg",
                        "short": true
                    },
                    {
                        "title": "Description",
                        "value": "An adorable spotted puppy",
                        "short": true
                    },
                    {
                        "title": "Categories",
                        "value": "Pets",
                        "short": true
                    },
                    {
                        "title": "Keywords",
                        "value": "Husky, Pomeranian, Pomsky",
                        "short": true
                    }
                ],
            },
            {
                'color': "1e89c0",
                'title': result,
                'mrkdwn': true,
            }
        ]
    });
    

});


/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
//controller.on('direct_message,mention,direct_mention', function (bot, message) {
//    bot.api.reactions.add({
//        timestamp: message.ts,
//        channel: message.channel,
//        name: 'robot_face',
//    }, function (err) {
//        if (err) {
//            console.log(err)
//        }
//        bot.reply(message, 'I heard you loud and clear boss.');
//    });
//});
