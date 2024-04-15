// src/context/ReportContext.js
import React, { createContext, useContext, useState } from 'react';

const ReportContext = createContext();

export const useReports = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);

  // Add functions to modify `reports` here

  return (
    <ReportContext.Provider value={{ reports, setReports }}>
      {children}
    </ReportContext.Provider>
  );
};
