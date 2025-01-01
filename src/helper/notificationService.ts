import { admin } from "./firebase";

// Define the notification payload structure more clearly
export const sendPushNotification = async (notification: any) => {
  console.log(notification,"notificationnotification")
  if (!notification) {
    throw new Error('Invalid token');
  }

  try {
    const response = await admin.messaging().send(notification);
    
    // The response contains the message ID string if successful
    if (response) {
      console.log('Notification sent successfully:', response);
      return {
        status: 'success',
        messageId: response
      };
    }
  } catch (error) {
    // console.error('Error sending notification:', error);
    return {
      status: 'fail',
      error: error
    };
  }
};
