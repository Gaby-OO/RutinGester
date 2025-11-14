import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import Constants from 'expo-constants';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

type Role = 'user' | 'assistant';
interface Message { id: string; role: Role; content: string }

const AI_ENDPOINT = process.env.EXPO_PUBLIC_AI_ENDPOINT || (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_AI_ENDPOINT; // Fallback a expo.extra

async function fetchAI(messages: Message[]): Promise<string | null> {
  if (!AI_ENDPOINT) return null;
  try {
    const body = { messages: messages.map(m => ({ role: m.role, content: m.content })) };
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.warn('[AI] HTTP error', res.status, txt);
      return null;
    }
    const json: any = await res.json();
    const reply: string | undefined = json.reply;
    if (!reply) {
      console.warn('[AI] Missing reply field', json);
      return null;
    }
    return reply.length > 1400 ? reply.slice(0, 1400) + '…' : reply;
  } catch (e) {
    return null;
  }
}

export default function ChatScreen() {
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const [messages, setMessages] = useState<Message[]>([{
    id: 'hello', role: 'assistant', content: 'Hola, soy tu asistente. Responderé usando IA. ¿En qué te ayudo?'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now() + '', role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const aiReply = await fetchAI([...messages, userMsg]);
      const reply = aiReply ?? 'Lo siento, no pude responder ahora mismo. Inténtalo nuevamente en unos segundos.';
      const bot: Message = { id: Date.now() + 'a', role: 'assistant', content: reply };
      setMessages((m) => [...m, bot]);
      // Scroll al final
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.assistant]}>
            <ThemedText style={[
              styles.bubbleText,
              item.role === 'user' ? styles.userText : undefined,
              item.role === 'assistant' ? { color: textColor } : undefined,
            ]}>
              {item.content}
            </ThemedText>
          </View>
        )}
        contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escribe tu mensaje…"
            style={[styles.input, { color: textColor }]}
            placeholderTextColor={placeholderColor}
          multiline
        />
        <Pressable onPress={send} disabled={!canSend} style={({ pressed }) => [styles.sendBtn, (!canSend || loading) && { opacity: 0.5 }, pressed && { opacity: 0.85 }]}>
          <IconSymbol name="paperplane.fill" size={16} color="#fff" />
          <ThemedText style={styles.sendText}>{loading ? 'Enviando…' : 'Enviar'}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  bubble: { padding: 10, borderRadius: 12, maxWidth: '85%' },
  user: { alignSelf: 'flex-end', backgroundColor: '#4f46e5' },
  assistant: { alignSelf: 'flex-start', backgroundColor: 'rgba(79,70,229,0.12)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(79,70,229,0.25)' },
  bubbleText: { color: '#1f2937' },
  userText: { color: '#fff' },
  assistantText: { color: '#fff' },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: 'rgba(127,127,127,0.12)', borderRadius: 10, padding: 10, minHeight: 44 },
  sendBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#22c55e', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  sendText: { color: '#fff', fontWeight: '800' },
});
