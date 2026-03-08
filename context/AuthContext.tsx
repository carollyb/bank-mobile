import { createContext, useContext, useState } from 'react';

interface User {
  email: string;
  password: string;
}

interface IAuthContext {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email: string, password: string) => {
    const foundUser = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      console.log('::AuthProvider:: Usuário logado');
      return true;
    }
    console.log('::AuthProvider:: Credenciais inválidas');
    return false;
  };

  const signup = (email: string, password: string) => {
    setUsers((prevUsers) => [...prevUsers, { email, password }]);
    console.log('::AuthProvider:: Usuário cadastrado');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    console.log('::AuthProvider:: Usuário deslogado');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        signup,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
