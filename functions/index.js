const functions = require('firebase-functions');
const firebase = require("firebase-admin");
const serviceAccount = require("./serviceAccountKeys/firebase-adminsdk.json");
const mailJetConstants = require("./serviceAccountKeys/mailjet.json");

const mailjet = require("node-mailjet").connect(mailJetConstants.username, mailJetConstants.secret)
const mailBody = require("./mail");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://heythanksthisisawesome.firebaseio.com"
});

const db = firebase.firestore();

exports.subscribeTo = functions.https.onCall((data, context) => {
    
    
    let channelId = data.channelId || '';
    
    if (!(typeof channelId === 'string') || channelId.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
        'two arguments "email" & "channelId" containing the message text to add.');
    }
    
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
        'while authenticated.');
    }
    
    // [END messageHttpsErrors]
    
    // [START authIntegration]
    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    const email = context.auth.token.email || null;
    const name = context.auth.token.name || null;
    
    // [END authIntegration]
    
    // const channelRef = db.collection('channels').doc(channelId);
    const userRef = db.collection('users').doc(uid);
    
    const subscribersUnion = channelRef.update({
        subscribers: firebase.firestore.FieldValue.arrayUnion(uid)
    })
    
    const subscriptionEmail = mailjet.post("send", {'version': 'v3.1'}).request({
        "Messages":[
            {
                "From": {
                    "Email": mailJetConstants.senderEmail || 'support@pingme.cf',
                    "Name": "Harsh Gautam"
                },
                "To": [
                    {
                        "Email": email || 'hrshgtm9@gmail.com',
                        "Name": name || 'Friend'
                    }
                ],
                "Subject": "Never Miss the Events at Pragati Madain again!",
                "HTMLPart": emailBody.html || "Please reply to this email if you with the text \'Empty E-Mail\' if you see this. Thanks for helping me fix bugs! :)"
            }
        ]
    })
    
    return Promise.all([subscribersUnion, subscriptionEmail]).then(res => {
        console.log('subscribing to: ', res);
        return { 
            channelId: channelId, error: false, message: 'subscribed'
        };
    }).catch((err) => {
        console.log(err)
    });
    
});

exports.getSubscriptionData = functions.https.onCall((data, context) => {
    
    
    const channelId = data.channelId || '';
    
    if (!(typeof channelId === 'string') || channelId.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
        'two arguments "email" & "channelId" containing the message text to add.');
    }
    
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
        'while authenticated.');
    }
    
    // [END messageHttpsErrors]
    
    // [START authIntegration]
    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    
    // [END authIntegration]
    
    const userRef = db.collection('users').doc(uid);

    const isUserSubscribed = userRef.get().then(doc => {
        if (!doc.exists) {
            return 'invalid channel'
        } else {
            if(doc.data().subscriptions.some(subscription => {
                return (JSON.stringify(subscription) === JSON.stringify(channelId))
            })){
                return 'subscribed'
            } else {
                return 'not subscribed'
            }
        }
    })

    return Promise.all([isUserSubscribed]).then(res => {
        console.log('subscribing to: ', res);
        switch (res[0]) {
            case 'invalid channel':
            return {
                error: true, message: res[0]
            }
            case 'subscribed':
            return {
                error: false, message: res[0]
            }
            case 'not subscribed':
            return {
                error: false, message: res[0]
            }
            default:
            return {
                error: true, message: 'unknown error'
            }
        }
    }).catch((err) => {
        console.log(err)
    });
    
    
});

exports.unSubscribeTo = functions.https.onCall((data, context) => {
    
    let channelId = data.channelId || '';
    
    if (!(typeof channelId === 'string') || channelId.length === 0) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
        'two arguments "email" & "channelId" containing the message text to add.');
    }
    
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
        'while authenticated.');
    }
    
    // [END messageHttpsErrors]
    
    // [START authIntegration]
    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    // [END authIntegration]
    
    // const channelRef = db.collection('channels').doc(channelId);
    const userRef = db.collection('users').doc(uid);
    
    // const subscribersRm = channelRef.update({
    //     subscribers: firebase.firestore.FieldValue.arrayRemove(uid)
    // })
    
    const channelRm = userRef.update({
        subscriptions: firebase.firestore.FieldValue.arrayRemove(channelId)
    })
    
    return Promise.all([channelRm]).then(res => {
        console.log('unsubscribing to: ', res);
        return { 
            channelId: channelId, error: false, message: 'unsubscribed' 
        };
    });
    
});

exports.createUserDocument = functions.auth.user().onCreate((user) => {
    const userRef = db.collection('users').doc(user.uid);
    userDocument = userRef.set({
        subscriptions: []
    })
    return Promise.all([userDocument]).then(res => {
        return console.log('Creating User Document: ', res);
    })
});


exports.pingUsersDaily = functions.pubsub
.schedule('20 10 * * *')
.timeZone('Asia/Kolkata')
.onRun((context) => {
    console.log('triggered every day @ 10:20 AM');
    return null;
});

exports.pingUsersWeekly = functions.pubsub
.schedule('15 10 * * 1')
.timeZone('Asia/Kolkata')
.onRun((context) => {
    console.log('triggered every week @ 10:15 AM');
    return null;
});

exports.pingUsersMonthly = functions.pubsub
.schedule('10 10 1 * *')
.timeZone('Asia/Kolkata')
.onRun((context) => {
    console.log('triggered every month @ 10:10 AM');
    return null;
});

// exports.pingUsersDaily = functions.https.onRequest((req, res) => {
//     console.log('triggered every 5 minutes', req.body);
//     res.status(200).send({'success': true});
// });

// exports.pingUsersWeekly = functions.https.onRequest((req, res) => {
//     console.log('triggered every 5 minutes', req.body);
//     res.status(200).send({'success': true});
// });

// exports.pingUsersMonthly = functions.https.onRequest((req, res) => {
//     console.log('triggered every 5 minutes', req.body);
//     res.status(200).send({'success': true});
// });
