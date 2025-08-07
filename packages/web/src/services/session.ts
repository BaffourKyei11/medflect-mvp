export const getToken = () => localStorage.getItem('medflect.token');
export const setToken = (t: string) => localStorage.setItem('medflect.token', t);
export const clearToken = () => localStorage.removeItem('medflect.token');

export const onLogout = () => {
  clearToken();
  // let AuthContext handle navigation where possible
};
