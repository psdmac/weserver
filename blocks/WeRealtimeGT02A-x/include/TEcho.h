#ifndef TECHO_H
#define TECHO_H

#include <wx/thread.h>

class TEcho : public wxThread
{
public:
    TEcho();
    virtual ~TEcho();

protected:
    virtual ExitCode Entry();

private:
};

#endif // TECHO_H
