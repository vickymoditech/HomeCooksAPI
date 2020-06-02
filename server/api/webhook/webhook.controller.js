import config from '../../config/environment';
import axios from 'axios';

const PAGE_ACCESS_TOKEN = 'EAAMN8IA3Mk0BAEE1QKcaNjti4h834WO9AZCVXgbg5jCAiq9g4lbhy9QYqIv44s7ZBIKQSitiZCDGxX8rZBVMjxOu54u4ZA5lUbZCNEqWeDAOcdfJ8EomO74Hu3NXZBxGHZAEnCCcWetrPlIXNKytFsHdafhSRZCCleQ1SmB92SjxhPgZDZD';

export function create(req, res, next) {
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if(body.object === 'page') {

        body.entry.forEach(function(entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            console.log(webhook_event.sender);
            let sender_psid = webhook_event.sender.id;
            console.log('Sender ID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if(webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if(webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });
        // Return a '200 OK' response to all events
        res.status(200)
            .send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}

export function index(req, res, next) {
    const VERIFY_TOKEN = '310b4aec-8619-4fc0-90fe-6d0af86f15b0';

    // Parse params from the webhook verification request
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Check if a token and mode were sent
    if(mode && token) {

        // Check the mode and token sent are correct
        if(mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Respond with 200 OK and challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200)
                .send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}

function handleMessage(sender_psid, received_message) {
    let response;
    // Checks if the message contains text
    if(received_message.text) {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        response = {
            'text': `You sent the message: "${received_message.text}". Now send me an attachment!`
        };
    } else if(received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            'attachment': {
                'type': 'template',
                'payload': {
                    'template_type': 'generic',
                    'elements': [{
                        'title': 'Is this the right picture?',
                        'subtitle': 'Tap a button to answer.',
                        'image_url': attachment_url,
                        'buttons': [
                            {
                                'type': 'postback',
                                'title': 'Yes!',
                                'payload': 'yes',
                            },
                            {
                                'type': 'postback',
                                'title': 'No!',
                                'payload': 'no',
                            }
                        ],
                    }]
                }
            }
        };
    }
    // Send the response message
    callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
    console.log('ok');
    let response;
    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if(payload === 'yes') {
        response = {'text': 'Thanks!'};
    } else if(payload === 'no') {
        response = {'text': 'Oops, try sending another image.'};
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

async function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        'recipient': {
            'id': sender_psid
        },
        'message': response
    };

    // Send the HTTP request to the Messenger Platform

    const api = {
        method: 'POST',
        url: `https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        data: request_body
    };
    try {
        const posts = await axios(api);
        console.log(posts);
    } catch(error) {
        console.log(error.message.toString());
    }

}
