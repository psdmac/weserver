exports.config = {
    // tcp service
    tcp_port: 2014,
    tcp_timeout: 600, // seconds
    tcp_keepalive: 60, // seconds
    
    // central server
	cs_pub: 'tcp://127.0.0.1:2081',
	cs_pull: 'tcp://127.0.0.1:2082',
	
	// database url
	db: 'mongodb://127.0.0.1:27017/gm901'
};

