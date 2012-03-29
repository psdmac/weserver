exports.config = {
    // weiran
	name: 'Weiran',
	version: '0.0.1',
	description: 'Weiran websocket server',
	host: 'http://127.0.0.1',
	session_secret: 'fanghuanyuweiran',
	auth_cookie_name: 'fanghuanyuweiran',
	port: 2080,
	
	// database
	db_host: 'localhost',
	db_port: 27017,
	db_name: 'weiran',

	// mail SMTP
	mail_port: 25,
	mail_user: 'weiran',
	mail_pass: 'weiran',
	mail_host: 'smtp.126.com',
	mail_sender: 'club@126.com',
	mail_use_authentication: true
};

