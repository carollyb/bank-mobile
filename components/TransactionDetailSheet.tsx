import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { useBottomSheetMotion } from '@/hooks/use-bottom-sheet-motion';
import { SHEET_HEIGHT } from '@/styles/transactionFormStyles';
import { Transaction } from '@/types/transaction.type';
import { TYPE_META } from '@/types/type-meta.types';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

type TransactionDetailSheetProps = {
  visible: boolean;
  item: Transaction | null;
  onClose: () => void;
  onDelete: (item: Transaction) => void;
  showActions?: boolean;
};

const isPdfUrl = (url: string): boolean => /\.pdf($|\?)/i.test(url);

export function TransactionDetailSheet({
  visible,
  item,
  onClose,
  onDelete,
  showActions = true,
}: TransactionDetailSheetProps) {
  const { animatedStyle, closeSheet, panGesture } = useBottomSheetMotion({
    visible,
    hiddenY: SHEET_HEIGHT,
    onClose,
  });

  if (!item) return null;

  const meta = TYPE_META[item.type];
  const typeAccentColor = '#2D6CDF';
  const positive = item.value >= 0;
  const attachmentUrl = item.urlAnexo;
  const hasAttachment = !!attachmentUrl;
  const attachmentIsPdf = hasAttachment && isPdfUrl(attachmentUrl);

  const handleEdit = () => {
    onClose();
    router.push(`/(protected)/transactions/transaction-form?id=${item.id}`);
  };

  const handleDelete = () => {
    onClose();
    onDelete(item);
  };

  const handleOpenAttachment = async () => {
    if (!attachmentUrl) return;
    await Linking.openURL(attachmentUrl);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={closeSheet} />

          <Animated.View style={[styles.sheet, animatedStyle]}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleArea}>
                <View style={styles.handle} />

                <View style={styles.headerRow}>
                  <Pressable onPress={closeSheet} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </Pressable>
                </View>
              </View>
            </GestureDetector>

            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: typeAccentColor + '10',
                    borderColor: typeAccentColor + '2E',
                  },
                ]}
              >
                <View
                  style={[
                    styles.typeIconContainer,
                    { backgroundColor: typeAccentColor + '1E' },
                  ]}
                >
                  <Text style={[styles.typeIcon, { color: typeAccentColor }]}>
                    {meta.icon}
                  </Text>
                </View>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeLabel}>Tipo da transação</Text>
                  <Text style={[styles.typeValue, { color: typeAccentColor }]}>
                    {meta.label}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Valor</Text>
                <Text
                  style={[
                    styles.value,
                    { color: positive ? '#2da12b' : '#E53935' },
                  ]}
                >
                  {positive ? '+' : ''}
                  {formatCurrency(item.value)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Data</Text>
                <Text style={styles.text}>{formatDate(item.date)}</Text>
              </View>

              {item.category ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Categoria</Text>
                  <Text style={styles.text}>{item.category}</Text>
                </View>
              ) : null}

              {item.description ? (
                <View style={styles.block}>
                  <Text style={styles.label}>Descrição</Text>
                  <Text style={styles.text}>{item.description}</Text>
                </View>
              ) : null}

              {item.type === 'transfer' ? (
                <>
                  {item.to ? (
                    <View style={styles.row}>
                      <Text style={styles.label}>Para</Text>
                      <Text style={styles.text}>{item.to}</Text>
                    </View>
                  ) : null}
                </>
              ) : null}

              {hasAttachment ? (
                <View style={styles.block}>
                  <Text style={styles.label}>Anexo</Text>
                  {attachmentIsPdf ? (
                    <Pressable
                      style={styles.pdfButton}
                      onPress={handleOpenAttachment}
                    >
                      <Text style={styles.pdfButtonText}>Abrir PDF</Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={handleOpenAttachment}>
                      <Image
                        source={{ uri: attachmentUrl }}
                        style={styles.image}
                        contentFit="cover"
                      />
                      <Text style={styles.linkText}>
                        Toque para abrir em tela externa
                      </Text>
                    </Pressable>
                  )}
                </View>
              ) : null}
            </ScrollView>

            {showActions && (
              <View style={styles.actionsRow}>
                <Pressable style={styles.editButton} onPress={handleEdit}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteButtonText}>Excluir</Text>
                </Pressable>
              </View>
            )}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 20,
  },
  handleArea: {
    paddingTop: 4,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D6D6D6',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F3F5',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '700',
  },
  content: {
    paddingBottom: 8,
    gap: 12,
  },
  typeCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIcon: {
    fontSize: 15,
    fontWeight: '700',
  },
  typeInfo: {
    gap: 2,
  },
  typeLabel: {
    fontSize: 12,
    color: '#6E6E6E',
    fontWeight: '600',
  },
  typeValue: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingBottom: 10,
  },
  block: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingBottom: 10,
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#6E6E6E',
    fontWeight: '600',
  },
  text: {
    fontSize: 15,
    color: '#1F1F1F',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  image: {
    width: '100%',
    height: 170,
    borderRadius: 14,
    backgroundColor: '#F4F5F7',
  },
  linkText: {
    marginTop: 8,
    fontSize: 12,
    color: '#2D6CDF',
    fontWeight: '600',
  },
  pdfButton: {
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#C7D9F8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  pdfButtonText: {
    fontSize: 14,
    color: '#1F4FA0',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  editButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#E9F7EC',
    borderWidth: 1,
    borderColor: '#8FD19A',
  },
  editButtonText: {
    color: '#146C2E',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#FDF0F0',
    borderWidth: 1,
    borderColor: '#F0A6A6',
  },
  deleteButtonText: {
    color: '#B71C1C',
    fontSize: 14,
    fontWeight: '700',
  },
});
