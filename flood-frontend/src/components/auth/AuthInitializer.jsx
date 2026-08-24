import { useEffect } from "react";

import { getCurrentUser } from "../../api/auth.api";

import {
  setCredentials,
  clearCredentials,
  setAuthLoading,
} from "../../store/slices/authSlice";

import { useAppDispatch } from "../../hooks/redux";

const AuthInitializer = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Checking existing authentication...");

        const response = await getCurrentUser();

        console.log(
          "Current user response:",
          response
        );

        if (
          response?.success &&
          response?.user
        ) {
          console.log(
            "Authenticated user:",
            response.user
          );

          if (mounted) {
            dispatch(
              setCredentials(response.user)
            );
          }
        } else {
          console.log(
            "No authenticated user"
          );

          if (mounted) {
            dispatch(
              clearCredentials()
            );
          }
        }
      } catch (error) {
        console.error(
          "Auth initialization failed:",
          error
        );

        if (mounted) {
          dispatch(
            clearCredentials()
          );
        }
      } finally {
        if (mounted) {
          dispatch(
            setAuthLoading(false)
          );
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return children;
};

export default AuthInitializer;