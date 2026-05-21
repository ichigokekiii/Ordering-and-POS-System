/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const showLoading = () => {};
  const hideLoading = () => {};

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
