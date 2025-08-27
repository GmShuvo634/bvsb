// src/components/MaterialTailwindWrapper.tsx
import React, { ReactNode } from 'react';
import { ThemeProvider } from '@material-tailwind/react';

interface MaterialTailwindWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component to ensure Material Tailwind components have proper context
 * This helps prevent "Cannot read properties of null (reading 'useContext')" errors
 */
export const MaterialTailwindWrapper: React.FC<MaterialTailwindWrapperProps> = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

export default MaterialTailwindWrapper;
