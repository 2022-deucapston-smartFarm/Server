const admin = require("firebase-admin");
const serviceAccount = require("../firebase-admin.json");
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});
const schema = require('../schema/schema');

module.exports.message = async function(title,body){
    let message = {
		notification: {
		  title: title,
		  body: body,
		},
	    token: ""
	}
    await schema.FcmSchema.find(function(error,data){
		if(error){
			console.log("db fcm 처리 실패");
		}else{
			if(data == null || data.length === 0){
				console.log("empty");
				return;
			}
			data.forEach(element => {
				message.token = element.token;
                admin
                .messaging()
                .send(message)
                .then(function (response) {
                console.log('Successfully sent message: : ', response)
                })
                .catch(function (err) {
                    console.log('Error Sending message!!! : ', err)
                });
			});
		}
	}).clone();
}