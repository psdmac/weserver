#ifndef TBRIDGE_H
#define TBRIDGE_H

#include <wx/thread.h>


class TBridge : public wxThread
{
public:
    TBridge();
    virtual ~TBridge();

protected:
    virtual ExitCode Entry();

private:
};

#endif // TBRIDGE_H
