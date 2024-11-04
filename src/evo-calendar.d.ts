declare module 'evo-calendar' {
    interface CalendarEvent {
      id?: string;
      name: string;
      date: string | string[];
      type: string;
      everyYear?: boolean;
      badge?: string;
      description?: string;
      color?: string;
    }
  
    interface EvoCalendarOptions {
      theme?: string;
      calendarEvents?: CalendarEvent[];
    }
  
    interface JQuery {
      evoCalendar(options?: EvoCalendarOptions): JQuery;
    }
  }
  