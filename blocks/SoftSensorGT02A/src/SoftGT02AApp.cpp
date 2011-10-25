/***************************************************************
 * Name:      SoftGT02AApp.cpp
 * Purpose:   Code for Application Class
 * Author:    YANTAO TIAN (yantaotian@gmail.com)
 * Created:   2011-06-21
 * Copyright: YANTAO TIAN (www.weiran.biz)
 * License:
 **************************************************************/

#ifdef WX_PRECOMP
#include "wx_pch.h"
#endif

#ifdef __BORLANDC__
#pragma hdrstop
#endif //__BORLANDC__

#include "../include/SoftGT02AApp.h"
#include <iostream>
#include <wx/fileconf.h>
#include <wx/stdpaths.h>

IMPLEMENT_APP(SoftGT02AApp);

bool SoftGT02AApp::OnInit()
{
    std::cout << time(NULL) << " SoftSensorGT02A starts" << std::endl;

    wxString sfile;
    sfile = "/usr/local/etc/SoftSensorGT02A.conf";
    LoadConfigurations(sfile);

    SetBuffer();
    m_pClient = NULL;
    m_countPVT = 1;
    m_countPGG = 1;
    m_timer.SetOwner(this, SoftGT02AApp::ID_TIMER);
    m_timerReconnect.SetOwner(this, SoftGT02AApp::ID_TIMER_RECONNECT);

    Bind(wxEVT_TIMER, &SoftGT02AApp::OnTimer, this, SoftGT02AApp::ID_TIMER);
    Bind(wxEVT_TIMER, &SoftGT02AApp::OnTimerReconnect, this, SoftGT02AApp::ID_TIMER_RECONNECT);
    Bind(wxEVT_SOCKET, &SoftGT02AApp::OnClient, this, SoftGT02AApp::ID_CLIENT);

    if (!CreateClient()) return false;

    m_timer.Start(m_interval);

    return true;
}

void SoftGT02AApp::LoadConfigurations(const wxString& file)
{
    wxFileConfig *pConf;
    pConf = new wxFileConfig("", "", file, "", wxCONFIG_USE_LOCAL_FILE);
    pConf->Read(_T("/SoftSensorGT02A/interval"), &m_interval, 5000);
    pConf->Read(_T("/SoftSensorGT02A/reconnect"), &m_reconnect, 5000);
    pConf->Read(_T("/Server/host"), &m_host, "127.0.0.1");
    pConf->Read(_T("/Server/port"), &m_port, 2013);
    delete pConf;
    std::cout << time(NULL) << " configurations---" << std::endl
        << "           /SoftSensorGT02A/interval = " << m_interval << std::endl
        << "           /SoftSensorGT02A/reconnect = " << m_reconnect << std::endl
        << "           /Server/host = " << m_host << std::endl
        << "           /Server/port = " << m_port << std::endl;
}

void SoftGT02AApp::SetBuffer()
{
    m_pvt[0] = 0x68; m_pvt[1] = 0x68; m_pvt[2] = 0x25; m_pvt[3] = 0; m_pvt[4] = 0;
    m_pvt[5] = 0x03; m_pvt[6] = 0x53; m_pvt[7] = 0x41; m_pvt[8] = 0x90;
    m_pvt[9] = 0x36; m_pvt[10] = 0x59; m_pvt[11] = 0x23; m_pvt[12] = 0x22;
    unsigned short sn = 12345; memcpy(m_pvt+13, &sn, 2);
    m_pvt[15] = 0x10; m_pvt[16] = 11; m_pvt[17] = 6; m_pvt[18] = 21;
    m_pvt[19] = 21; m_pvt[20] = 15; m_pvt[21] = 56;
    unsigned int xx = (30.12345678*60*30000); memcpy(m_pvt+22, &xx, 4);
    xx = (120.12345678*60*30000); memcpy(m_pvt+26, &xx, 4);
    m_pvt[30] = 110; sn = 90; memcpy(m_pvt+31, &sn, 2);
    m_pvt[33] = 0; m_pvt[34] = 0; m_pvt[35] = 0; xx = 15; memcpy(m_pvt+36, &xx, 4);
    m_pvt[40] = 0x0d; m_pvt[41] = 0x0a;

    m_pgg[0] = 0x68; m_pgg[1] = 0x68; m_pgg[2] = 19; m_pgg[3] = 0x06; m_pgg[4] = 0x04;
    m_pgg[5] = 0x03; m_pgg[6] = 0x53; m_pgg[7] = 0x41; m_pgg[8] = 0x90;
    m_pgg[9] = 0x36; m_pgg[10] = 0x59; m_pgg[11] = 0x23; m_pgg[12] = 0x22;
    sn = 12345; memcpy(m_pgg+13, &sn, 2);
    m_pgg[15] = 0x1a; m_pgg[16] = 0x01; m_pgg[17] = 4;
    m_pgg[18] = 90; m_pgg[19] = 90; m_pgg[20] = 90; m_pgg[21] = 90;
    m_pgg[22] = 0x0d; m_pgg[23] = 0x0a;
}

bool SoftGT02AApp::CreateClient()
{
    bool status = false;
    wxIPV4address addr;
    addr.Hostname(m_host);
    addr.Service(m_port);
    m_pClient = new wxSocketClient();
    m_pClient->SetEventHandler(*this, SoftGT02AApp::ID_CLIENT);
    m_pClient->SetNotify(wxSOCKET_INPUT_FLAG | wxSOCKET_LOST_FLAG);
    m_pClient->Notify(true);
    if (m_pClient->Connect(addr)) {
        status = true;
        m_countPGG = 1;
        m_countPVT = 1;
        std::cout << time(NULL) << " Connected to server" << std::endl;
    } else {
        m_pClient->Destroy();
        m_pClient = NULL;
        std::cout << time(NULL) << " Failed to connect server" << std::endl;
    }
    return status;
}

void SoftGT02AApp::OnTimer(wxTimerEvent& event)
{
    if (m_pClient != NULL && m_pClient->IsOk()) {
        memcpy(m_pvt+13, &m_countPVT, 2);
        // datetime
        wxDateTime dt = wxDateTime::Now();
        m_pvt[16] = dt.GetYear() - 2000; m_pvt[17] = dt.GetMonth() + 1;
        m_pvt[18] = dt.GetDay(); m_pvt[19] = dt.GetHour();
        m_pvt[20] = dt.GetMinute(); m_pvt[21] = dt.GetSecond();
        // lonlat
        srand(dt.GetTicks());
        int num = rand();
        unsigned int xx;
        xx = ((30.0+(num%1000000)/1000000.0)*60.0*30000.0);
        memcpy(m_pvt+22, &xx, 4);
        xx = ((120.0+(num%1000000)/1000000.0)*60.0*30000.0);
        memcpy(m_pvt+26, &xx, 4);
        m_pvt[30] = num % 256;
        unsigned short sn = num % 360;
        memcpy(m_pvt+31, &sn, 2);

        m_pClient->Write(m_pvt, sizeof(m_pvt));
        if (m_pClient->LastCount() > 0) {
            m_countPVT++;
            //std::cout << time(NULL) << " pvt" << std::endl;
            std::cout << time(NULL) << " Send " << m_pClient->LastCount() << " bytes: ";
            for (unsigned int i=0; i<m_pClient->LastCount(); i++) {
                printf("%02X", (unsigned char)(m_pvt[i]));
            }
            std::cout << std::endl;
        }
        if (m_countPVT%18 == 2) {
            memcpy(m_pgg+13, &m_countPGG, 2);
            //sleep(1);
            m_pgg[3] = num % 7;
            m_pgg[4] = num % 5;
            m_pgg[17] = num % 13;
            m_pClient->Write(m_pgg, sizeof(m_pgg));
            if (m_pClient->LastCount() > 0) {
                m_countPGG++;
                //std::cout << time(NULL) << " pgg" << std::endl;
                std::cout << time(NULL) << " Send " << m_pClient->LastCount() << " bytes: ";
                for (unsigned int i=0; i<m_pClient->LastCount(); i++) {
                    printf("%02X", (unsigned char)(m_pgg[i]));
                }
                std::cout << std::endl;
            }
        }
        if (m_countPGG == 65535) m_countPGG = 1;
        if (m_countPVT == 65535) m_countPVT = 1;
    }
}

void SoftGT02AApp::OnTimerReconnect(wxTimerEvent& event)
{
    if (m_pClient == NULL && CreateClient()) {
        m_timerReconnect.Stop();
    }
}

void SoftGT02AApp::OnClient(wxSocketEvent& event)
{
    wxSocketBase *pSock = event.GetSocket();
    if (!pSock->IsOk()) {
        pSock->Destroy();
        return;
    }

    switch (event.GetSocketEvent()) {
    case wxSOCKET_INPUT:
        pSock->Read(m_buffer,4096);
        std::cout << time(NULL) << " Receive " << pSock->LastCount() << " bytes: ";
        for (unsigned int i=0; i<pSock->LastCount(); i++) {
            printf("%02X", (unsigned char)(m_buffer[i]));
        }
        std::cout << std::endl;
        break;
    case wxSOCKET_LOST:
        pSock->Destroy();
        m_pClient = NULL;
        std::cout << time(NULL) << " Lost server, try to reconnect..." << std::endl;
        m_timerReconnect.Start(m_reconnect);
        break;
    default:
        break;
    }
}
