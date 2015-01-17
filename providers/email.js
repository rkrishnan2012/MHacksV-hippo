module.exports.start = function(config) {
    var MailListener = require("mail-listener2");

    var mailListener = new MailListener({
        username: config.gmail_email,
        password: config.gmail_password,
        host: "imap.gmail.com",
        port: 993, // imap port
        tls: true, // use secure connection
        tlsOptions: {
            rejectUnauthorized: false
        },
        mailbox: "INBOX", // mailbox to monitor
        markSeen: true, // all fetched email willbe marked as seen and not fetched next time
        attachments: false,
        fetchUnreadOnStart: true // use it only if you want to get all unread email on lib start. Default is `false`
    });

    mailListener.start();

    mailListener.on("mail", function(mail, seqno, attributes) {
        console.log("New Email!");
    });
}