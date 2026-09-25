import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const LOGIN_URL = "https://webpd411.itstep.click/api/Account/Login";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setSuccess(false);
      setMessage("Введіть email і пароль");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.ok) {
        let token = "";
        try {
          const data = await response.json();
          token = data?.token ?? "";
        } catch (e) {}
        setSuccess(true);
        setMessage(token ? "Вхід успішний!" : "Вхід успішний!");
      } else {
        setSuccess(false);
        setMessage("Невірний email або пароль");
      }
    } catch (error) {
      setSuccess(false);
      setMessage("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        <Text style={styles.title}>Вхід</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Увійти</Text>
          )}
        </TouchableOpacity>

        {message && (
          <View
            style={[
              styles.messageBox,
              success ? styles.successBox : styles.errorBox,
            ]}
          >
            <Text style={success ? styles.successText : styles.errorText}>
              {message}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#222",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: "#222",
  },
  button: {
    backgroundColor: "#2e6df6",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  messageBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  successBox: {
    backgroundColor: "#e3f7e8",
  },
  errorBox: {
    backgroundColor: "#fde8e8",
  },
  successText: {
    color: "#1d7a34",
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    color: "#c03434",
    fontSize: 15,
    fontWeight: "600",
  },
});
