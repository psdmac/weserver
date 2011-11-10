/***************************************************************
 * Name:      WeGT02AApp.cpp
 * Purpose:   Code for Application Class
 * Author:    YANTAO TIAN (yantaotian@gmail.com)
 * Created:   2011-06-14
 * Copyright: YANTAO TIAN (www.weiran.biz)
 * License:
 **************************************************************/

#ifdef WX_PRECOMP
#include "wx_pch.h"
#endif

#ifdef __BORLANDC__
#pragma hdrstop
#endif //__BORLANDC__

#include "../include/WeGT02AApp.h"
#include "../include/TEcho.h"
#include <iostream>
#include <wx/fileconf.h>
#include <wx/stdpaths.h>
#include <netinet/in.h>

IMPLEMENT_APP(WeGT02AApp);

bool WeGT02AApp::OnInit()
{
    std::cout << time(NULL) << " WeSensorGT02A starts" << std::endl;

    wxString sfile;
    sfile = "/usr/local/etc/WeSensorGT02A.conf";
    LoadConfigurations(sfile);

    m_pServer = NULL;
    m_pZmqCtx = NULL;
    m_pZmqSock = NULL;
    m_pvt.model = *(m_model.mb_str()); //'A';  // GT02A
    m_pvt.dtype = *(m_gtype.mb_str()); //'g';  // gps
    m_pvt.valid = false;
    m_pgg.model = *(m_model.mb_str()); //'A';  // GT02A
    m_pgg.dtype = *(m_stype.mb_str()); //'s';  // status
    m_pgg.valid = false;
    memset(m_buffer, 0, SOCKET_BUFFER_SIZE);
    m_hb[0] = 0x54;
    m_hb[1] = 0x68;
    m_hb[2] = 0x1a;
    m_hb[3] = 0x0d;
    m_hb[4] = 0x0a;

    // bind event handlers
    Bind(wxEVT_SOCKET, &WeGT02AApp::OnServer, this, WeGT02AApp::ID_SERVER);
    Bind(wxEVT_SOCKET, &WeGT02AApp::OnClient, this, WeGT02AApp::ID_CLIENT);

    if (!CreateTEcho()) return false;
    if (!StartService()) return false;

    return true;
}

int WeGT02AApp::OnExit()
{
    // close all sockets
    if (m_pServer != NULL) m_pServer->Destroy();
    if (m_lClients.size() > 0) {
        std::list<wxSocketBase*>::iterator it;
        for (it = m_lClients.begin(); it != m_lClients.end(); it++) {
            (*it)->Destroy();
        }
    }
    m_lClients.clear();

    if (m_pZmqSock != NULL) delete m_pZmqSock;
    if (m_pZmqCtx != NULL) delete m_pZmqCtx;

    return 0;
}

void WeGT02AApp::LoadConfigurations(const wxString& file)
{
    wxFileConfig *pConf;
    pConf = new wxFileConfig("", "", file, "", wxCONFIG_USE_LOCAL_FILE);
    pConf->Read(_T("/WeSensorGT02A/tcpport"), &m_port, 2100);
    pConf->Read(_T("/WeSensorGT02A/model"), &m_model, "A");
    pConf->Read(_T("/WeSensorGT02A/gtype"), &m_gtype, "g");
    pConf->Read(_T("/WeSensorGT02A/stype"), &m_stype, "s");
    pConf->Read(_T("/WeSensorGT02A/lograwdata"), &m_logRawData, 1);
    pConf->Read(_T("/WeSensorGT02A/logdecoded"), &m_logDecoded, 1);
    pConf->Read(_T("/WeSensorGT02A/logclients"), &m_logClients, 1);
    pConf->Read(_T("/WeBridge/host"), &m_bridge, "tcp://127.0.0.1:2011");
    pConf->Read(_T("/WeEcho/host"), &m_echo, "tcp://127.0.0.1:2099");
    delete pConf;
    std::cout << time(NULL) << " configurations---" << std::endl
              << "           /WeSensorGT02A/tcpport = " << m_port << std::endl
              << "           /WeSensorGT02A/model = " << m_model << std::endl
              << "           /WeSensorGT02A/gtype = " << m_gtype << std::endl
              << "           /WeSensorGT02A/stype = " << m_stype << std::endl
              << "           /WeSensorGT02A/lograwdata = " << m_logRawData << std::endl
              << "           /WeSensorGT02A/logdecoded = " << m_logDecoded << std::endl
              << "           /WeSensorGT02A/logclients = " << m_logClients << std::endl
              << "           /WeBridge/host = " << m_bridge << std::endl
              << "           /WeEcho/host = " << m_echo << std::endl;
}

bool WeGT02AApp::StartService()
{
    // create a tcp server
    wxIPV4address addr;
    if (!addr.Service(m_port)) {
        // log error here
        std::cout << time(NULL) << " failed to listen " << m_port << std::endl;
        return false;
    }

    m_pServer = new wxSocketServer(addr, wxSOCKET_REUSEADDR);
    if (!m_pServer->IsOk()) {
        m_pServer->Destroy();
        // log error here
        std::cout << time(NULL) << " failed to create socket server" << std::endl;
        return false;
    }

    m_pServer->SetEventHandler(*this, WeGT02AApp::ID_SERVER);
    m_pServer->SetNotify(wxSOCKET_CONNECTION_FLAG);
    m_pServer->Notify(true);

    std::cout << time(NULL) << " tcp server starts service" << std::endl;

    // connect to WeBridge
    m_pZmqCtx = new zmq::context_t(1);
    if (!m_pZmqCtx) {
        std::cout << time(NULL)
                  << " failed to create zmq context" << std::endl;
        m_pServer->Destroy();
        return false;
    }
    m_pZmqSock = new zmq::socket_t(*m_pZmqCtx, ZMQ_PUSH);
    if (!m_pZmqSock) {
        std::cout << time(NULL)
                  << " failed to create ZMQ_PUSH socket" << std::endl;
        m_pServer->Destroy();
        return false;
    }
    m_pZmqSock->connect(m_bridge.mb_str());

    return true;
}

bool WeGT02AApp::CreateTEcho()
{
    TEcho *pThread = new TEcho();
    if (pThread->Create() == wxTHREAD_NO_ERROR) {
        if (pThread->Run() == wxTHREAD_NO_ERROR) {
            std::cout << time(NULL) << " TEcho is running now..." << std::endl;
            return true;
        } else {
            delete pThread;
            // log error here
            std::cout << time(NULL) << " failed to start TEcho" << std::endl;
            return false;
        }
    } else {
        delete pThread;
        // log error here
        std::cout << time(NULL) << " failed to create TEcho" << std::endl;
        return false;
    }

    return true;
}

void WeGT02AApp::OnServer(wxSocketEvent& event)
{
    wxSocketBase *pSock = NULL;
    pSock = m_pServer->Accept(false); // non-block method
    if (pSock) {
        pSock->SetEventHandler(*this, WeGT02AApp::ID_CLIENT);
        pSock->SetNotify(wxSOCKET_INPUT_FLAG | wxSOCKET_LOST_FLAG);
        pSock->Notify(true);
        m_lClients.push_back(pSock);
        if (m_logClients != 0) {
            wxIPV4address addr;
            pSock->GetPeer(addr);
            std::cout << time(NULL) << " accept " << addr.IPAddress()
                      << ":" << addr.Service() << ", "
                      << GetClientCount() << " clients now" << std::endl;
        }
    } else if (m_pServer->Error()) {
        // log error here
        std::cout << time(NULL) << " error on accepting new client, "
                  << GetClientCount() << " clients now" << std::endl;
    }
}

void WeGT02AApp::OnClient(wxSocketEvent& event)
{
    wxSocketBase *pSock = event.GetSocket();
    if (!pSock->IsOk()) {
        m_lClients.remove(pSock);
        if (m_logClients != 0) {
            wxIPV4address addr;
            pSock->GetPeer(addr);
            std::cout << time(NULL) << " error on " << addr.IPAddress()
                      << ":" << addr.Service() << ", "
                      << GetClientCount() << " clients now" << std::endl;
        }
        pSock->Destroy();
        return;
    }

    switch (event.GetSocketEvent()) {
    case wxSOCKET_INPUT:
        ProcessData(pSock);
        break;
    case wxSOCKET_LOST:
        m_lClients.remove(pSock);
        if (m_logClients != 0) {
            wxIPV4address addr;
            pSock->GetPeer(addr);
            std::cout << time(NULL) << " lost " << addr.IPAddress()
                      << ":" << addr.Service() << ", "
                      << GetClientCount() << " clients now" << std::endl;
        }
        pSock->Destroy();
        //std::cout << "one client lost" << std::endl;
        break;
    default:
        break;
    }
}

size_t WeGT02AApp::GetClientCount()
{
    return m_lClients.size();
}

void WeGT02AApp::ProcessData(wxSocketBase *pSock)
{
    // get data from buffer
    pSock->Read(m_buffer, SOCKET_BUFFER_SIZE);
    wxIPV4address addr;
    pSock->GetPeer(addr);
    int len = pSock->LastCount();

    if (m_logRawData != 0) {
        // log raw data of buffer
        std::cout << time(NULL) << " receive " << len << " bytes from "
                  << addr.IPAddress() << ":" << addr.Service() << ": ";
        for (int i = 0; i < len; i++) {
            printf("%02X", *(m_buffer+i));
        }
        std::cout << std::endl;
    }

    if (len <= 0 && pSock->Error()) {
        std::cout << time(NULL) << " error on reading buffer of socket "
                  << addr.IPAddress() << ":" << addr.Service() << std::endl;
        return;
    } else if (len < 16) {
        std::cout << time(NULL)
                  << " unkown data frame, " << len << " bytes"<< std::endl;
        return;
    }

    // try to decode raw data
    int fh = 0; // head of frame
    while (fh < len-18) {
        // validate frame
        int fsize = int(*(m_buffer+fh+2)) + 5;
        if (fh + fsize > len
                || *(m_buffer+fh) != 0x68 || *(m_buffer+fh+1) != 0x68
                || *(m_buffer+fh+fsize-2) != 0x0d || *(m_buffer+fh+fsize-1) != 0x0a ) {
            fh += 1;
            continue;
        }
        // check frame type
        if (*(m_buffer+fh+15) == 0x10) {
            // decode pvt data
            DecodePVT(m_buffer+fh, fsize);
            PushData(true);
        } else if (*(m_buffer+fh+15) == 0x1a) {
            // heartbeat, send feed back
            pSock->Write(m_hb, sizeof(m_hb));
            if (pSock->LastCount() < 1 && pSock->Error()) {
                std::cout << time(NULL)
                          << " error on sending heartbeat feedback to "
                          << addr.IPAddress() << ":" << addr.Service() << std::endl;
            } else if (m_logRawData) {
                std::cout << time(NULL)
                          << " send 5 bytes to " << addr.IPAddress() << ":" << addr.Service()
                          << ": 54681A0D0A" << std::endl;
            }

            // then decode pgg data
            DecodePGG(m_buffer+fh, fsize);
            PushData(false);
        } else {
            std::cout << time(NULL)
                      << " unkown frame type, " << fsize << " bytes"<< std::endl;
        }
        // try next frame
        fh += fsize;
    }
}

void WeGT02AApp::DecodePVT(const unsigned char *buf, int len)
{
    // terminal id
    sprintf(m_pvt.imei, "%x", buf[5]);
    for (int i=6; i<=12; i++) {
        sprintf((m_pvt.imei)+2*(i-5)-1, "%02x", buf[i]);
    }
    m_pvt.imei[15] = 0x00;
    // serail number of data frame
    memcpy(&m_pvt.fsn, buf+13, 2);
    m_pvt.fsn = ntohs(m_pvt.fsn); // network > host
    // time
    unsigned short yr, mo, dy, hr, mi, se;
    yr = buf[16] + 2000;
    mo = buf[17] % 13;
    dy = buf[18] % 32;
    hr = buf[19] % 24;
    mi = buf[20] % 60;
    se = buf[21] % 60;
    unsigned short nod = wxDateTime::GetNumberOfDays(wxDateTime::Month(mo-1), yr);
    if (dy > nod) dy = nod;
    wxDateTime dt(dy, wxDateTime::Month(mo - 1), yr, hr, mi, se);
    m_pvt.t = (unsigned int)(dt.GetTicks());
    // latitude
    unsigned int ll; // in 1/500 seconds
    memcpy(&ll, buf+22, 4);
    ll = ntohl(ll); // network > host
    m_pvt.lat = double(ll)/1800000; // double(ll)/500.0/3600.0;
    // longitude
    memcpy(&ll, buf+26, 4);
    ll = ntohl(ll); // network > host
    m_pvt.lon = double(ll)/1800000;
    // velocity 0-255
    m_pvt.v = buf[30];
    // course of vehicle 0-359
    memcpy(&m_pvt.c, buf+31, 2);
    m_pvt.c = ntohs(m_pvt.c) % 360; // network > host
    // skip reserved 3 bytes
    // status of this frame
    memcpy(&ll, buf+36, 4);
    ll = ntohl(ll); // network > host
    m_pvt.stgps = ll & 0x00000001;
    m_pvt.lat   = ll & 0x00000002 ? +m_pvt.lat : -m_pvt.lat;
    m_pvt.lon   = ll & 0x00000004 ? +m_pvt.lon : -m_pvt.lon;
    m_pvt.stpow = ll & 0x00000008;
    m_pvt.stsos = ll & 0x00000010;
    m_pvt.strun = ll & 0x00000020;
    // done
    m_pvt.valid = true;
    if (m_logDecoded) {
        std::cout.precision(16);
        std::cout << time(NULL) << " pvt---" << std::endl
                  << "           model: " << char(m_pvt.model) << std::endl
                  << "           dtype: " << char(m_pvt.dtype) << std::endl
                  << "            imei: " << m_pvt.imei << std::endl
                  << "             fsn: " << m_pvt.fsn << std::endl
                  << "               t: " << m_pvt.t << std::endl
                  << "             lat: " << m_pvt.lat << std::endl
                  << "             lon: " << m_pvt.lon << std::endl
                  << "               c: " << m_pvt.c << std::endl
                  << "               v: " << (unsigned int)(m_pvt.v) << std::endl
                  << "           stgps: " << (unsigned int)(m_pvt.stgps) << std::endl
                  << "           stpow: " << (unsigned int)(m_pvt.stpow) << std::endl
                  << "           stsos: " << (unsigned int)(m_pvt.stsos) << std::endl
                  << "           strun: " << (unsigned int)(m_pvt.strun) << std::endl;
    }
}

void WeGT02AApp::DecodePGG(const unsigned char *buf, int len)
{
    // terminal id
    sprintf(m_pgg.imei, "%x", buf[5]);
    for (int i=6; i<=12; i++) {
        sprintf((m_pgg.imei)+2*(i-5)-1, "%02x", buf[i]);
    }
    m_pgg.imei[15] = 0x00;
    // serail number of data frame
    memcpy(&m_pgg.fsn, buf+13, 2);
    m_pgg.fsn = ntohs(m_pgg.fsn); // network > host
    // time of this data
    time_t tNow = time(NULL);
    m_pgg.t = (unsigned int)tNow;
    // status of power 0-6
    m_pgg.stpow = buf[3] % 7;
    // status of gsm sigal 0-4
    m_pgg.stgsm = buf[4] % 5;
    // status of gps 0-2
    m_pgg.stgps = buf[16] % 3;
    // number of gps satellite 0-12
    m_pgg.nsate = buf[17] % 13;
    // done
    m_pgg.valid = true;
    if (m_logDecoded) {
        std::cout << time(NULL) << " pgg---" << std::endl
                  << "           model: " << char(m_pgg.model) << std::endl
                  << "           dtype: " << char(m_pgg.dtype) << std::endl
                  << "            imei: " << m_pgg.imei << std::endl
                  << "             fsn: " << m_pgg.fsn << std::endl
                  << "               t: " << m_pgg.t << std::endl
                  << "           stpow: " << (unsigned int)(m_pgg.stpow) << std::endl
                  << "           stgsm: " << (unsigned int)(m_pgg.stgsm) << std::endl
                  << "           stgps: " << (unsigned int)(m_pgg.stgps) << std::endl
                  << "           nsate: " << (unsigned int)(m_pgg.nsate) << std::endl;
    }
}

void WeGT02AApp::PushData(bool bPVT)
{
    if (bPVT) {
        // push pvt data
        zmq::message_t msg(sizeof(gt02apvt_t));
        memcpy(msg.data(), &m_pvt, sizeof(gt02apvt_t));
        if ( !m_pZmqSock->send(msg)) {
            std::cout << time(NULL)
                      << " failed to push pvt message"<< std::endl;
        }
    } else {
        // push pgg data
        zmq::message_t msg(sizeof(gt02apgg_t));
        memcpy(msg.data(), &m_pgg, sizeof(gt02apgg_t));
        if ( !m_pZmqSock->send(msg) ) {
            std::cout << time(NULL)
                      << " failed to push pgg message"<< std::endl;
        }
    }
}

