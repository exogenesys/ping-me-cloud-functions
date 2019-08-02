const crypto = require("crypto");

const functions = require('firebase-functions');
const firebase = require("firebase-admin");

const serviceAccount = require("./serviceAccountKeys/firebase-adminsdk.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://heythanksthisisawesome.firebaseio.com"
});



const cors = require('cors')({
    origin: true,
});

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
    // [END authIntegration]

    const refString = 'subscriptions/' + uid;
    
      const query = firebase.database().ref(refString);

      return query.once('value').then((snapshot) => {

        const doesSubscriptionExist = false;

         snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key
          const childData = childSnapshot.val()
    
          if(childData.channelId === channelId && childData.active === false){
            doesSubscriptionExist = true;
            firebase.database().ref(refString + '/' + key).update({
              active: true
            }).then(() => {
              return { channelId: channelId, error: false, message: 'updated' };
            }).catch((error) => {
                // Re-throwing the error as an HttpsError so that the client gets the error details.
                throw new functions.https.HttpsError('unknown', error.message, error);
              })
          } else if (childData.channelId === channelId && childData.active === true){
              doesSubscriptionExist = true;
              return { channelId: channelId, error: true, message: 'already subscribed to channel' };
          }
        })
        if(doesSubscriptionExist){
          firebase.database().ref(refString).push({
            channelId: channelId,
            active: true,
            email: email
          }).then(() => {
            console.log('New Channel Subscribed');
            // Returning the sanitized message to the client.
            return { channelId: channelId, error: false, message: 'added' };
          })
          // [END returnMessageAsync]
          .catch((error) => {
            // Re-throwing the error as an HttpsError so that the client gets the error details.
            throw new functions.https.HttpsError('unknown', error.message, error);
          });
          // [END_EXCLUDE]
        }
      })
    
    
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

  const refString = 'subscriptions/' + uid;

  const query = firebase.database().ref(refString);

  return query.once('value').then((snapshot) => {
    return snapshot.forEach((childSnapshot) => {
      const key = childSnapshot.key
      const childData = childSnapshot.val()

      if(childData.channelId === channelId){
        firebase.database().ref(refString + '/' + key).update({
          active: false
        }).then(() => {
          return { channelId: channelId, error: false };
        }).catch((error) => {
            // Re-throwing the error as an HttpsError so that the client gets the error details.
            throw new functions.https.HttpsError('unknown', error.message, error);
          })
      }

    })
  })

});



// return firebase.database().ref(refString).orderByChild('channelId').equalTo(channelId).on("value", (snapshot) => {
//   if(!snapshot.val()){
//     return { error: { message: "subscription not found"} };
//   } else {
//     console.log('snapshot val', JSON.stringify(snapshot.val()));
//     const key = snapshot.key
//     console.log('snapshot key', JSON.stringify(key));
//     console.log('finale path', refString + '/' + key)

//     firebase.database().ref(refString + '/' + key).update({
//       active: false
//     }).then(() => {
//       console.log('New Channel Unsubscribed');
//       return { channelId: channelId, error: false };
//     }).catch((error) => {
//       // Re-throwing the error as an HttpsError so that the client gets the error details.
//       throw new functions.https.HttpsError('unknown', error.message, error);
//     })
//   }
// })