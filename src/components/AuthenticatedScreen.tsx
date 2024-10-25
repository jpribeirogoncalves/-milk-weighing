// src/components/AuthenticatedScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'; // Importando Ionicons

// Defina os tipos das suas rotas
type AuthenticatedScreenProps = {
  user: { email: string }; // Ajuste conforme o tipo de usuário que você está usando
  handleAuthentication: () => void;
  handleUpdate: (data: { email: string; password: string }) => void; // Função para atualizar dados
  navigation: StackNavigationProp<any>; // Use o tipo apropriado para suas rotas
};

const AuthenticatedScreen: React.FC<AuthenticatedScreenProps> = ({ user, handleAuthentication, handleUpdate, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.emailText}>{user.email}</Text>

        <Pressable style={styles.button} onPress={() => navigation.navigate("Gerenciar vacas")}>
          <Text style={styles.buttonText}>Gerenciar vacas</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => navigation.navigate("Editar dados da conta", { user })}>
          <Ionicons name="create-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Editar Dados da Conta</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleAuthentication}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.logoutButtonText}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  authContainer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  emailText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  button: {
    backgroundColor: '#007AFF',
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row', // Adiciona flexDirection para alinhar ícones e texto
    justifyContent: 'center', // Centraliza conteúdo
  },
  icon: {
    marginRight: 10, // Espaçamento entre o ícone e o texto
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row', // Alinha ícone e texto
    justifyContent: 'center', // Centraliza conteúdo
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AuthenticatedScreen;
