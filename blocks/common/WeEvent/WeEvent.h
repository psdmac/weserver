/***************************************************************
 * Name:      WeEvent.h
 * Purpose:   Defines Custom Event Class
 * Author:    YANTAO TIAN (yantaotian@gmail.com)
 * Created:   2011-06-06
 * Copyright: YANTAO TIAN
 * License:   wxWidgets
 **************************************************************/

#ifndef WEEVENT_H
#define WEEVENT_H

#include <wx/event.h>

// declare an event type of the event class
class WeEvent;
wxDECLARE_EVENT(wxEVT_WE, WeEvent);
// usage:
// step 1, define event id and handler within an event hanlder class, eg:
//         int ID_WE = wxID_HIGHEST + 1;
//         void OnWe(WeEvent& evt);
// step 2, bind within the event hanlder class, eg:
//         Bind(wxEVT_WE, &WeEventApp::OnWe, this, ID_WE);
//         if using event table, the under 3 lines should be uncommented, so:
//         EVT_WE(ID_WE, WeEventApp::OnWeEvent)
// step 3, fire an event within a thread, eg:
//         WeEvent evt(wxID_ANY);
//         evt.SetLong(1234);
//         evt.SetString(_T("ABCD"));
//         wxTheApp->QueueEvent(evt.Clone());
//typedef void (wxEvtHandler::*WeEventFunction)(WeEvent&);
//#define WeEventHandler(func) wxEVENT_HANDLER_CAST(WeEventFunction, func)
//#define EVT_WE(id, func) wx__DECLARE_EVT1(wxEVT_WE, id, WeEventHandler(func))

// event class defination
class WeEvent : public wxEvent
{
public:
    WeEvent(int id = wxID_ANY, wxEventType type = wxEVT_WE);
    WeEvent(const WeEvent& event);
    virtual wxEvent *Clone() const;
    void SetString(const wxString& s);
    wxString GetString() const;
    void SetLong(long val);
    long GetLong();
    // may be other data functions

private:
    wxString m_string;
    long     m_long;
};


#endif // WEEVENT_H
