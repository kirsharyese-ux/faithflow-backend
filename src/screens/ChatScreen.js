import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as Network from 'expo-network';
import * as WebBrowser from 'expo-web-browser';
import { sendMessage } from '../api/ai';
import { createCheckoutSession } from '../api/checkout';
import { supabase } from '../config/supabase';

export default function ChatScreen({ onSignOut }) {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      Alert.alert('Validation', 'Please enter a message before sending.');
      return;
    }

    setLoading(true);
    setReply('');

    try {
      const data = await sendMessage(trimmed);
      setReply(data.reply || 'No response from server.');
      setMessage('');
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch AI response.');
    } finally {
      setLoading(false);
    }
  };

  const testPing = async () => {
    try {
      const res = await axios.get(
        'https://faithflow-backend-v8c5.onrender.com/api/ping',
        { timeout: 20000 }
      );
      console.log('🟢 PING OK:', res.data);
    } catch (err) {
      console.log('🔴 PING FAIL:', err.message);
      console.log('🔴 RESPONSE:', err.response);
      console.log('🔴 REQUEST:', err.request);
    }
  };

  useEffect(() => {
    testPing();
  }, []);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);

    try {
      const state = await Network.getNetworkStateAsync();
      console.log('🌐 Network:', state);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session?.access_token) {
        console.error('❌ Supabase session error:', sessionError);
        Alert.alert('Checkout error', 'Unable to access auth session.');
        return;
      }

      const accessToken = sessionData.session.access_token;
      const data = await createCheckoutSession(accessToken);

      console.log('📦 Checkout response:', data);

      if (data?.url) {
        await WebBrowser.openBrowserAsync(data.url);
      } else {
        console.error('❌ No checkout URL returned', data);
        Alert.alert('Checkout error', 'No checkout URL returned from backend.');
      }
    } catch (error) {
      console.error('❌ AXIOS ERROR:', error);
      Alert.alert('Network error', 'Unable to reach checkout endpoint.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FaithFlow Chat</Text>

      <View style={styles.actionRow}>
        <Text style={styles.title}>FaithFlow Chat</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onSignOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Ask a Bible question..."
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <TouchableOpacity style={[styles.button, styles.upgradeButton, checkoutLoading && styles.buttonDisabled]} onPress={handleUpgrade} disabled={checkoutLoading}>
        <Text style={styles.buttonText}>{checkoutLoading ? 'Opening checkout...' : 'Upgrade to Pro'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSend} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send'}</Text>
      </TouchableOpacity>

      {loading ? <ActivityIndicator style={styles.loader} size="large" color="#007AFF" /> : null}

      {reply ? (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>AI Response</Text>
          <Text style={styles.replyText}>{reply}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#aac8ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  logoutText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  loader: {
    marginBottom: 16,
  },
  replyBox: {
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f7f9ff',
  },
  replyLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  replyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#222',
  },
  upgradeButton: {
    backgroundColor: '#34A853',
  },
});
