exports.config = {
    // service
	host: '127.0.0.1', // ip/domain, without http:// header and / tailer
	port: 2080,
	name: 'fanghuanweiran.com',
	key: 'fanghuanyuweiran',
	origins: '*',
	
	// database
	db: 'mongodb://127.0.0.1:27017/weiran',

	// mail
	mail_service: 'Gmail',
	mail_user: 'email@gmail.com',
	mail_password: 'password',
	mail_sender: 'email@gmail.com'
};

