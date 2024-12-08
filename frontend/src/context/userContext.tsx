import React, { createContext, useContext, useState } from 'react';
import { User as UserType } from '../types/User';
import {
  userIdResponse,
  customError,
  thrownError,
  isCustomError,
  isThrownError,
} from '../utils/errors';

interface AuthContextProps {
  isAuthenticated: boolean;
  loginUser: (
    username: string,
    password: string
  ) => Promise<userIdResponse | customError | thrownError | undefined>;
  logoutUser: () => void;
  user: UserType;
  updateUser: (user: any) => void;
  registerUser: (
    username: string,
    password: string
  ) => Promise<userIdResponse | customError | thrownError | undefined>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserType>();

  // useEffect(() => {
  //   console.log("User is updated", user);
  // }, [user]);

  const loginUser = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost:3000',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      if (response.ok) {
        const data: userIdResponse = await response.json();
        setIsAuthenticated(true);
        return data;
      } else {
        // ERROR OBJECTS
        const data = await response.json();
        try {
          if (isCustomError(JSON.parse(data.error))) {
            const errorObject: customError = JSON.parse(data.error);
            return errorObject;
          }
        } catch (_error) {
          if (isThrownError(data)) {
            const errorObject: thrownError = data;
            return errorObject;
          }
        }
      }
    } catch (err) {
      alert('Error logging in, request failed : ' + err);
    }
  };
  const logoutUser = () => {
    // reset the user
    setIsAuthenticated(false);
    setUser({} as UserType);
  };
  const updateUser = (user: any) => {
    // Perform update user logic
    // make an API call to update the user: PUT /api/user/:id
    // if successful, update user state
    setUser({ ...user });
  };
  const registerUser = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
        }),
      });
      if (response.ok) {
        const data: userIdResponse = await response.json();
        setIsAuthenticated(true);
        return data;
      } else {
        const data = await response.json();
        try {
          if (isCustomError(JSON.parse(data.error))) {
            const errorObject: customError = JSON.parse(data.error);
            return errorObject;
          }
        } catch (_error) {
          if (isThrownError(data)) {
            const errorObject: thrownError = data;
            return errorObject;
          }
        }
      }
    } catch (err) {
      console.log('Error registering user, request failed: ' + err);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loginUser,
        logoutUser,
        user: user ? user : ({} as UserType), // If user is null, set it to an empty object
        updateUser,
        registerUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
