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
	transport.sendMail(data,function(error, response) {
		return callback(error, response);
	});
}

function sendActivateMail(email, user, token, lang, callback) {
    var subject = '', html = '', time = new Date();
    var url = 'http://' + config.host + ':' + config.port + '/activate/account?' +
              'user=' + user + '&amp;email=' + email + '&amp;lang=' + lang +
              '&amp;key=' + token + '&amp;time=' + time.getTime();
    if (lang === 'zh-CN') {
        subject = config.name + ' - 需要激活用户';
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您注册 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 用户。<br />' +
               '您的用户已经生成，但需要激活后才可以使用。</p>' +
               '<p>请点击下面的链接进行激活：</p>' +
               '<p><a href=' + url + '>' + url + '</a></p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name +'</a></p>';
    } else { // default 'en'
        subject = config.name + ' - Account Activation Required';
        html = '<p>Dear <b>' + user + '</b>,</p>' +
               '<p>Thank you for registering for an account of <a href=http://www.fanghuanweiran.com>' + config.name + '</a>.<br />' +
               'Your account is almost ready for use, but first it has to be activated.</p>' + 
               '<p>Please activate your account now by clicking the link below.</p>' +
               '<p><a href=' + url + '>' + url + '</a></p>' +
               '<p>Best Regards, </p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name + '</a></p>'; 
    }

	var data = {
		to: email,
		sender: config.mail_sender,
		subject: subject,
		html: html
	}

	sendMail(data, function(error, response) {
		return callback(error, response);
	});
}

function sendForgetMail(email, user, token, lang, callback) {
    var subject = '', html = '', time = new Date();
    var url = 'http://' + config.host + ':' + config.port + '/reset/password?' +
              'user=' + user + '&amp;email=' + email + '&amp;lang=' + lang +
              '&amp;key=' + token + '&amp;time=' + time.getTime();
    if (lang === 'zh-CN') {
        subject = config.name + ' - 重设用户密码';
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您使用 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 提供的服务。</p>' +
               '<p>如果您确实忘记了用户密码，请点击下面的链接进行重置：</p>' +
               '<p><a href=' + url + '>' + url + '</a></p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name +'</a></p>';
    } else { // default 'en'
        subject = config.name + ' - Password Reset Required';
        html = '<p>Dear <b>' + user + '</b>,</p>' +
               '<p>Thank you for enjoying your time with <a href=http://www.fanghuanweiran.com>' + config.name + '</a>.</p>' +
               '<p>If the password of your account is missing, it can be reset by clicking the link below.</p>' +
               '<p><a href=' + url + '>' + url + '</a></p>' +
               '<p>Best Regards, </p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name + '</a></p>'; 
    }
    
    var data = {
        to: email,
        sender: config.mail_sender,
        subject: subject,
        html: html
    }
    
    sendMail(data, function(error, response) {
        return callback(error, response);
    });
}

function sendUpdateMail(email, user, lang, callback) {
    var subject = '', html = '';
    if (lang === 'zh-CN') {
        subject = config.name + ' - 用户信息更新';
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您使用 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 提供的服务。</p>' +
               '<p>您的用户注册信息已经更新。</p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name +'</a></p>';
    } else { // default 'en'
        subject = config.name + ' - Account Update Notification';
        html = '<p>Dear <b>' + user + '</b>,</p>' +
               '<p>Thank you for enjoying your time with <a href=http://www.fanghuanweiran.com>' + config.name + '</a>.</p>' +
               '<p>Your account infomation has been updated.</p>' +
               '<p>Best Regards, </p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name + '</a></p>'; 
    }

	var data = {
		to: email,
		sender: config.mail_sender,
		subject: subject,
		html: html
	}

    sendMail(data, function(error, response) {
        return callback(error, response);	
	});
}

exports.sendActivateMail = sendActivateMail;
exports.sendForgetMail = sendForgetMail;
exports.sendUpdateMail = sendUpdateMail;
