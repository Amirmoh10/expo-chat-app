import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  ListRenderItem,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetch as expoFetch } from "expo/fetch";
import { API_KEY_STORAGE, Message, sendChatMessage } from "./utils";

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [tempKey, setTempKey] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");

  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (messages.length > 0) {
      // Small timeout ensures the list has rendered before scrolling
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Load API key from storage on mount
  useEffect(() => {
    const loadApiKey = async () => {
      const storedKey = await AsyncStorage.getItem(API_KEY_STORAGE);
      if (storedKey) {
        setApiKey(storedKey);
      } else {
        setModalVisible(true);
      }
    };
    loadApiKey();
  }, []);

  const handleApiKeySubmit = async () => {
    await AsyncStorage.setItem(API_KEY_STORAGE, tempKey);
    setApiKey(tempKey);
    setModalVisible(false);
  };

  const handleSend = () => {
    if (inputText.trim() && apiKey) {
      sendChatMessage(inputText.trim(), apiKey, setMessages, expoFetch);
      setInputText("");
    }
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === "user" ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  const handleDeleteApiKey = async () => {
    Alert.alert(
      "Delete API Key",
      "Are you sure you want to delete your API key?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            await AsyncStorage.removeItem(API_KEY_STORAGE);

            setApiKey(null);

            setModalVisible(true);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat App</Text>
        {apiKey && (
          <Button
            title="Reset API Key"
            onPress={handleDeleteApiKey}
            color="red"
          />
        )}
      </View>
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter your OpenAI API Key</Text>
            <TextInput
              style={styles.input}
              placeholder="sk-..."
              value={tempKey}
              onChangeText={setTempKey}
              autoCapitalize="none"
            />
            <Button title="Save API Key" onPress={handleApiKeySubmit} />
          </View>
        </View>
      </Modal>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        // keyboardVerticalOffset={10}
      >
        <FlatList
          ref={flatListRef}
          style={styles.chatList}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
          />
          <Button title="Send" onPress={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  chatList: { flex: 1, padding: 10 },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },
  messageText: { fontSize: 16 },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopColor: "#ccc",
    borderTopWidth: 1,
    backgroundColor: "#fff",
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000aa",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default App;
