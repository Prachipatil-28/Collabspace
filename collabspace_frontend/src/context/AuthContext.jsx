const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
      user: null, // Example: { name: 'John Doe', profileImage: 'path/to/image.jpg' }
      token: null,
      role: null,
    });
  
    const login = (userData) => setAuth(userData);
    const logout = () => setAuth({ user: null, token: null, role: null });
  
    return (
      <AuthContext.Provider value={{ auth, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  