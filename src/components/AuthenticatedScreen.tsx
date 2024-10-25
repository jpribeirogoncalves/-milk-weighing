// src/components/AuthenticatedScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'; // Importando Ionicons

// Defina os tipos das suas rotas
type AuthenticatedScreenProps = {
  user: { email: string }; // Ajuste conforme o tipo de usuário que você está usando
  handleAuthentication: () => void;
  navigation: StackNavigationProp<any>; // Use o tipo apropriado para suas rotas
};

const AuthenticatedScreen: React.FC<AuthenticatedScreenProps> = ({ user, handleAuthentication, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.emailText}>{user.email}</Text>

        {/* Container com borda para os três primeiros botões */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.buttonGerencer} onPress={() => navigation.navigate("Gerenciar vacas")}>

            <Text style={styles.buttonText}>Gerenciar Vacas</Text>
          </Pressable>
          
          <Pressable style={styles.buttonGerencer} onPress={() => navigation.navigate("Pesagem do leite")}>

            <Text style={styles.buttonText}>Pesagem do Leite</Text>
          </Pressable>

          <Pressable style={styles.buttonGerencer} onPress={() => navigation.navigate("Gerenciar balanças")}>
 
            <Text style={styles.buttonText}>Gerenciar Balanças</Text>
          </Pressable>
        </View>

        <Pressable style={styles.button} onPress={() => navigation.navigate("Editar dados da conta", { user })}>
          <Ionicons name="create-outline" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Editar Dados da Conta</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleAuthentication}>
          <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.icon} />
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
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 8, // Aumentando a elevação para mais profundidade
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  title: {
    fontSize: 28, // Aumentando o tamanho da fonte
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
  buttonContainer: {
    borderWidth: 1,
    borderColor: '#ccc', // Cor da borda
    borderRadius: 10,
    padding: 10,
    marginBottom: 15, // Espaçamento entre os botões
    backgroundColor: '#f9f9f9', // Fundo do container
  },
  buttonGerencer: {
    backgroundColor: '#4CAF50', // Azul mais vibrante
    marginVertical: 8,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 5, // Adicionando sombra ao botão
  },
  button: {
    backgroundColor: '#007AFF', // Azul mais vibrante
    marginVertical: 8,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 5, // Adicionando sombra ao botão
  },
  icon: {
    marginRight: 8, // Espaçamento entre o ícone e o texto
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#e74c3c', // Vermelho para o botão de logout
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 5, // Adicionando sombra ao botão
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AuthenticatedScreen;
