/***************************************************************
 * Name:      WeGT02AApp.h
 * Purpose:   Defines Application Class
 * Author:    YANTAO TIAN (yantaotian@gmail.com)
 * Created:   2011-06-14
 * Copyright: YANTAO TIAN (www.weiran.biz)
 * License:
 **************************************************************/

#ifndef WEGT02AAPP_H
#define WEGT02AAPP_H

#include <wx/app.h>
#include <wx/socket.h>
#include <list>
#include <zmq.hpp>
#include "../../common/wedata.h"

class WeGT02AApp : public wxAppConsole
{
public:
    virtual bool OnInit();
    virtual int OnExit();
    size_t GetClientCount();

public:
    // event ids
    enum {
        ID_SERVER = wxID_HIGHEST + 1,
        ID_CLIENT
    };
    // configurations
    long m_port;
    wxString m_bridge;
    wxString m_echo;
    wxString m_model;
    wxString m_gtype;
    wxString m_stype;

private:
    void LoadConfigurations(const wxString& file);
    bool StartService();
    bool CreateTEcho();
    void OnServer(wxSocketEvent& event);
    void OnClient(wxSocketEvent& event);
    void ProcessData(wxSocketBase *pSock);
    void DecodePVT(const char *buf, int len);
    void DecodePGG(const char *buf, int len);
    void PushData(bool bPVT = true);

private:
    wxSocketServer *m_pServer;
    std::list<wxSocketBase*> m_lClients;
    char m_buffer[SOCKET_BUFFER_SIZE];
    char m_hb[5]; // heartbeat feedback
    gt02apvt_t m_pvt;
    gt02apgg_t m_pgg;
    zmq::context_t *m_pZmqCtx;
    zmq::socket_t *m_pZmqSock;
};

wxDECLARE_APP(WeGT02AApp);

#endif // WEGT02AAPP_H
