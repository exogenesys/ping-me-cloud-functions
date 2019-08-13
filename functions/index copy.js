const functions = require('firebase-functions');
const firebase = require("firebase-admin");

const serviceAccount = require("./serviceAccountKeys/firebase-adminsdk.json");

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
    // [END authIntegration]

    const channelRef = db.collection('channels').doc(channelId);
    const userRef = db.collection('users').doc(uid);

    const subscribersUnion = channelRef.update({
        subscribers: firebase.firestore.FieldValue.arrayUnion(uid)
    })

    const channelUnion = userRef.update({
        subscriptions: firebase.firestore.FieldValue.arrayUnion(channelId)
    })
    
    return Promise.all([subscribersUnion, channelUnion]).then(res => {
        console.log('subscribing to: ', res);
        return { 
            channelId: channelId, error: false, message: 'subscribed'
        };
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

  const channelRef = db.collection('channels').doc(channelId);
  const userRef = db.collection('users').doc(uid);

  const subscribersRm = channelRef.update({
      subscribers: firebase.firestore.FieldValue.arrayRemove(uid)
  })

  const channelRm = userRef.update({
      subscriptions: firebase.firestore.FieldValue.arrayRemove(channelId)
  })
  
  return Promise.all([subscribersRm, channelRm]).then(res => {
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


exports.pingUsers = functions.pubsub
  .schedule('5 * * * *')
  .timeZone('Pacific/Auckland')
  .onRun(context => {
    console.log('triggered every 5 minutes', context);
});