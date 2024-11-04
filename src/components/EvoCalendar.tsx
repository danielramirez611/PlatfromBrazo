import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './../style/evo-calendar.midnight-blue.min.css';
import './../style/evo-calendar.min.css';
import CustomToolbar from './CustomToolbar';
import { useAuth } from '../pages/Auth/AuthContext';
import './../style/evo-calendar-dialog.css';
import { fetchNotes, saveNote, deleteNote, fetchAllNotes } from '../api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Grid } from '@mui/material';

const localizer = momentLocalizer(moment);

const EvoCalendar: React.FC = () => {
  const { user } = useAuth();
  const userRole = user ? user.role : 'user';

  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [existingNotes, setExistingNotes] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  moment.locale('es');

  const localizer = momentLocalizer(moment);
  
  // Traducción de los textos del calendario
  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: (total: number) => `+ Ver más (${total})`
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const notes = await fetchAllNotes();
        const loadedEvents = notes.map((note: any) => ({
          id: note.id,
          title: note.note,
          start: new Date(note.date),
          end: new Date(note.date),
        }));
        setEvents(loadedEvents);
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const fetchCurrentNotes = async () => {
        try {
          const dateStr = moment(selectedDate).format('YYYY-MM-DD');
          const data = await fetchNotes(dateStr);
          setExistingNotes(data);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setExistingNotes([]); // No hay notas para esta fecha
          } else {
            console.error('Error fetching notes:', error);
          }
        }
      };

      fetchCurrentNotes();
    }
  }, [selectedDate]);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    const selected = moment(slotInfo.start).startOf('day').toDate();
    setSelectedDate(selected);
  };

  const handleSaveNote = async () => {
    if (selectedDate) {
      const dateStr = moment(selectedDate).format('YYYY-MM-DD');
      try {
        const savedNote = await saveNote({ note, date: dateStr });
        
        // Actualiza el estado de las notas existentes y eventos inmediatamente
        setExistingNotes([...existingNotes, savedNote]);
        setEvents([...events, { id: savedNote.id, title: note, start: selectedDate, end: selectedDate }]);
        
        // Resetea el valor de la nota para que el campo de texto quede vacío
        setNote('');
  
        // Recargar las notas para la fecha seleccionada para asegurarse de que se muestren todas
        const data = await fetchNotes(dateStr);
        setExistingNotes(data);
  
        toast.success('Nota guardada exitosamente');
      } catch (error) {
        console.error('Error saving note:', error);
        toast.error('Error guardando la nota');
      }
    }
  };
  

  const handleDeleteNote = async () => {
    if (noteToDelete !== null) {
      try {
        await deleteNote(noteToDelete);
        
        // Filtra y actualiza las notas y eventos inmediatamente
        const updatedNotes = existingNotes.filter(note => note.id !== noteToDelete);
        const updatedEvents = events.filter(event => event.id !== noteToDelete);
        
        setExistingNotes(updatedNotes);
        setEvents(updatedEvents);
        
        // Recarga todos los eventos desde la base de datos para asegurar que estén actualizados
        const notes = await fetchAllNotes();
        const loadedEvents = notes.map((note: any) => ({
          id: note.id,
          title: note.note,
          start: new Date(note.date),
          end: new Date(note.date),
        }));
        setEvents(loadedEvents);
        
        // Mostrar mensaje de éxito
        toast.success('Nota eliminada exitosamente');
        
        // Cierra el modal de confirmación
        setShowConfirmDelete(false);
        setNoteToDelete(null);
        
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Error eliminando la nota');
      }
    }
  };
  
  
  const openConfirmDelete = (id: number) => {
    setNoteToDelete(id);
    setShowConfirmDelete(true);
  };

  const closeConfirmDelete = () => {
    setShowConfirmDelete(false);
    setNoteToDelete(null);
  };

  const handleClose = () => {
    setSelectedDate(null);
    setNote('');
  };

  const openNoteModal = (content: string) => {
    setNoteContent(content);
    setShowNoteModal(true);
  };

  const handleEventClick = (event: any) => {
    openNoteModal(event.title);
  };

  return (
    <Grid sx={{ width: '100%', paddingLeft:{lg:'10%'},paddingRight:{lg:'2%'} }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 650 }}
        components={{
          toolbar: CustomToolbar,
        }}
        selectable={userRole === 'admin'}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleEventClick}
        messages={messages} // Aplica las traducciones aquí
      />
      {selectedDate && userRole === 'admin' && (
        <div className="dialog-container">
          <div className="dialog">
            <h3>Añadir nota para {moment(selectedDate).format('YYYY-MM-DD')}</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              cols={40}
              placeholder="Escribe tu nota aquí..."
            />
            <div className="dialog-buttons">
              <button className="primary" onClick={handleSaveNote}>Guardar</button>
              <button onClick={handleClose}>Cerrar</button>
            </div>
            {existingNotes.length > 0 && (
              <div className="existing-notes">
                <h4>Notas existentes:</h4>
                {existingNotes.map((existingNote: any, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <p 
                      style={{ whiteSpace: 'pre-wrap', textAlign: 'justify', cursor: 'pointer' }}
                      onClick={() => openNoteModal(existingNote.note)}
                    >
                      {existingNote.note}
                    </p>
                    {userRole === 'admin' && (
                      <button 
                        className="danger" 
                        onClick={() => openConfirmDelete(existingNote.id)}
                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {showNoteModal && (
        <div className="dialog-container">
          <div className="dialog">
            <h3>Contenido de la Nota</h3>
            <p style={{ whiteSpace: 'pre-wrap', textAlign: 'justify', fontSize: '1rem' }}>
              {noteContent}
            </p>
            <div className="dialog-buttons">
              <button className="primary" onClick={() => setShowNoteModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
      {showConfirmDelete && (
        <div className="confirm-delete-modal">
          <div className="confirm-delete-dialog">
            <p>¿Estás seguro de que quieres eliminar esta nota?</p>
            <div className="dialog-buttons">
              <button className="danger" onClick={handleDeleteNote}>Sí, eliminar</button>
              <button onClick={closeConfirmDelete}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </Grid>
  );
};

export default EvoCalendar;
