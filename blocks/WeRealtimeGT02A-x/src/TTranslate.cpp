#include "../include/TTranslate.h"
#include "../include/WeRealtimeGT02AApp.h"
#include <iostream>
#include <json.h>

TTranslate::TTranslate()
{
    m_pZmqCtx = NULL;
    m_pSockPush = NULL;
    m_pSockSubb = NULL;
}

TTranslate::~TTranslate()
{
}

wxThread::ExitCode TTranslate::Entry()
{
    if (!Initialize()) exit(EXIT_FAILURE);

    while (true) {
        zmq::message_t msgsub;
        if (!m_pSockSubb->recv(&msgsub)) {
            std::cout << time(NULL)
                      << " failed to subscribe message" << std::endl;
            continue;
        }
        // make raw data to json string
        int len = msgsub.size();
        if (len == sizeof(gt02apvt_t)) { // pvt data
            gt02apvt_t pvt;
            memcpy(&pvt, msgsub.data(), len);
            PushJSON(Translate(pvt));
        } else if (len == sizeof(gt02apgg_t)) { // pgg data
            gt02apgg_t pgg;
            memcpy(&pgg, msgsub.data(), len);
            PushJSON(Translate(pgg));
        } else {
            std::cout << time(NULL)
                      << " wrong message size: " << len << std::endl;
            continue;
        }
    }

    return (wxThread::ExitCode)0;
}

bool TTranslate::Initialize()
{
    m_pZmqCtx = new zmq::context_t(1);
    if (m_pZmqCtx == NULL) {
        std::cout << time(NULL)
                  << " failed to create zmq context" << std::endl;
        return false;
    }

    m_pSockSubb = new zmq::socket_t(*m_pZmqCtx, ZMQ_SUB);
    if (m_pSockSubb == NULL) {
        std::cout << time(NULL)
                  << " failed to create ZMQ_SUB socket" << std::endl;
        delete m_pZmqCtx;
        return false;
    }
    m_pSockSubb->connect(wxGetApp().m_bridge.mb_str());
    m_pSockSubb->setsockopt(ZMQ_SUBSCRIBE,
                            wxGetApp().m_pvtMask.mb_str(),
                            wxGetApp().m_pvtMask.Len()); // pvt data
    m_pSockSubb->setsockopt(ZMQ_SUBSCRIBE,
                            wxGetApp().m_pggMask.mb_str(),
                            wxGetApp().m_pggMask.Len()); // pgg data

    m_pSockPush = new zmq::socket_t(*m_pZmqCtx, ZMQ_PUSH);
    if (m_pSockPush == NULL) {
        std::cout << time(NULL)
                  << " failed to create ZMQ_PUSH socket" << std::endl;
        delete m_pSockSubb;
        delete m_pZmqCtx;
        return false;
    }
    m_pSockPush->bind(wxGetApp().m_realtime.mb_str());

    return true;
}

wxString TTranslate::Translate(const gt02apvt_t& pvt)
{
    char tt[2], dt[2];
    tt[0] = pvt.model;
    tt[1] = 0;
    dt[0] = pvt.dtype;
    dt[1] = 0;
    Json::Value root;
    root["model"] = tt;
    root["dtype"] = dt;
    root["imei"]  = pvt.imei;
    root["fsn"]   = Json::UInt(pvt.fsn);
    root["t"]     = Json::UInt(pvt.t);
    root["lat"]   = pvt.lat;
    root["lon"]   = pvt.lon;
    root["c"]     = Json::UInt(pvt.c);
    root["v"]     = Json::UInt(pvt.v);
    root["stgps"] = Json::UInt(pvt.stgps);
    root["stpow"] = Json::UInt(pvt.stpow);
    root["stsos"] = Json::UInt(pvt.stsos);
    root["strun"] = Json::UInt(pvt.strun);

    Json::FastWriter writer;
    wxString str = writer.write(root);
    return str.Trim();
}

wxString TTranslate::Translate(const gt02apgg_t& pgg)
{
    char tt[2], dt[2];
    tt[0] = pgg.model;
    tt[1] = 0;
    dt[0] = pgg.dtype;
    dt[1] = 0;
    Json::Value root;
    root["model"] = tt;
    root["dtype"] = dt;
    root["imei"]  = pgg.imei;
    root["fsn"]   = Json::UInt(pgg.fsn);
    root["t"]     = Json::UInt(pgg.t);
    root["stpow"] = Json::UInt(pgg.stpow);
    root["stgsm"] = Json::UInt(pgg.stgsm);
    root["stgps"] = Json::UInt(pgg.stgps);
    root["nsate"] = Json::UInt(pgg.nsate);

    Json::FastWriter writer;
    wxString str = writer.write(root);
    return str.Trim();
}

void TTranslate::PushJSON(const wxString& strJSON)
{
    size_t len = strJSON.size();
    zmq::message_t msg(len);
    memcpy(msg.data(), strJSON.c_str(), len);
    if ( 0/*!m_pSockPush->send(msg)*/ ) {
        std::cout << time(NULL)
                  << " failed to push message" << std::endl;
    } else if (wxGetApp().m_logJSON != 0) {
        std::cout << time(NULL) << " push " << strJSON << std::endl;
    }
}
