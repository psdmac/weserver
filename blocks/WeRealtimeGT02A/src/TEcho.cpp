#include "../include/TEcho.h"
#include "../include/WeRealtimeGT02AApp.h"
#include <zmq.hpp>
#include <iostream>

TEcho::TEcho()
{
}

TEcho::~TEcho()
{
}

wxThread::ExitCode TEcho::Entry()
{
    zmq::context_t ctx(1);
    if (!ctx) {
        std::cout << time(NULL)
                  << " failed to create zmq context" << std::endl;
        exit(EXIT_FAILURE);
    }
    zmq::socket_t sockrep(ctx, ZMQ_REP);
    if (!sockrep) {
        std::cout << time(NULL)
                  << " failed to create ZMQ_REP socket" << std::endl;
        exit(EXIT_FAILURE);
    }
    sockrep.connect(wxGetApp().m_echo.mb_str());

    while (true) {
        zmq::message_t msgreq;
        if (!sockrep.recv(&msgreq)) {
            std::cout << time(NULL)
                      << " failed to receive echo request message" << std::endl;
            continue;
        }
        // echo to server with running info
        wxString str;
        str << "WeRealtimeGT02A: OK";
        zmq::message_t msgrep(str.Len()+1);
        memcpy(msgrep.data(), str.mb_str(), str.Len()+1);
        if (!sockrep.send(msgrep)) {
            std::cout << time(NULL)
                      << " failed to send echo reply message" << std::endl;
            continue;
        }
    }

    return (wxThread::ExitCode)0;
}
