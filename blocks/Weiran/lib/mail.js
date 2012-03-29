var mailer = require('nodemailer'),
    config = require('../config').config;

var transport = mailer.createTransport('SMTP', {
    service: config.mail_service,
    auth: {
        user: config.mail_user,
        pass: config.mail_password
    }
});

function sendMail(data, callback){
	transport.sendMail(data,function(err, res){
		return callback(err, res);
	});
}

function sendActivateMail(email, user, token, callback){
	var subject = config.name + '社区帐号激活';
	var html = '<p>您好：<p/>' +
			   '<p>我们收到您在' + config.name + '社区的注册信息，请点击下面的链接来激活帐户：</p>' +
			   '<a href="' + config.host + '/active_account?key=' + token + '&user=' + user + '&email=' + email + '">激活链接</a>' +
			   '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
			   '<p>' +config.name +'社区 谨上。</p>'

	var data = {
		to: email,
		sender: config.mail_sender,
		subject: subject,
		html: html
	}

	sendMail(data, function(err, res){
		return callback(err, res);
	});
}

function sendUpdateMail(email, user, callback){
	var subject = config.name + '社区密码重置';
	var html = '<p>您好：<p/>' +
			   '<p>我们收到您在' + config.name + '社区重置密码的请求，请单击下面的链接来重置密码：</p>' +
			   '<a href="' + config.host + '/reset_pass?' + '&user=' + user + '&email=' + email + '">重置密码链接</a>' +
			   '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
			   '<p>' + config.name +'社区 谨上。</p>'

	var data = {
		to: email,
		sender: config.mail_sender,
		subject: subject,
		html: html
	}

    sendMail(data, function(err, res){
        return callback(err, res);	
	});
}

exports.sendActivateMail = sendActivateMail;
exports.sendUpdateMail = sendUpdateMail;
