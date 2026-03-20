import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import CustomAlert from '@/components/CustomAlert';
import { useAuth } from '@/context/AuthContext';
import { useTransactionContext } from '@/context/TransactionContext';
import { useBottomSheetMotion } from '@/hooks/use-bottom-sheet-motion';
import {
  SHEET_HEIGHT,
  transactionFormStyles as styles,
} from '@/styles/transactionFormStyles';
import { TransactionType } from '@/types/transaction.type';
import { toISODate } from '@/utils/toISODate';
import {
  addUserCategory,
  getTransactionById,
  getUserCategories,
  saveTransaction,
  updateTransaction,
  uploadAttachment,
} from '@/utils/transactionService';

// ─── Constants ───────────────────────────────────────────────────────────────

const TRANSACTION_TYPES: {
  key: TransactionType;
  label: string;
  icon: string;
}[] = [
  { key: 'withdraw', label: 'Saque', icon: '↑' },
  { key: 'deposit', label: 'Depósito', icon: '↓' },
  { key: 'transfer', label: 'Transferência', icon: '⇄' },
  { key: 'payment', label: 'Boleto', icon: '📄' },
];

type Attachment = { uri: string; mimeType: string; name: string };

type AlertState = {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
};

const getDateKeyInSaoPaulo = (value: Date): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);

  const year = parts.find((p) => p.type === 'year')?.value ?? '0000';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
};

const getTodayInSaoPaulo = (): Date => {
  const [year, month, day] = getDateKeyInSaoPaulo(new Date())
    .split('-')
    .map(Number);
  return new Date(year, month - 1, day);
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function TransactionForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { setTransactionSheetOpen, fetchTransactions } =
    useTransactionContext();
  const isEditing = !!id;
  const todayInSaoPaulo = useMemo(() => getTodayInSaoPaulo(), []);

  // ── Animation ──────────────────────────────────────────────────────────
  const navigateBack = useCallback(() => {
    setTransactionSheetOpen(false);
    router.back();
  }, [setTransactionSheetOpen]);

  const { animatedStyle, panGesture, closeSheet } = useBottomSheetMotion({
    visible: true,
    hiddenY: SHEET_HEIGHT,
    onClose: navigateBack,
  });

  useEffect(() => {
    setTransactionSheetOpen(true);
    return () => setTransactionSheetOpen(false);
  }, [setTransactionSheetOpen]);

  const close = useCallback(() => {
    closeSheet();
  }, [closeSheet]);

  // ── Form state ─────────────────────────────────────────────────────────
  const [type, setType] = useState<TransactionType>('withdraw');
  const [amountRaw, setAmountRaw] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([
    'mercado',
    'vestuário',
    'restaurante',
    'estudos',
  ]);
  const [to, setTo] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  // ── Load data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    getUserCategories(user.uid)
      .then(setCategories)
      .catch(() => {});

    if (isEditing && id) {
      getTransactionById(user.uid, id)
        .then((txn) => {
          if (!txn) return;
          setType(txn.type);
          setAmountRaw(String(Math.round(Math.abs(txn.value) * 100)));
          setDate(new Date(txn.date));
          setCategory(txn.category ?? null);
          setTo(txn.to ?? '');
          setDescription(txn.description ?? '');
        })
        .catch(() => {});
    }
  }, [user, id, isEditing]);

  // ── Derived ────────────────────────────────────────────────────────────
  const showCategory = type !== 'deposit';
  const showTransferFields = type === 'transfer';

  const formattedAmount = useMemo(() => {
    if (!amountRaw) return '';
    const value = parseInt(amountRaw, 10) / 100;
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [amountRaw]);

  const formattedDate = useMemo(() => date.toLocaleDateString('pt-BR'), [date]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAmountChange = (text: string) => {
    setAmountRaw(text.replace(/\D/g, ''));
  };

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    if (t === 'deposit') setCategory(null);
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim().toLowerCase();
    if (!trimmed || !user) return;
    try {
      await addUserCategory(user.uid, trimmed);
      setCategories((prev) =>
        prev.includes(trimmed) ? prev : [...prev, trimmed],
      );
      setCategory(trimmed);
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch {
      showAlertMsg('error', 'Erro', 'Não foi possível adicionar a categoria.');
    }
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? 'photo.jpg',
      });
    }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? 'image.jpg',
      });
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'application/pdf',
        name: asset.name,
      });
    }
  };

  const showAlertMsg = (
    type: 'success' | 'error',
    title: string,
    message: string,
  ) => setAlert({ visible: true, type, title, message });

  const handleSave = async () => {
    if (!user) return;
    if (!amountRaw) {
      showAlertMsg(
        'error',
        'Campo obrigatório',
        'Informe o valor da transação.',
      );
      return;
    }

    const rawValue = parseInt(amountRaw, 10) / 100;
    if (!Number.isFinite(rawValue) || rawValue <= 0) {
      showAlertMsg(
        'error',
        'Valor inválido',
        'Informe um valor maior que zero.',
      );
      return;
    }

    if (getDateKeyInSaoPaulo(date) > getDateKeyInSaoPaulo(new Date())) {
      showAlertMsg(
        'error',
        'Data inválida',
        'Não é permitido cadastrar transações em data futura.',
      );
      return;
    }

    setLoading(true);
    try {
      let urlAnexo: string | undefined;
      if (attachment) {
        urlAnexo = await uploadAttachment(
          user.uid,
          attachment.uri,
          attachment.mimeType,
        );
      }

      const value = ['withdraw', 'payment', 'transfer'].includes(type)
        ? -Math.abs(rawValue)
        : Math.abs(rawValue);

      const txnData = {
        type,
        value,
        date: toISODate(date),
        accountId: user.uid,
        createdAt: new Date().toISOString(),
        ...(showCategory && category ? { category } : {}),
        ...(description ? { description } : {}),
        ...(showTransferFields && to ? { to } : {}),
        ...(urlAnexo ? { urlAnexo } : {}),
      };

      if (isEditing && id) {
        await updateTransaction(user.uid, id, txnData);
      } else {
        await saveTransaction(user.uid, txnData);
      }

      await fetchTransactions(true);
      closeSheet();
    } catch (error) {
      const code =
        typeof error === 'object' && error && 'code' in error
          ? String((error as { code?: string }).code)
          : 'sem-codigo';
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: string }).message)
          : String(error);
      console.log('[transaction-form] save error:', { code, message, error });
      showAlertMsg(
        'error',
        'Erro',
        'Não foi possível salvar. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={close} />

      {/* Sheet */}
      <Animated.View style={[styles.sheet, animatedStyle]}>
        {/* Drag handle */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {isEditing ? 'Editar Transação' : 'Nova Transação'}
              </Text>
              <Pressable onPress={close} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
          </View>
        </GestureDetector>

        {/* Scrollable form */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={20}
        >
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Tipo ── */}
            <Text style={styles.sectionLabel}>Tipo</Text>
            <View style={styles.typeRow}>
              {TRANSACTION_TYPES.map((t) => (
                <Pressable
                  key={t.key}
                  style={[
                    styles.typeChip,
                    type === t.key && styles.typeChipSelected,
                    isEditing && styles.typeChipDisabled,
                  ]}
                  onPress={() => handleTypeChange(t.key)}
                  disabled={isEditing}
                >
                  <Text style={styles.typeChipIcon}>{t.icon}</Text>
                  <Text
                    style={[
                      styles.typeChipText,
                      type === t.key && styles.typeChipTextSelected,
                      isEditing && styles.typeChipTextDisabled,
                    ]}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {isEditing && (
              <Text style={styles.typeLockHint}>
                O tipo não pode ser alterado ao editar uma transação.
              </Text>
            )}

            {/* ── Valor + Data ── */}
            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.sectionLabel}>Valor</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={[styles.input, styles.amountInput]}
                    value={formattedAmount}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric"
                    placeholder="0,00"
                    placeholderTextColor="#CCC"
                  />
                </View>
              </View>

              <View style={styles.flex1}>
                <Text style={styles.sectionLabel}>Data</Text>
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>{formattedDate}</Text>
                </Pressable>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                locale="pt-BR"
                textColor="#1A1A1A"
                themeVariant="light"
                maximumDate={todayInSaoPaulo}
                onChange={(_event, selected) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (!selected) return;

                  const safeDate =
                    getDateKeyInSaoPaulo(selected) >
                    getDateKeyInSaoPaulo(new Date())
                      ? todayInSaoPaulo
                      : selected;
                  setDate(safeDate);
                }}
              />
            )}

            {/* ── Categoria ── */}
            {showCategory && (
              <>
                <Text style={styles.sectionLabel}>
                  Categoria <Text style={styles.optionalTag}>(opcional)</Text>
                </Text>
                <View style={styles.categoryRow}>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.categoryChip,
                        category === cat && styles.categoryChipSelected,
                      ]}
                      onPress={() => setCategory(category === cat ? null : cat)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          category === cat && styles.categoryChipTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={styles.addCategoryChip}
                    onPress={() => setShowAddCategory(true)}
                  >
                    <Text style={styles.addCategoryText}>+ nova</Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* ── Transferência ── */}
            {showTransferFields && (
              <>
                <Text style={styles.sectionLabel}>Para</Text>
                <TextInput
                  style={styles.input}
                  value={to}
                  onChangeText={setTo}
                  placeholder="Conta de destino"
                  placeholderTextColor="#CCC"
                />
              </>
            )}

            {/* ── Descrição ── */}
            <Text style={styles.sectionLabel}>
              Descrição <Text style={styles.optionalTag}>(opcional)</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Adicione uma descrição..."
              placeholderTextColor="#CCC"
              multiline
              numberOfLines={3}
            />

            {/* ── Anexo ── */}
            <Text style={styles.sectionLabel}>
              Anexo <Text style={styles.optionalTag}>(opcional)</Text>
            </Text>
            <View style={styles.attachmentRow}>
              <Pressable
                style={styles.attachmentButton}
                onPress={pickFromCamera}
              >
                <Text style={styles.attachmentIcon}>📷</Text>
                <Text style={styles.attachmentButtonText}>Câmera</Text>
              </Pressable>
              <Pressable
                style={styles.attachmentButton}
                onPress={pickFromGallery}
              >
                <Text style={styles.attachmentIcon}>🖼️</Text>
                <Text style={styles.attachmentButtonText}>Galeria</Text>
              </Pressable>
              <Pressable style={styles.attachmentButton} onPress={pickDocument}>
                <Text style={styles.attachmentIcon}>📄</Text>
                <Text style={styles.attachmentButtonText}>PDF</Text>
              </Pressable>
            </View>

            {attachment && (
              <View style={styles.attachmentPreviewContainer}>
                {attachment.mimeType.startsWith('image/') ? (
                  <Image
                    source={{ uri: attachment.uri }}
                    style={styles.attachmentImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.attachmentPdfRow}>
                    <Text style={styles.attachmentPdfIcon}>📄</Text>
                    <Text style={styles.attachmentPdfName} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                  </View>
                )}
                <Pressable
                  style={styles.removeAttachment}
                  onPress={() => setAttachment(null)}
                >
                  <Text style={styles.removeAttachmentText}>
                    ✕ Remover anexo
                  </Text>
                </Pressable>
              </View>
            )}

            {/* ── Salvar ── */}
            <Pressable
              style={({ pressed }) => [
                styles.saveButtonPressable,
                pressed && styles.saveButtonPressed,
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              <LinearGradient
                colors={['#75e299', '#2da12b']}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Atualizar Transação' : 'Salvar Transação'}
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>

      {/* Add category modal */}
      <Modal
        visible={showAddCategory}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova Categoria</Text>
            <TextInput
              style={[styles.input, styles.modalInput]}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Ex: academia, lazer, saúde..."
              placeholderTextColor="#CCC"
              autoFocus
              autoCapitalize="none"
              onSubmitEditing={handleAddCategory}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalButtonCancel}
                onPress={() => {
                  setNewCategoryName('');
                  setShowAddCategory(false);
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.modalButtonAdd}
                onPress={handleAddCategory}
              >
                <Text style={styles.modalButtonAddText}>Adicionar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert */}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert((a) => ({ ...a, visible: false }))}
      />
    </View>
  );
}
