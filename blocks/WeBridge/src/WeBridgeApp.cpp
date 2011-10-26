/***************************************************************
 * Name:      WeBridgeApp.cpp
 * Purpose:   Code for Application Class
 * Author:    YANTAO TIAN (yantaotian@gmail.com)
 * Created:   2011-06-10
 * Copyright: YANTAO TIAN (www.weiran.biz)
 * License:
 **************************************************************/

#ifdef WX_PRECOMP
#include "wx_pch.h"
#endif

#ifdef __BORLANDC__
#pragma hdrstop
#endif //__BORLANDC__

#include <iostream>
#include <wx/stdpaths.h>
#include <wx/fileconf.h>
#include "../include/TBridge.h"
#include "../include/WeBridgeApp.h"

IMPLEMENT_APP(WeBridgeApp);

bool WeBridgeApp::OnInit()
{
    std::cout << time(NULL) << " WeBridge starts" << std::endl;

    Initialize();

    if (!CreateTBridge()) return false;

    return true;
}

int WeBridgeApp::OnExit()
{
    return 0;
}

void WeBridgeApp::Initialize()
{
    wxFileConfig *pConf;
    pConf = new wxFileConfig("",
                             "",
                             "/usr/local/etc/WeBridge.conf",
                             "",
                             wxCONFIG_USE_LOCAL_FILE); // initializes
    pConf->Read(_T("/WeBridge/pullin"),&m_strHostPull,_T("tcp://*:2011"));
    pConf->Read(_T("/WeBridge/pubout"),&m_strHostPubb,_T("tcp://*:2012"));
    //pConf->Read(_T("/LOG/output_log_interval_in_seconds"),&m_intervalOut,10);
    delete pConf;

    std::cout << time(NULL) << " configurations---" << std::endl
              << "           /WeBridge/pullin = " << m_strHostPull << std::endl
              << "           /WeBridge/pubout = " << m_strHostPubb << std::endl;
}

bool WeBridgeApp::CreateTBridge()
{
    TBridge *pThread = new TBridge();
    if (pThread->Create() == wxTHREAD_NO_ERROR) {
        if (pThread->Run() == wxTHREAD_NO_ERROR) {
            std::cout << time(NULL) << " TBridge is running now" << std::endl;
            return true;
        } else {
            delete pThread;
            std::cout << time(NULL) << " failed to start TBridge" << std::endl;
            return false;
        }
    } else {
        delete pThread;
        std::cout << time(NULL) << " failed to create TBridge" << std::endl;
        return false;
    }

    return true;
}
