exports.config = {
    // tcp service
    tcp_port: 2012,
    tcp_timeout: 600, // seconds
    tcp_keepalive: 60, // seconds
    
    // websocket service
	wss_port: 2013,
	wss_origins: '*:*',
	
	// database url
	db: 'mongodb://127.0.0.1:27017/gt02a'
};

