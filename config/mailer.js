var nodemailer = require("nodemailer");

module.exports = function(to, subject, text, html) {
    var transport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'perfectnode@gmail.com',
                pass: 'wfttmhxizvvljwoh'
            }
        });

    var mail = {
        from: "VRakashy",
        to: to,
        subject: subject,
        text: text,
        html: html
    };

    transport.sendMail(mail, function (error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response);
        }
        transport.close();
    });
};