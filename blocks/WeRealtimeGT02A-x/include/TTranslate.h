#ifndef TTRANSLATE_H
#define TTRANSLATE_H

#include <wx/thread.h>
#include <zmq.hpp>
#include "GT02A.h"

class TTranslate : public wxThread
{
public:
    TTranslate();
    virtual ~TTranslate();

protected:
    virtual ExitCode Entry();

private:
    bool Initialize();
    wxString Translate(const gt02apvt_t& pvt);
    wxString Translate(const gt02apgg_t& pgg);
    void PushJSON(const wxString& strJSON);

private:
    zmq::context_t *m_pZmqCtx;
    zmq::socket_t *m_pSockSubb;
    zmq::socket_t *m_pSockPush;
    gt02apvt_t m_pvt;
    gt02apgg_t m_pgg;
};

#endif // TTRANSLATE_H
