exports.config = {
    // service
	portWeb: 80,
	portTCP: 81,
	origins: '*:*',
	key: 'xyzhu',
	
	// database
	dbHost: '127.0.0.1',
	dbPort: 3306,
	dbUser: 'user',
	dbPswd: 'password',
	dbMain: 'db_main',
	dbData: 'db_data',

	// mail
	mailService: 'Gmail',
	mailUser: 'email@gmail.com',
	mailPswd: 'password',
	mailSender: 'email@gmail.com'
};

