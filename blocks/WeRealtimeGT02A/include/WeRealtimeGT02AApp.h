/***************************************************************
 * Name:      WeRealtimeGT02AApp.h
 * Purpose:   Defines Application Class
 * Author:    YANTAO TIAN (yantaotian@foxmail.com)
 * Created:   2011-06-23
 * Copyright: YANTAO TIAN (www.weiran.biz)
 * License:
 **************************************************************/

#ifndef WEREALTIMEGT02AAPP_H
#define WEREALTIMEGT02AAPP_H

#include <wx/app.h>

class WeRealtimeGT02AApp : public wxAppConsole
{
public:
    virtual bool OnInit();
    virtual int OnExit();

public:
    // configurations
    wxString m_realtime;
    wxString m_bridge;
    wxString m_echo;
    wxString m_pvtMask;
    wxString m_pggMask;
    long m_logJSON;

private:
    void LoadConfigurations(const wxString& file);
    bool CreateTEcho();
    bool CreateTTranslate();

private:
};

wxDECLARE_APP(WeRealtimeGT02AApp);

#endif // WEREALTIMEGT02AAPP_H
