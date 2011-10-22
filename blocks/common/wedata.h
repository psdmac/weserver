#ifndef WEDATA_H
#define WEDATA_H

#ifndef SOCKET_BUFFER_SIZE
#define SOCKET_BUFFER_SIZE  4096
#endif

// Position, Velocity and Time data of GT02A
struct gt02apvt_t {
    char            model;      // sensor model
    char            dtype;      // data type
    char            imei[16];   // terminal id
    unsigned short  fsn;        // serial number of frame
    time_t          t;          // time stamp in s
    double          lat;        // latitude in deg
    double          lon;        // longitude in deg
    unsigned short  c;          // course of vehicle in deg
    unsigned char   v;          // velocity in km/h
    char            stgps;      // status of gps, 0: not ok, 1: ok
    char            stpow;      // status of power, 0: battery, 1: charging
    char            stsos;      // status of sos, 0: normal, 1: sos
    char            strun;      // status of running, 0: normal, 1: power off alarm
    bool            valid;
};

// Power, GSM and GPS status of GT02A
struct gt02apgg_t {
    char            model;      // sensor model
    char            dtype;      // data type
    char            imei[16];   // terminal id
    unsigned short  fsn;        // serial number of frame
    time_t          t;          // local time stamp
    char            stpow;      // status of power: 0~6
    char            stgsm;      // status of gsm signal: 0~4
    char            stgps;      // status of gps, 0: not ok, 1: ok, 2: differential
    char            nsate;      // number of satellite of this positioning
    bool            valid;
};

/*
struct STerminal {
    // ids in datamap
    char            did[32];        // database server id
    //char            uid[32];        // user id
    char            sid[32];        // service id
    char            tid[32];        // terminal id

    // times
    time_t          rcvtime;        // receiving time
//    time_t          tmntime;        // terminal time stamp

    // terminal status
    unsigned short  reboottimes;    // reboot times
    unsigned short  redialtimes;    // redial times, old version
    unsigned short  sendtimes;      // data sending times
    unsigned short  gsmerrtimes;    // GSM error times
    unsigned int    runlifetime;    // count after boot, in seconds
    unsigned char   softversion;    // terminal software version

    // frame data type
    unsigned char   datatype;       // [0singlepoint,1multipoint,2resendpoint,3cmdfeedback,4queryfeedback]

    // gps infomation
    unsigned char   gpsstatus;      // GPS module status [0,1,2,3]
    time_t          gpstime;        // GPS positioning time
    float           latitude;       // latitude in WGS84
    float           longitude;      // longitude in WGS84
    unsigned short  speed;          // velocity [0,+] km/h
    unsigned short  heading;        // direction [0,359] degrees
    unsigned char   gpssatenum;     // gps satellite count
    unsigned char   gpssatevalidnum; // gps satellite valid count
    unsigned char   gpssignal;      // gps mean signal strength

    // gsm infomation
    unsigned char   celltype;       // 0 gsm while 1 cdma
    unsigned char   cellsignal;     // cell tower signal strength
    unsigned short  lac;            // location area code GSM
    unsigned short  ci;             // Cell Identity GSM

    // other sensors infomation
    unsigned char   power;          // power source [0,1]
    unsigned char   acc;            // ACC status of the vehicle [0,1,2,3]
    unsigned long   mileage;        // in km
    //unsigned char   vehiclestatus;  // in bit wise
    unsigned char   vrstatus;       // vehicle rotation status, 0: n/a, 1: clockwise, 2: anti-clockwise, 3: stop
    unsigned char   vlstatus;       // vehicle load status, 0: n/a, 1: light, 2: heavy, 3: half
    unsigned char   vestatus;       // vehicle engine status, 0: n/a, 1: normal, 2: off oil and electricity, 3: reserved
    short           temp1;          // temperature 1 in 0.1 degrees
    short           temp2;          // temperature 2
    short           temp3;          // temperature 3
    short           temp4;          // temperature 4
    short           humid1;         // humidity 1 in 0.1
    short           humid2;         // humidity 2
    unsigned char   oil;            // percentage of oil
    unsigned short  restpay;        // left hours of the service

    // alarms
    unsigned char   alarm;          // alarm sign 8 alarms of each bit

    // for command transmiter
    char            command[32];    // command content
    // for terminal history data fitness
    int             fitepochnum;    // valid epochs
    int             fitepochall;    // all epochs
    int             fitonesize;     // one epoch data length
    int             fitinterval;    // epoch interval in seconds
    int             fitepochpos;    // epoch position
    bool            valid;
    //int             buchuan;        //1:buchuan
};

struct SCommand {
    char cmdtime[32];    // commanding time
    char uid[64];        // user id
    //char user[64];       // user name within the UID
    char sid[32];        // service id
    char tid[32];        // terminal id
    char content[128];   // content of the command
    char sendtime[32];   // send time
    char backtime[32];    // receive feadback time
};

struct SDataMap {
    char tid[32];   // terminal id
    char sid[32];   // service id
    //char wid[16];   // dwtserver id
    char did[32];   // database server id
    //char uid[40];   // user id
    char tt[32];      // end time of didl
    char didl[32];  // db server long
};

struct SDBServer {
    char            did[32];    // db server id
    char            ip[32];     // db server ip
    unsigned short  port;       // db server port
    char            user[64];   // db server user
    char            pswd[64];   // db server password
    char            fifo[64];   // fifo of data to this did
    int             fdwr;       // file descriptor of write only fifo
    int             fdrd;       // file descriptor of read only fifo
};
*/
//WX_DECLARE_STRING_HASH_MAP(STerminalStatus,MapTermStatus);
//WX_DECLARE_STRING_HASH_MAP(SDataMap,MapDataMap);
//WX_DECLARE_STRING_HASH_MAP(SDBServer,MapDBServer);

#endif // WEDATA_H
