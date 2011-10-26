#include "../include/TBridge.h"
#include "../include/WeBridgeApp.h"
#include <zmq.hpp>
#include <iostream>

TBridge::TBridge()
{
}

TBridge::~TBridge()
{
}

wxThread::ExitCode TBridge::Entry()
{
    zmq::context_t ctx(1);
    if (!ctx) {
        std::cout << time(NULL)
            << " failed to create zmq context" << std::endl;
        exit(EXIT_FAILURE);
    }
    zmq::socket_t sockPull(ctx, ZMQ_PULL);
    if (!sockPull) {
        std::cout << time(NULL)
            << " failed to create ZMQ_PULL socket" << std::endl;
        exit(EXIT_FAILURE);
    }
    zmq::socket_t sockPub(ctx, ZMQ_PUB);
    if (!sockPub) {
        std::cout << time(NULL)
            << " failed to create ZMQ_PUB socket" << std::endl;
        exit(EXIT_FAILURE);
    }
    sockPull.bind(wxGetApp().m_strHostPull.mb_str());
    sockPub.bind(wxGetApp().m_strHostPubb.mb_str());

    while (true) {
        while (true) {
            zmq::message_t msg;
            int64_t more;
            size_t more_size = sizeof (more);

            // Process all parts of the message
            sockPull.recv(&msg);
            sockPull.getsockopt(ZMQ_RCVMORE, &more, &more_size);
            sockPub.send(msg, more? ZMQ_SNDMORE: 0);
            if (!more) {
                break; //  Last message part
            }
        }
    }

    return (wxThread::ExitCode)0;
}
