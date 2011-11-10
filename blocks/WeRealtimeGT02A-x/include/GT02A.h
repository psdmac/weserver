#ifndef GT02A_H
#define GT02A_H

#ifndef SOCKET_BUFFER_SIZE
#define SOCKET_BUFFER_SIZE  4096
#endif

// Position, Velocity and Time data of GT02A
struct gt02apvt_t {
    char            model;      // sensor model
    char            dtype;      // data type
    char            imei[16];   // terminal id
    unsigned short  fsn;        // serial number of frame
    unsigned int    t;          // time stamp in s
    double          lat;        // latitude in deg
    double          lon;        // longitude in deg
    unsigned short  c;          // course of vehicle in deg
    unsigned char   v;          // velocity in km/h
    unsigned char   stgps;      // status of gps, 0: not ok, 1: ok
    unsigned char   stpow;      // status of power, 0: battery, 1: charging
    unsigned char   stsos;      // status of sos, 0: normal, 1: sos
    unsigned char   strun;      // status of running, 0: normal, 1: power off alarm
    bool            valid;
};

// Power, GSM and GPS status of GT02A
struct gt02apgg_t {
    char            model;      // sensor model
    char            dtype;      // data type
    char            imei[16];   // terminal id
    unsigned short  fsn;        // serial number of frame
    unsigned int    t;          // local time stamp
    unsigned char   stpow;      // status of power: 0~6
    unsigned char   stgsm;      // status of gsm signal: 0~4
    unsigned char   stgps;      // status of gps, 0: not ok, 1: ok, 2: differential
    unsigned char   nsate;      // number of satellite of this positioning
    bool            valid;
};

#endif // GT02A_H
