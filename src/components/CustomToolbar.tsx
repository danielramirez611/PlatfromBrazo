import React from 'react';
import { ToolbarProps } from 'react-big-calendar';

const CustomToolbar: React.FC<ToolbarProps> = ({ label, onNavigate, onView }) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('PREV')}>
          ‹
        </button>
        <button type="button" onClick={() => onNavigate('TODAY')}>
          Today
        </button>
        <button type="button" onClick={() => onNavigate('NEXT')}>
          ›
        </button>
       
      </span>
      <span className="rbc-toolbar-label">{label}</span>
    </div>
  );
};

export default CustomToolbar;
