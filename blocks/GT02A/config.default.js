exports.config = {
    // tcp service
    tcp_port: 2012,
    tcp_timeout: 300000, // seconds
    tcp_keepalive: 180000, // seconds
    
    // websocket service
	wss_port: 2013,
	wss_origins: '*:*',
	
	// database url
	db: 'mongodb://127.0.0.1:27017/gt02a'
};

