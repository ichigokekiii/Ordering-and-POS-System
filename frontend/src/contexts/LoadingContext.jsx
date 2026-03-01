/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from "react";
import LoadingOverlay from "../components/LoadingOverlay";
import api from "../services/api";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Please wait...");

  const requestCount = useRef(0);
  const delayTimer = useRef(null);

  const showLoading = (text = "Please wait...") => {
    setLoadingText(text);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        requestCount.current += 1;

        // Add small delay to prevent flicker on very fast requests
        if (!delayTimer.current) {
          delayTimer.current = setTimeout(() => {
            setIsLoading(true);
          }, 250);
        }

        return config;
      },
      (error) => {
        requestCount.current -= 1;
        return Promise.reject(error);
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        requestCount.current -= 1;

        if (requestCount.current <= 0) {
          requestCount.current = 0;
          clearTimeout(delayTimer.current);
          delayTimer.current = null;
          setIsLoading(false);
        }

        return response;
      },
      (error) => {
        requestCount.current -= 1;

        if (requestCount.current <= 0) {
          requestCount.current = 0;
          clearTimeout(delayTimer.current);
          delayTimer.current = null;
          setIsLoading(false);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {isLoading && <LoadingOverlay text={loadingText} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}