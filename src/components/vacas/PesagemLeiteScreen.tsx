import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, query, where, Timestamp, doc, updateDoc } from "firebase/firestore";
import firebaseApp from "../../firebase";
import { Ionicons } from '@expo/vector-icons';

const db = getFirestore(firebaseApp);

const PesagemLeiteScreen = () => {
  const [vacas, setVacas] = useState([]);
  const [pesagens, setPesagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pesagensModalVisible, setPesagensModalVisible] = useState(false);
  const [selectedVaca, setSelectedVaca] = useState(null);
  const [pesoLeite, setPesoLeite] = useState('');
  const [editingPesagem, setEditingPesagem] = useState(null); // Estado para armazenar a pesagem em edição

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

  const handleAddPesagem = async () => {
    if (!selectedVaca || !pesoLeite) {
      Alert.alert("Erro", "Selecione uma vaca e informe o peso do leite.");
      return;
    }
    try {
      await addDoc(collection(db, "Pesagens"), {
        vacaId: selectedVaca.id,
        pesoLeite: parseFloat(pesoLeite),
        data: Timestamp.now(),
        userId,
      });
      setPesoLeite('');
      setModalVisible(false);
      Alert.alert("Sucesso", "Pesagem registrada com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar pesagem: ", error);
    }
  };

  const handleEditPesagem = async () => {
    if (!editingPesagem || !pesoLeite) {
      Alert.alert("Erro", "Informe o peso do leite.");
      return;
    }
    const pesagemRef = doc(db, "Pesagens", editingPesagem.id);
    try {
      await updateDoc(pesagemRef, {
        pesoLeite: parseFloat(pesoLeite),
      });
      setEditingPesagem(null); // Limpa a pesagem editada
      setPesoLeite(''); // Limpa o peso
      setModalVisible(false),
      Alert.alert("Sucesso", "Pesagem editada com sucesso!", [
        {
          text: "OK",
          onPress: () => handleViewPesagens(editingPesagem.vacaId),
        },
      ]);
      
    } catch (error) {
      console.error("Erro ao editar pesagem: ", error);
    }
  };

  const openModal = (vaca) => {
    setSelectedVaca(vaca);
    setPesoLeite('');
    setEditingPesagem(null); // Limpa a pesagem ao abrir o modal
    setModalVisible(true);
  };

  const handleViewPesagens = async (vacaId) => {
    try {
      const pesagensCollection = collection(db, "Pesagens");
      const pesagensQuery = query(pesagensCollection, where("vacaId", "==", vacaId));
      const pesagensSnapshot = await getDocs(pesagensQuery);
      const pesagensList = pesagensSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPesagens(pesagensList);
      setPesagensModalVisible(true);
    } catch (error) {
      console.error("Erro ao buscar pesagens: ", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditPesagemModal = (pesagem) => {
    setEditingPesagem(pesagem); // Armazena a pesagem a ser editada
    setPesoLeite(pesagem.pesoLeite.toString()); // Preenche o campo de peso com o valor atual
    setModalVisible(true); // Abre o modal de edição
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vacas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.nome}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => openModal(item)} style={styles.pesagemButton}>
                <Ionicons name="add-circle-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Registrar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleViewPesagens(item.id)} style={styles.viewPesagensButton}>
                <Ionicons name="eye-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Ver</Text>
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
            <Text style={styles.modalTitle}>Pesagem do Leite</Text>
            <Text style={styles.modalSubTitle}>Vaca: {selectedVaca?.nome}</Text>
            <TextInput
              placeholder="Peso do leite (em kg)"
              value={pesoLeite}
              onChangeText={setPesoLeite}
              keyboardType="numeric"
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={editingPesagem ? handleEditPesagem : handleAddPesagem}
            >
              <Text style={styles.submitButtonText}>{editingPesagem ? 'Editar' : 'Registrar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={pesagensModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPesagensModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pesagens da Vaca</Text>
            {/* <Text style={styles.modalSubTitle}>Vaca: {selectedVaca?.nome}</Text> */}
            <FlatList
              data={pesagens.sort((a, b) => b.data - a.data)} // Ordena em ordem decrescente (mais recente primeiro)
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.pesagemItemContainer}>
                  <Text style={styles.pesagemItem}>
                    {item.pesoLeite} kg - Data: {item.data.toDate().toLocaleDateString('pt-br')}
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditPesagemModal(item)} // Função para editar a pesagem
                  >
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                </View>
              )}
              style={styles.pesagensList} // Adicionei uma nova style para o FlatList
            />
            <TouchableOpacity style={styles.cancelButton} onPress={() => setPesagensModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Fechar</Text>
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
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pesagemButton: {
    backgroundColor: '#4CAF50',
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
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewPesagensButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  pesagensList: {
    maxHeight: 300, // Altura fixa para a lista de pesagens
    width: '100%',
  },
  pesagemItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  pesagemItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '80%', // Ajuste a largura se necessário
  },
  editButton: {
    backgroundColor: '#4CAF50', // Cor do botão de editar
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default PesagemLeiteScreen;
