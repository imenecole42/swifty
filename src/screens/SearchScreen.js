import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
/*View : équivalent d'une <div>
Text : affiche du texte
TextInput : champ de saisie
TouchableOpacity : bouton cliquable
StyleSheet : gestion des styles
ActivityIndicator : spinner de chargement
KeyboardAvoidingView : évite que le clavier cache les champs
Platform : permet de savoir si on est sur Android ou iOS
Alert : affiche une popup (ici il n'est pas utilisé)*/
import { fetchUser } from '../services/api42';

export default function SearchScreen({ navigation }) {
  const [login, setLogin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch() {
    const trimmed = login.trim();
    if (!trimmed) {
      setError('Saisis un login 42');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await fetchUser(trimmed);
      navigation.navigate('Profile', { user });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Swifty</Text>
        <Text style={styles.subtitle}>Companion</Text>
        <Text style={styles.desc}>Recherche un étudiant 42</Text>

        <TextInput
          style={styles.input}
          placeholder="Login (ex: jdoe)"
          placeholderTextColor="#888"
          value={login}
          onChangeText={(t) => { setLogin(t); setError(''); }}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Rechercher</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: '#00babc',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#888',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#1c1c2e',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    marginBottom: 12,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  button: {
    width: '100%',
    backgroundColor: '#00babc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
