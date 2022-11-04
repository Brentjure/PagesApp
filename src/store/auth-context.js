import React, { useState, useEffect, useCallback } from 'react';

const AuthContext = React.createContext({
  token: '',
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

let logoutTimer;

const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();

  return adjExpirationTime - currentTime;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem('token');
  const storedExpirationDate = localStorage.getItem('expirationTime');

  const remainingTime = calculateRemainingTime(storedExpirationDate);

  if (remainingTime <= 3600) {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

export const AuthContextProdiver = (props) => {
  // 1) check if token from localStorage is valid
  const tokenData = retrieveStoredToken();

  // 2) If so, set the token as the initialState.
  let initialToken;
  if (tokenData) initialToken = tokenData.token;
  console.log(tokenData);
  const [token, setToken] = useState(initialToken);

  const userIsLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    // 1) Clear the localStorage
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('expirationTime');

    // 2) Logout user when timer expires; clear logout timer
    if (logoutTimer) clearTimeout(logoutTimer);

    console.log('loggedout');
  }, []);

  const loginHandler = (token, expirationTime) => {
    // 1) Store the token inthe local Storage
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('expirationTime', expirationTime);

    // 2) Remove the user after the token expires
    const remainingTime = calculateRemainingTime(expirationTime);
    console.log('remaining time', remainingTime);
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  useEffect(() => {
    if (tokenData) {
      console.log(tokenData.duration);
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
