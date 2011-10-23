/***************************************************************
 * Name:      SoftGT02AApp.h
 * Purpose:   Defines Application Class
 * Author:    YANTAO TIAN (yantaotian@gmail.com)
 * Created:   2011-06-21
 * Copyright: YANTAO TIAN (www.weiran.biz)
 * License:
 **************************************************************/

#ifndef SOFTGT02AAPP_H
#define SOFTGT02AAPP_H

#include <wx/app.h>
#include <wx/socket.h>
#include <wx/timer.h>

class SoftGT02AApp : public wxAppConsole
{
public:
    virtual bool OnInit();

public:
    wxString m_host;
    int m_port;
    int m_interval;
    int m_reconnect;

private:
    void LoadConfigurations(const wxString& file);
    void SetBuffer();
    bool CreateClient();
    void OnClient(wxSocketEvent& event);
    void OnTimer(wxTimerEvent& event);
    void OnTimerReconnect(wxTimerEvent& event);

private:
    enum {
        ID_CLIENT = wxID_HIGHEST + 1,
        ID_TIMER,
        ID_TIMER_RECONNECT
    };
    wxSocketClient *m_pClient;
    wxTimer m_timer;
    wxTimer m_timerReconnect;
    unsigned short m_countPVT;
    unsigned short m_countPGG;
    char m_buffer[4096];
    char m_pvt[42];
    char m_pgg[24];
};

#endif // SOFTGT02AAPP_H
