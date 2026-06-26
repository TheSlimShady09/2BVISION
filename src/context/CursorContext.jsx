import { createContext, useContext, useState } from 'react';

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

// eslint-disable-next-line react-refresh/only-export-components
export function useCursor() {
  const context = useContext(CursorContext);
  if (!context) {
    return {
      cursorVariant: 'default',
      setHovering: () => {},
      setDefault: () => {},
      setLightbox: () => {},
    };
  }
  return context;
}
