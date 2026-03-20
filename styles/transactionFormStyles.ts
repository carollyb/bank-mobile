import { Dimensions, StyleSheet } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
export const SHEET_HEIGHT = SCREEN_HEIGHT * 0.78;

export const transactionFormStyles = StyleSheet.create({
  // ── Overlay ──────────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  // ── Sheet ─────────────────────────────────────────────────────────────────
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 24,
    overflow: 'hidden',
  },

  // ── Handle area ───────────────────────────────────────────────────────────
  handleArea: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '700',
  },

  // ── Form ──────────────────────────────────────────────────────────────────
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AAAAAA',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 22,
  },
  optionalTag: {
    fontSize: 11,
    fontWeight: '400',
    color: '#BBBBBB',
    textTransform: 'none',
    letterSpacing: 0,
  },

  // ── Type chips ────────────────────────────────────────────────────────────
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeChipSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2da12b',
  },
  typeChipIcon: {
    fontSize: 16,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#777',
  },
  typeChipTextSelected: {
    color: '#2da12b',
    fontWeight: '700',
  },
  typeChipDisabled: {
    opacity: 0.68,
  },
  typeChipTextDisabled: {
    color: '#8A8A8A',
  },
  typeLockHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#8F8F8F',
    fontWeight: '500',
  },

  // ── Row (amount + date) ───────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  currencyPrefix: {
    position: 'absolute',
    left: 14,
    fontSize: 16,
    color: '#999',
    zIndex: 1,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
  },
  amountInput: {
    paddingLeft: 38,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  dateButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
  },

  // ── Category chips ────────────────────────────────────────────────────────
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2da12b',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#777',
    textTransform: 'capitalize',
  },
  categoryChipTextSelected: {
    color: '#2da12b',
    fontWeight: '600',
  },
  addCategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#2da12b',
    borderStyle: 'dashed',
  },
  addCategoryText: {
    fontSize: 13,
    color: '#2da12b',
    fontWeight: '600',
  },

  // ── Attachment ────────────────────────────────────────────────────────────
  attachmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  attachmentButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
  },
  attachmentIcon: {
    fontSize: 22,
  },
  attachmentButtonText: {
    fontSize: 12,
    color: '#777',
    fontWeight: '500',
  },
  attachmentPreviewContainer: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    backgroundColor: '#F8F9FA',
  },
  attachmentImage: {
    width: '100%',
    height: 160,
  },
  attachmentPdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  attachmentPdfIcon: {
    fontSize: 26,
  },
  attachmentPdfName: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  removeAttachment: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
  },
  removeAttachmentText: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '600',
  },

  // ── Save button ───────────────────────────────────────────────────────────
  saveButtonPressable: {
    marginTop: 28,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2da12b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  saveButtonGradient: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  saveButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  // ── Add category modal ────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#777',
  },
  modalButtonAdd: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#2da12b',
    alignItems: 'center',
  },
  modalButtonAddText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
