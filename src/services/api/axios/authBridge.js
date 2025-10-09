let logoutFunction = null;

export const setLogout = (fn) => {
  logoutFunction = fn;
};

export const logout = () => {
  if (logoutFunction) logoutFunction();
};
