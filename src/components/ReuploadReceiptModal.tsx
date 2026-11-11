import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Upload, CheckCircle, AlertCircle, FileText, Trash2, RefreshCw, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReuploadReceiptModal: React.FC<Props> = ({
  isOpen,
  orderId,
  onClose,
  onSuccess,
}) => {
  const { reuploadReceipt } = useAuth();
  const [receiptFile, setReceiptFile] = useState<{
    dataUrl: string;
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [receiptNote, setReceiptNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Saiz fail melebihi had 5MB. Sila pilih fail yang lebih kecil.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Format fail tidak disokong. Sila pilih JPG, PNG atau PDF.');
      return;
    }

    setError(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setReceiptFile({
              dataUrl: compressed,
              name: file.name,
              size: file.size,
              type: file.type,
            });
          }
        };
        img.src = loadEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setReceiptFile({
          dataUrl: loadEvent.target?.result as string,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      setError('Sila muat naik fail slip bayaran.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await reuploadReceipt(orderId, receiptFile.dataUrl, receiptNote.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat naik slip. Sila cuba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-1.5 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/30 px-2 py-0.5 rounded-full">
            Kemas Kini Bukti Pembayaran
          </span>
          <h3 className="text-lg font-black text-white mt-1">Muat Naik Semula Slip</h3>
          <p className="text-xs text-emerald-100 mt-0.5 font-mono">
            Pesanan: {orderId}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
          />

          {!receiptFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Pilih fail slip bayaran baru
              </p>
              <p className="text-[10px] text-slate-500">
                JPG, PNG atau PDF sehingga 5MB
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {receiptFile.type.startsWith('image/') ? (
                  <img
                    src={receiptFile.dataUrl}
                    alt="Slip"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-300 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {receiptFile.name}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>{(receiptFile.size / 1024).toFixed(0)} KB</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                  title="Tukar fail"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptFile(null)}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                  title="Padam"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / No. Rujukan Transaksi
            </label>
            <input
              type="text"
              value={receiptNote}
              onChange={(e) => setReceiptNote(e.target.value)}
              placeholder="Contoh: No. Rujukan OnPay / FPX atau penjelasan tambahan"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !receiptFile}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menghantar...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Hantar Slip Baru</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
