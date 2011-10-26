/***************************************************************
 * Name:      WeBridgeApp.h
 * Purpose:   Defines Application Class
 * Author:    YANTAO TIAN (yantaotian@gmail.com)
 * Created:   2011-06-10
 * Copyright: YANTAO TIAN (www.weiran.biz)
 * License:
 **************************************************************/

#ifndef WEBRIDGEAPP_H
#define WEBRIDGEAPP_H

#include <wx/app.h>

class WeBridgeApp : public wxAppConsole
{
public:
    enum {
        ID_TPULLPUB_START = wxID_HIGHEST + 1,
        ID_TPULLPUB_END
    };
    wxString m_strHostPull;
    wxString m_strHostPubb;

public:
    virtual bool OnInit();
    virtual int OnExit();

private:
    void Initialize();
    bool CreateTBridge();

private:

};

wxDECLARE_APP(WeBridgeApp);

#endif // WEBRIDGEAPP_H
