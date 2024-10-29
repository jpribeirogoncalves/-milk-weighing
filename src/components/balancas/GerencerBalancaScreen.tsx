import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuth } from "firebase/auth"; 
import { getFirestore, collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc, Timestamp } from "firebase/firestore"; 
import firebaseApp from "../../firebase"; 
import { Ionicons } from '@expo/vector-icons';

const db = getFirestore(firebaseApp);

const GerencerBalancasScreen = () => {
  const [balancas, setBalancas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBalanca, setSelectedBalanca] = useState(null);
  const [nome, setNome] = useState('');
  const [peso, setPeso] = useState('');
  const [dataCalibracao, setDataCalibracao] = useState('');
  const [endereco_ip, setEnderecoIP ] = useState('');

  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null; 

  const fetchBalancas = async () => {
    if (!userId) return; 
    setLoading(true); 
    try {
      const balancasCollection = collection(db, "Balancas");
      const balancasQuery = query(balancasCollection, where("userId", "==", userId));
      const balancasSnapshot = await getDocs(balancasQuery);
      const balancasList = balancasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBalancas(balancasList);
    } catch (error) {
      console.error("Erro ao buscar balanças: ", error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchBalancas();
  }, [userId]);

  const handleAddBalanca = async () => {
    if (!nome || !peso || !endereco_ip) {
      Alert.alert("Erro", "Todos os campos devem ser preenchidos.");
      return;
    }
    try {
      await addDoc(collection(db, "Balancas"), {
        nome,
        peso,
        data_calibracao: Timestamp.now(),
        endereco_ip,
        userId,
      });
      setNome('');
      setPeso('');
      setDataCalibracao('');
      setModalVisible(false);
      fetchBalancas();
      Alert.alert("Sucesso", "Balança registrada com sucesso!"); 
    } catch (error) {
      console.error("Erro ao cadastrar balança: ", error);
    }
  };

  const handleEditBalanca = async () => {
    if (!nome || !peso || !endereco_ip) {
      Alert.alert("Erro", "Todos os campos devem ser preenchidos.");
      return;
    }
    if (selectedBalanca) {
      const balancaRef = doc(db, "Balancas", selectedBalanca.id);
      try {
        await updateDoc(balancaRef, {
          nome,
          peso,
          data_calibracao: Timestamp.now(),
          endereco_ip,
        });
        setSelectedBalanca(null);
        setModalVisible(false);
        fetchBalancas(); 
        Alert.alert("Sucesso", "Balança editada com sucesso!"); 
      } catch (error) {
        console.error("Erro ao editar balança: ", error);
      }
    }
  };

  const handleDeleteBalanca = (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você realmente deseja excluir esta balança?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: async () => {
          try {
            await deleteDoc(doc(db, "Balancas", id));
            fetchBalancas(); 
            Alert.alert("Sucesso", "Balança deletada com sucesso!");
          } catch (error) {
            console.error("Erro ao excluir balança: ", error);
          }
        }},
      ],
      { cancelable: false }
    );
  };

  const openModal = (balanca = null) => {
    setSelectedBalanca(balanca);
    if (balanca) {
      setNome(balanca.nome);
      setPeso(balanca.peso);
      setEnderecoIP(balanca.endereco_ip)
      setIsEditing(true);
    } else {
      setNome('');
      setPeso('');
      setEnderecoIP('');
      setIsEditing(false);
    }
    setModalVisible(true);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Adicionar Balança</Text>
      </TouchableOpacity>
      <FlatList
        data={balancas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.nome}</Text>
            <Text style={styles.itemDetail}>Peso: {item.peso}</Text>
            <Text style={styles.itemDetail}>Endereço IP: {item.endereco_ip}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => openModal(item)} style={styles.editButton}>
                <Ionicons name="create" size={20} color="white" />
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteBalanca(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? "Editar Balança" : "Adicionar Balança"}</Text>
            <TextInput
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
            <TextInput
              placeholder="Peso"
              value={peso}
              onChangeText={setPeso}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Endereço IP"
              value={endereco_ip}
              onChangeText={setEnderecoIP}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={isEditing ? handleEditBalanca : handleAddBalanca}
            >
              <Text style={styles.submitButtonText}>{isEditing ? "Atualizar" : "Adicionar"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',

  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2, 
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50', // Verde
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336', // Vermelho
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GerencerBalancasScreen;
