exports.config = {
    // service
	host: '127.0.0.1', // ip/domain, without http:// header and / tailer
	port: 80,
	name: 'name',
	key: 'key',
	origins: '*:*',
	
	// database
	db: 'mongodb://host/name',

	// mail
	mail_service: 'Gmail',
	mail_user: 'email@gmail.com',
	mail_password: 'password',
	mail_sender: 'email@gmail.com'
};

