import React, { useState, useRef, useEffect } from 'react';

function MultiSelect({ options, value = [], onChange, label, placeholder = "Sélectionner..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionId) => {
    const newValue = value.includes(optionId)
      ? value.filter(id => id !== optionId)
      : [...value, optionId];
    onChange(newValue);
  };

  const getSelectedLabels = () => {
    return options
      .filter(opt => value.includes(opt.id))
      .map(opt => opt.name)
      .join(', ');
  };

  return (
    <div className="multi-select" ref={dropdownRef}>
      {label && <label>{label}</label>}
      <div
        className={`multi-select-input ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value.length === 0 ? 'placeholder' : ''}>
          {value.length === 0 ? placeholder : getSelectedLabels()}
        </span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="multi-select-dropdown">
          {options.map(option => (
            <div
              key={option.id}
              className={`multi-select-option ${value.includes(option.id) ? 'selected' : ''}`}
              onClick={() => toggleOption(option.id)}
            >
              <input
                type="checkbox"
                checked={value.includes(option.id)}
                onChange={() => {}}
                onClick={(e) => e.stopPropagation()}
              />
              <div
                className="team-color-indicator"
                style={{ backgroundColor: option.color }}
              />
              <span>{option.name}</span>
            </div>
          ))}
          {options.length === 0 && (
            <div className="multi-select-empty">Aucune option disponible</div>
          )}
        </div>
      )}
      {value.length > 0 && (
        <div className="multi-select-tags">
          {options
            .filter(opt => value.includes(opt.id))
            .map(option => (
              <span
                key={option.id}
                className="multi-select-tag"
                style={{ backgroundColor: option.color }}
              >
                {option.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option.id);
                  }}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
