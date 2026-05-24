import React, { createContext, useContext, useState } from 'react';

const CursorContext = createContext();

export function CursorProvider({ children }) {
  const [cursorVariant, setCursorVariant] = useState("default");

  const setHovering = () => setCursorVariant("hover");
  const setDefault = () => setCursorVariant("default");
  
  // Custom states like 'lightbox'
  const setLightbox = () => setCursorVariant("lightbox");

  return (
    <CursorContext.Provider value={{ cursorVariant, setHovering, setDefault, setLightbox }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  return useContext(CursorContext);
}
