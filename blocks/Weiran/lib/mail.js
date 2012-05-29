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
		if (error) {
            console.log('mail error: %j', error);
        }
        if (typeof callback === 'function') {
            return callback(error, response);
        }
	});
}

function sendActivateMail(email, user, token, lang, callback) {
    var subject = '', html = '', time = new Date();
    var url = 'http://' + config.host + ':' + config.port + '/activate/account?' +
              'user=' + user + '&amp;email=' + email + '&amp;lang=' + lang +
              '&amp;key=' + token + '&amp;time=' + time.getTime();
    if (lang === 'zh-CN') {
        subject = '需要激活用户 - ' + config.name;
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您注册 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 用户。<br />' +
               '您的用户已经生成，但需要激活后才可以使用。</p>' +
               '<p>请点击下面的链接进行激活：</p>' +
               '<p><a href=' + url + '>' + url + '</a></p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name +'</a></p>';
    } else { // default 'en'
        subject = 'Account Activation Required - ' + config.name;
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
		if (error) {
            console.log('mail error: %j', error);
        }
        if (typeof callback === 'function') {
            return callback(error, response);
        }	
	});
}

function sendForgetMail(email, user, token, lang, callback) {
    var subject = '', html = '', time = new Date();
    var url = 'http://' + config.host + ':' + config.port + '/reset/password?' +
              'user=' + user + '&amp;email=' + email + '&amp;lang=' + lang +
              '&amp;key=' + token + '&amp;time=' + time.getTime();
    if (lang === 'zh-CN') {
        subject = '重设用户密码 - ' + config.name;
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您使用 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 提供的服务。</p>' +
               '<p>如果您确实忘记了用户密码，请点击下面的链接进行重置：</p>' +
               '<p><a href=' + url + '>' + url + '</a></p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name +'</a></p>';
    } else { // default 'en'
        subject = 'Password Reset Required - ' + config.name;
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
        if (error) {
            console.log('mail error: %j', error);
        }
        if (typeof callback === 'function') {
            return callback(error, response);
        }	
    });
}

function sendUpdateMail(email, user, lang, callback) {
    var subject = '', html = '';
    if (lang === 'zh-CN') {
        subject = '密码更新通知 - ' + config.name;
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您使用 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 提供的服务。</p>' +
               '<p>您的登录密码已经更新。</p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name +'</a></p>';
    } else { // default 'en'
        subject = 'Password Update Notification - ' + config.name;
        html = '<p>Dear <b>' + user + '</b>,</p>' +
               '<p>Thank you for enjoying your time with <a href=http://www.fanghuanweiran.com>' + config.name + '</a>.</p>' +
               '<p>Your password has been updated.</p>' +
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
        if (error) {
            console.log('mail error: %j', error);
        }
        if (typeof callback === 'function') {
            return callback(error, response);
        }	
	});
}

function sendDeviceCreateMail(email, user, lang, sn, callback) {
    var subject = '', html = '';
    if (lang === 'zh-CN') {
        subject = '创建设备通知 - ' + config.name;
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您使用 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 提供的服务。</p>' +
               '<p>您序列号为 <b>' + sn + '</b> 的新设备已创建成功。</p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name + '</a></p>';
    } else { // default 'en'
        subject = 'Create Device Notification - ' + config.name;
        html = '<p>Dear <b>' + user + '</b>,</p>' +
               '<p>Thank you for enjoying your time with <a href=http://www.fanghuanweiran.com>' + config.name + '</a>.</p>' +
               '<p>Your new device with a serial number of <b>' + sn + '</b> has been created successfully.</p>' +
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
        if (error) {
            console.log('mail error: %j', error);
        }
        if (typeof callback === 'function') {
            return callback(error, response);
        }	
	});
}

function sendDeviceDeleteMail(email, user, lang, sn, callback) {
    var subject = '', html = '';
    if (lang === 'zh-CN') {
        subject = '删除设备通知 - ' + config.name;
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您使用 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 提供的服务。</p>' +
               '<p>您序列号为 <b>' + sn + '</b> 的设备已删除成功。</p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name + '</a></p>';
    } else { // default 'en'
        subject = 'Delete Device Notification - ' + config.name;
        html = '<p>Dear <b>' + user + '</b>,</p>' +
               '<p>Thank you for enjoying your time with <a href=http://www.fanghuanweiran.com>' + config.name + '</a>.</p>' +
               '<p>Your device with a serial number of <b>' + sn + '</b> has been deleted successfully.</p>' +
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
        if (error) {
            console.log('mail error: %j', error);
        }
        if (typeof callback === 'function') {
            return callback(error, response);
        }	
	});
}

function sendDeviceUpdateMail(email, user, lang, sn, callback) {
    var subject = '', html = '';
    if (lang === 'zh-CN') {
        subject = '更新设备通知 - ' + config.name;
        html = '<p>亲爱的 <b>' + user + '</b>，</p>' +
               '<p>感谢您使用 <a href=http://www.fanghuanweiran.com>' + config.name + '</a> 提供的服务。</p>' +
               '<p>您序列号为 <b>' + sn + '</b> 的设备已更新成功。</p>' +
               '<p>祝您一切顺利！</p>' +
               '<p><a href=http://www.fanghuanweiran.com>' + config.name + '</a></p>';
    } else { // default 'en'
        subject = 'Update Device Notification - ' + config.name;
        html = '<p>Dear <b>' + user + '</b>,</p>' +
               '<p>Thank you for enjoying your time with <a href=http://www.fanghuanweiran.com>' + config.name + '</a>.</p>' +
               '<p>Your device with a serial number of <b>' + sn + '</b> has been modified successfully.</p>' +
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
        if (error) {
            console.log('mail error: %j', error);
        }
        if (typeof callback === 'function') {
            return callback(error, response);
        }	
	});
}

exports.sendActivateMail = sendActivateMail;
exports.sendForgetMail = sendForgetMail;
exports.sendUpdateMail = sendUpdateMail;
exports.sendDeviceCreateMail = sendDeviceCreateMail;
exports.sendDeviceDeleteMail = sendDeviceDeleteMail;
exports.sendDeviceUpdateMail = sendDeviceUpdateMail;

