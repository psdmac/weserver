#include "WeEvent.h"

// define an event type of wxEVT_WE
wxDEFINE_EVENT(wxEVT_WE, WeEvent);

// event class implementation
WeEvent::WeEvent(int id, wxEventType type) : wxEvent(id, type)
{
}

WeEvent::WeEvent(const WeEvent& event) : wxEvent(event)
{
    // deep copy
    this->SetString(event.GetString().c_str());
    this->m_long = event.m_long;
}

wxEvent *WeEvent::Clone() const
{
    return new WeEvent(*this);
}

void WeEvent::SetString(const wxString& str)
{
    // deep copy
    m_string = str.c_str();
}

wxString WeEvent::GetString() const
{
    return m_string;
}

void WeEvent::SetLong(long val)
{
    m_long = val;
}

long WeEvent::GetLong()
{
    return m_long;
}
