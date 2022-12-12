const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
//Initializing Firebase Admin SDK
admin.initializeApp();

//Creating Nodemailer transporter using your Mailtrap SMTP details
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "stiwdiofreelanceragency@gmail.com",
    pass: "ssyofozjgmflvubm"
  }
});

exports.sendEmail = functions.firestore
    .document('sentmails/{sentmailId}')
    .onCreate((snap, context) => {
        const mailOptions = {
            from: 'stiwdiofreelanceragency@gmail.com',
            to: snap.data().to,
            subject: 'Stiwdio Agency message',
            html: `<h3>Email from Stiwdio Agency</h3>
                      <p>
                          <b>Email from: </b>${snap.data().from}
                          <br>${snap.data().message}
                      </p>`
        };
        //Returning result
        return transporter.sendMail(mailOptions, (error, data) => {
            if (error) {
                console.log(error)
                return
            }
            console.log("email sent!")
        });
    });


