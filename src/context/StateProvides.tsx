// src/context/StateProvider.tsx
import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  user: null,
};

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.user,
      };
    default:
      return state;
  }
};

const StateContext = createContext<any>(null);

export const StateProvider = ({ children }: any) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);

export const useStateValue = () => useContext(StateContext);
