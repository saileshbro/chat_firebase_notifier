const functions = require('firebase-functions');
const admin = require('firebase-admin')


const onMessageCreated = async (snapshot, context) => {
  const {
    message,
    messageType,
    receiver,
    sender
  } = snapshot.data();
  console.log("MESSAGE SNAPSHOT DATA");
  console.log(snapshot.data);
  const receiverDocuments = await admin.firestore().collection('users').where('id', '==', receiver).get()
  const senderDocuments = await admin.firestore().collection('users').where('id', '==', sender).get()
  receiverDocuments.forEach(receiverUser => {
    const {
      pushNotificationTokens: receiverPushNotificationTokens,
      chattingWithId: receiverChattingWithId,

    } = receiverUser.data();
    // if one has tokens and one is not talking to sender
    if (receiverPushNotificationTokens && receiverChattingWithId !== sender) {
      senderDocuments.forEach(senderUser => {
        const {
          name: senderName,
        } = senderUser.data();
        const payload = {
          notification: {
            title: `You have a message from ${senderName}`,
            body: messageType === 0 ? message : "",
            badge: '1',
            sound: 'default'
          }
        }
        receiverPushNotificationTokens.forEach(receiverToken => {
          sendNotification(payload, receiverToken);
        })
      })
    } else {
      console.log("No pushNotification found!")
    }
  })
}
const sendNotification = async (payload, senderToken) => {
  try {
    const response = await admin.messaging().sendToDevice(senderToken, payload)
    console.log("Notified Successfully: " + response)
  } catch (error) {
    console.error("Error: " + error)
  }
}
notify = functions.firestore.document("messages/{groupId}/{groupId2}/{message}").onCreate(onMessageCreated);
notify();
