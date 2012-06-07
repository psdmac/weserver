exports.config = {
    // service
	host: '127.0.0.1', // ip/domain, without http:// header and / tailer
	port: 80,
	name: 'weiran',
	key: 'key',
	origins: '*:*',
	
	// database url
	db: 'mongodb://host/name',

	// mail
	mail_service: 'xmail',
	mail_user: 'email@xmail.com',
	mail_password: 'password',
	mail_sender: 'email@xmail.com',
	
	// administrators
	admins: 'admin1,admin2,admin3'
};

