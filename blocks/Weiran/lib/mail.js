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
        subject = config.name + ' - 需要激活帐号';
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您注册 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 帐号。<br />' +
               '您的帐号已经生成，但需要激活后才可以使用。</p>' +
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
        subject = config.name + ' - 重设帐号密码';
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您使用 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 提供的服务。</p>' +
               '<p>如果您确实忘记了帐号密码，请点击下面的链接进行重置：</p>' +
               '<p><a href=' + url + '>' + url + '</a></p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name +'</a></p>';
    } else { // default 'en'
        subject = config.name + ' - Password Reset Required';
        html = '<p>Dear <b>' + user + '</b>,</p>' +
               '<p>Thank you for enjoying the time with <a href=http://www.fanghuanweiran.com>' + config.name + '</a>.</p>' +
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
        subject = config.name + ' - 帐号信息更新';
        html = '<p>感谢您注册<a href=http://www.fanghuanweiran.com>' + config.name + '</a>帐号。<br />' +
               '您的帐号已经生成，但需要激活后才可使用。</p>' +
               '<p>请点击下面的链接来激活帐户：</p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name +'</a> 谨上。</p>';
    } else { // default 'en'
        subject = config.name + ' - Account Infomation Updated';
        html = '<p>Thank you for registering for an <a href=http://www.fanghuanweiran.com>' + config.name + '</a> account.<br />' +
               'Your account is almost ready for use, but first it has to be activated.</p>' + 
               '<p>Please activate your account now by clicking the link below.</p>' +
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
