import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuth } from "firebase/auth"; 
import { getFirestore, collection, getDocs, query, where, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore"; 
import firebaseApp from "../../firebase"; 
import { Ionicons } from '@expo/vector-icons'; // Importar Ionicons

const db = getFirestore(firebaseApp);

const ListVacasScreen = () => {
  const [vacas, setVacas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVaca, setSelectedVaca] = useState(null);
  const [nome, setNome] = useState('');
  const [dataUltimaCria, setDataUltimaCria] = useState('');
  const [lote, setLote] = useState('');

  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null; 

  const fetchVacas = async () => {
    if (!userId) return; 
    setLoading(true); 
    try {
      const vacasCollection = collection(db, "Vacas");
      const vacasQuery = query(vacasCollection, where("userId", "==", userId));
      const vacasSnapshot = await getDocs(vacasQuery);
      const vacasList = vacasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVacas(vacasList);
    } catch (error) {
      console.error("Erro ao buscar vacas: ", error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchVacas();
  }, [userId]);

  const handleAddVaca = async () => {
    if (!nome || !dataUltimaCria || !lote) {
      Alert.alert("Erro", "Todos os campos devem ser preenchidos.");
      return; // Sai da função se algum campo estiver vazio
    }
    try {
      await addDoc(collection(db, "Vacas"), {
        nome,
        data_ultima_cria: dataUltimaCria,
        lote,
        userId,
      });
      setNome('');
      setDataUltimaCria('');
      setLote('');
      setModalVisible(false);
      fetchVacas();
      Alert.alert("Sucesso", "Vaca registrada com sucesso!"); 
    } catch (error) {
      console.error("Erro ao cadastrar vaca: ", error);
    }
  };

  const handleEditVaca = async () => {
    if (!nome || !dataUltimaCria || !lote) {
      Alert.alert("Erro", "Todos os campos devem ser preenchidos.");
      return; // Sai da função se algum campo estiver vazio
    }
    if (selectedVaca) {
      const vacaRef = doc(db, "Vacas", selectedVaca.id);
      try {
        await updateDoc(vacaRef, {
          nome,
          data_ultima_cria: dataUltimaCria,
          lote,
        });
        setSelectedVaca(null);
        setModalVisible(false);
        fetchVacas(); 
        Alert.alert("Sucesso", "Vaca editada com sucesso!"); 
      } catch (error) {
        console.error("Erro ao editar vaca: ", error);
      }
    }
  };

  const handleDeleteVaca = (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você realmente deseja excluir esta vaca?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: async () => {
          try {
            await deleteDoc(doc(db, "Vacas", id));
            fetchVacas(); 
            Alert.alert("Sucesso", "Vaca deletada com sucesso!");
          } catch (error) {
            console.error("Erro ao excluir vaca: ", error);
          }
        }},
      ],
      { cancelable: false }
    );
  };

  const openModal = (vaca = null) => {
    setSelectedVaca(vaca);
    if (vaca) {
      setNome(vaca.nome);
      setDataUltimaCria(vaca.data_ultima_cria);
      setLote(vaca.lote);
      setIsEditing(true);
    } else {
      setNome('');
      setDataUltimaCria('');
      setLote('');
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
        <Text style={styles.addButtonText}>Adicionar Vaca</Text>
      </TouchableOpacity>
      <FlatList
        data={vacas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.nome}</Text>
            <Text style={styles.itemDetail}>Última Cria: {item.data_ultima_cria}</Text>
            <Text style={styles.itemDetail}>Lote: {item.lote}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => openModal(item)} style={styles.editButton}>
                <Ionicons name="create" size={20} color="white" />
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteVaca(item.id)} style={styles.deleteButton}>
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
            <Text style={styles.modalTitle}>{isEditing ? "Editar Vaca" : "Adicionar Vaca"}</Text>
            <TextInput
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
            <TextInput
              placeholder="Data da Última Cria"
              value={dataUltimaCria}
              onChangeText={setDataUltimaCria}
              style={styles.input}
            />
            <TextInput
              placeholder="Lote"
              value={lote}
              onChangeText={setLote}
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={isEditing ? handleEditVaca : handleAddVaca}
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
    backgroundColor: '#f5f5f5',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: '600',
    color: '#333',
  },
  modalSubTitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default ListVacasScreen;
