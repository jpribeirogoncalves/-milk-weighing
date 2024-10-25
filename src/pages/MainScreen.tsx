// src/screens/MainScreen.tsx
import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import AuthScreen from '../components/AuthScreen';
import AuthenticatedScreen from '../components/AuthenticatedScreen';
import GerencerVacasScreen from '../components/vacas/GerecerVacasScreen';
import PesagemLeiteScreen from '../components/vacas/PesagemLeiteScreen';
import EditAccountScreen from '../components/EditAccountScreen';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@firebase/auth';
import app from '../firebase';

const auth = getAuth(app);
const Stack = createStackNavigator();

const MainScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const user = useAuth();

  const handleAuthentication = async () => {
    try {
      if (user) {
        // If user is already authenticated, log out
        console.log('User logged out successfully!');
        await signOut(auth);
      } else {
        // Sign in or sign up
        if (isLogin) {
          // Sign in
          await signInWithEmailAndPassword(auth, email, password);
          console.log('User signed in successfully!');
        } else {
          // Sign up
          await createUserWithEmailAndPassword(auth, email, password);
          console.log('User created successfully!');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }
  };

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen name="Pagina Inicial" options={{ headerShown: false }}>
          {(props) => (
            <AuthenticatedScreen 
              {...props}
              user={user}
              handleAuthentication={handleAuthentication}
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Login/Cadastrar" options={{ headerShown: false }}>
          {(props) => (
            <AuthScreen
              {...props}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isLogin={isLogin}
              setIsLogin={setIsLogin}
              handleAuthentication={handleAuthentication}
            />
          )}
        </Stack.Screen>
      )}
      <Stack.Screen name="Gerenciar vacas" component={GerencerVacasScreen} />
      <Stack.Screen name="Pesagem do leite" component={PesagemLeiteScreen} />
      <Stack.Screen name="Editar dados da conta" component={EditAccountScreen} />
    </Stack.Navigator>
  );
};

const styles = {
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
};

export default MainScreen;
