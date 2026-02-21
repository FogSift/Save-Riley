import { createContext, useContext } from 'react';

export const OSContext = createContext(null);

/** Hook to consume the OS context in any child component. */
export const useOS = () => useContext(OSContext);
