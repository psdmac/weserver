/***************************************************************
 * Name:      WeRealtimeGT02AApp.cpp
 * Purpose:   Code for Application Class
 * Author:    YANTAO TIAN (yantaotian@foxmail.com)
 * Created:   2011-06-23
 * Copyright: YANTAO TIAN (www.weiran.biz)
 * License:
 **************************************************************/

#ifdef WX_PRECOMP
#include "wx_pch.h"
#endif

#ifdef __BORLANDC__
#pragma hdrstop
#endif //__BORLANDC__

#include "../include/WeRealtimeGT02AApp.h"
#include "../include/TEcho.h"
#include "../include/TTranslate.h"
#include <iostream>
#include <wx/fileconf.h>
#include <wx/stdpaths.h>

IMPLEMENT_APP(WeRealtimeGT02AApp);

bool WeRealtimeGT02AApp::OnInit()
{
    std::cout << time(NULL) << " WeRealtimeGT02A starts" << std::endl;

    wxString sfile;
    sfile = "/usr/local/etc/WeRealtimeGT02A.conf";
    LoadConfigurations(sfile);

    if (!CreateTEcho()) return false;
    if (!CreateTTranslate()) return false;

    return true;
}

int WeRealtimeGT02AApp::OnExit()
{
    return 0;
}

void WeRealtimeGT02AApp::LoadConfigurations(const wxString& file)
{
    wxFileConfig *pConf;
    pConf = new wxFileConfig("", "", file, "", wxCONFIG_USE_LOCAL_FILE);
    pConf->Read(_T("/WeRealtimeGT02A/pvttmask"), &m_pvtMask, "Ag");
    pConf->Read(_T("/WeRealtimeGT02A/pggtmask"), &m_pggMask, "As");
    pConf->Read(_T("/WeRealtimeGT02A/pushout"), &m_realtime, "tcp://*:2014");
    pConf->Read(_T("/WeRealtimeGT02A/logjson"), &m_logJSON, 1);
    pConf->Read(_T("/WeBridge/host"), &m_bridge, "tcp://127.0.0.1:2012");
    pConf->Read(_T("/WeEcho/host"), &m_echo, "tcp://127.0.0.1:2099");
    delete pConf;
    std::cout << time(NULL) << " configurations---" << std::endl
        << "           /WeRealtimeGT02A/pvttmask = " << m_pvtMask << std::endl
        << "           /WeRealtimeGT02A/pggtmask = " << m_pggMask << std::endl
        << "           /WeRealtimeGT02A/pushout = " << m_realtime << std::endl
        << "           /WeRealtimeGT02A/logjson = " << m_logJSON << std::endl
        << "           /WeBridge/host = " << m_bridge << std::endl
        << "           /WeEcho/host = " << m_echo << std::endl;
}

bool WeRealtimeGT02AApp::CreateTEcho()
{
    TEcho *pThread = new TEcho();
    if (pThread->Create() == wxTHREAD_NO_ERROR) {
        if (pThread->Run() == wxTHREAD_NO_ERROR) {
            std::cout << time(NULL) << " TEcho is running now" << std::endl;
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

bool WeRealtimeGT02AApp::CreateTTranslate()
{
    TTranslate *pThread = new TTranslate();
    if (pThread->Create() == wxTHREAD_NO_ERROR) {
        if (pThread->Run() == wxTHREAD_NO_ERROR) {
            std::cout << time(NULL) << " TTranslate is running now" << std::endl;
            return true;
        } else {
            delete pThread;
            // log error here
            std::cout << time(NULL) << " failed to start TTranslate" << std::endl;
            return false;
        }
    } else {
        delete pThread;
        // log error here
        std::cout << time(NULL) << " failed to create TTranslate" << std::endl;
        return false;
    }

    return true;
}
