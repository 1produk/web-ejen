import React, { useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Product } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Heart,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Target,
  X
} from 'lucide-react';

interface Props {
  userId: string;
  products: Product[];
  onRefresh: () => void;
}

export const ProductsTab: React.FC<Props> = ({ userId, products, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Kad Perubatan',
    description: '',
    benefits: '',
    priceOrTarget: '',
    actionText: 'Dapatkan Sebut Harga',
    actionUrl: '',
    imageUrl: '',
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Kad Perubatan',
    'Hibah Takaful',
    'Penyakit Kritikal',
    'Perlindungan Pendapatan',
    'Takaful Kemalangan Diri',
    'Simpanan dan Pendidikan',
    'Takaful Berkaitan Pelaburan',
    'Takaful Keluarga',
    'Takaful Perjalanan',
    'Takaful Am',
  ];

  const categoryPresets: Record<string, { desc: string; benefits: string; price: string; action: string }> = {
    'Kad Perubatan': {
      desc: 'Membantu menampung kos rawatan dan kemasukan ke hospital swasta dengan kemudahan bilik peribadi dan kemasukan tanpa tunai (cashless).',
      benefits: 'Had tahunan tinggi sehingga RM1.5 Juta, tiada ko-takaful, perlindungan rawatan kanser pesakit luar.',
      price: 'Bermula RM90/bulan',
      action: 'Dapatkan Sebut Harga Kad',
    },
    'Hibah Takaful': {
      desc: 'Menyediakan manfaat tunai segera kepada penerima/waris apabila peserta meninggal dunia atau mengalami hilang upaya kekal, mengikut sijil.',
      benefits: 'Pampasan RM250,000 - RM1,000,000 terus kepada waris tanpa melalui faraid atau probet, pelepasan cukai pendapatan.',
      price: 'Bermula RM85/bulan',
      action: 'Kira Kelayakan Hibah',
    },
    'Penyakit Kritikal': {
      desc: 'Manfaat kewangan apabila peserta disahkan menghidap penyakit kritikal yang dilindungi bagi rawatan alternatif dan sara hidup.',
      benefits: 'Pampasan tunai one-off peringkat awal & akhir, penepian bayaran caruman seterusnya.',
      price: 'Bermula RM75/bulan',
      action: 'Konsultasi Percuma',
    },
    'Perlindungan Pendapatan': {
      desc: 'Membantu menyediakan sokongan kewangan jika peserta tidak dapat bekerja akibat hilang upaya atau keuzuran dilindungi.',
      benefits: 'Penggantian pendapatan bulanan selama 5 hingga 10 tahun demi masa depan keluarga.',
      price: 'Bermula RM100/bulan',
      action: 'Runding Pelan Gaji',
    },
    'Takaful Kemalangan Diri': {
      desc: 'Perlindungan bagi kecederaan, hilang upaya atau kematian akibat kemalangan 24 jam di seluruh dunia.',
      benefits: 'Pampasan kemalangan berganda di pengangkutan awam, elaun kemasukan wad harian.',
      price: 'Bermula RM35/bulan',
      action: 'Daftar Pelan Kemalangan',
    },
    'Simpanan dan Pendidikan': {
      desc: 'Pelan yang menggabungkan simpanan disiplin dengan perlindungan takaful untuk dana universiti anak.',
      benefits: 'Ganjaran kecemerlangan akademik SPM/Ijazah, penepian caruman jika pembayar tiada.',
      price: 'Bermula RM120/bulan',
      action: 'Rancang Tabung Pendidikan',
    },
    'Takaful Berkaitan Pelaburan': {
      desc: 'Perlindungan bersama nilai pelaburan patuh syariah yang tertakluk kepada prestasi dana.',
      benefits: 'Pilihan dana ekuiti dan sukuk tempatan/global patuh syariah diurus pengurus dana berlesen.',
      price: 'Bermula RM150/bulan',
      action: 'Semak Prestasi Dana',
    },
    'Takaful Keluarga': {
      desc: 'Perlindungan untuk diri sendiri, pasangan dan anak-anak di bawah satu pelan komprehensif.',
      benefits: 'Perkongsian had tahunan sekeluarga, penjimatan caruman berbanding sijil individu.',
      price: 'Bermula RM280/keluarga',
      action: 'Dapatkan Pakej Keluarga',
    },
    'Takaful Perjalanan': {
      desc: 'Perlindungan berkaitan perjalanan domestik dan luar negara, termasuk kelewatan dan rawatan kecemasan.',
      benefits: 'Perbelanjaan perubatan luar negara, kehilangan pasport dan bagasi, bantuan kecemasan 24 jam.',
      price: 'Bermula RM30/perjalanan',
      action: 'Lindungi Perjalanan',
    },
    'Takaful Am': {
      desc: 'Perlindungan kenderaan bermotor, rumah kediaman, harta benda atau perniagaan daripada kerosakan dan kebakaran.',
      benefits: 'Perlindungan bencana alam banjir/ribut, bantuan tunda kenderaan percuma 24/7.',
      price: 'Mengikut NCD & Nilai Pasaran',
      action: 'Sebut Harga Insurans/Takaful',
    },
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    const defaultCat = 'Kad Perubatan';
    const preset = categoryPresets[defaultCat];
    setForm({
      title: 'Kad Perubatan VIP Hospital Swasta',
      category: defaultCat,
      description: preset.desc,
      benefits: preset.benefits,
      priceOrTarget: preset.price,
      actionText: preset.action,
      actionUrl: '',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      isActive: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      title: p.title,
      category: p.category || 'Kad Perubatan',
      description: p.description,
      benefits: p.benefits || '',
      priceOrTarget: p.priceOrTarget || '',
      actionText: p.actionText || 'Dapatkan Sebut Harga',
      actionUrl: p.actionUrl || '',
      imageUrl: p.imageUrl || '',
      isActive: p.isActive !== false,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Sila muat naik fail gambar.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Saiz imej tidak boleh melebihi 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({ ...prev, imageUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Sila masukkan nama produk atau kempen.');
      return;
    }

    setSaving(true);
    setError(null);
    const now = new Date().toISOString();

    try {
      if (editingProduct) {
        const docRef = doc(db, 'products', editingProduct.id);
        await updateDoc(docRef, {
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          benefits: form.benefits.trim(),
          priceOrTarget: form.priceOrTarget.trim(),
          actionText: form.actionText.trim(),
          actionUrl: form.actionUrl.trim(),
          imageUrl: form.imageUrl,
          isActive: form.isActive,
          updatedAt: now,
        });
      } else {
        const newSortOrder = products.length;
        await addDoc(collection(db, 'products'), {
          userId,
          landingPageId: userId,
          title: form.title.trim(),
          category: form.category,
          description: form.description.trim(),
          benefits: form.benefits.trim(),
          priceOrTarget: form.priceOrTarget.trim(),
          actionText: form.actionText.trim(),
          actionUrl: form.actionUrl.trim(),
          imageUrl: form.imageUrl,
          sortOrder: newSortOrder,
          isActive: form.isActive,
          createdAt: now,
          updatedAt: now,
        });
      }

      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Gagal menyimpan produk.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const currentProd = products[index];
    const targetProd = products[targetIndex];

    try {
      await updateDoc(doc(db, 'products', currentProd.id), { sortOrder: targetIndex });
      await updateDoc(doc(db, 'products', targetProd.id), { sortOrder: index });
      onRefresh();
    } catch (err) {
      console.error('Error reordering products:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Senarai Pelan & Produk Takaful</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Urus pelan perlindungan Kad Perubatan, Hibah, Penyakit Kritikal dan Simpanan yang anda wakili.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelan Takaful</span>
          </button>
        </div>

        {/* Product List */}
        <div className="mt-6">
          {products.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-base">Belum Ada Pelan Takaful</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Cipta pelan takaful anda atau gunakan templat asas kami untuk dipaparkan kepada bakal peserta.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Tambah Pelan Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p, idx) => (
                <div
                  key={p.id}
                  className={`border rounded-xl p-4 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    p.isActive ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50/70 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Sort buttons */}
                    <div className="flex flex-col gap-1 text-slate-400">
                      <button
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0}
                        className="hover:text-slate-800 disabled:opacity-20 p-0.5"
                        title="Alih ke atas"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === products.length - 1}
                        className="hover:text-slate-800 disabled:opacity-20 p-0.5"
                        title="Alih ke bawah"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Image thumb */}
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          <Heart className="w-5 h-5 opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                        {!p.isActive && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            Tidak Aktif
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1 truncate">{p.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {p.priceOrTarget && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        {p.priceOrTarget}
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition"
                      title="Ubah"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Padam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Padam Pelan Takaful?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tindakan ini tidak boleh diundur dan item ini akan dikeluarkan dari landing page anda.
            </p>
            <div className="mt-5 flex gap-2 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
              >
                Ya, Padam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold">
                {editingProduct ? 'Kemas Kini Pelan Takaful' : 'Tambah Pelan Takaful Baharu'}
              </h3>
              <p className="text-emerald-100 text-xs mt-0.5">
                Isi butiran pelan takaful untuk dipaparkan secara jelas kepada bakal peserta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pelan Takaful <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Kad Perubatan VIP Hospital Swasta"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Takaful</label>
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const preset = categoryPresets[newCat];
                      if (preset && !editingProduct) {
                        setForm({
                          ...form,
                          category: newCat,
                          title: form.title === '' || form.title.includes('Pelan') || form.title.includes('Kad') ? `Pelan ${newCat} Komprehensif` : form.title,
                          description: preset.desc,
                          benefits: preset.benefits,
                          priceOrTarget: preset.price,
                          actionText: preset.action,
                        });
                      } else {
                        setForm({ ...form, category: newCat });
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Anggaran Caruman (Pilihan)
                  </label>
                  <input
                    type="text"
                    value={form.priceOrTarget}
                    onChange={(e) => setForm({ ...form, priceOrTarget: e.target.value })}
                    placeholder="Contoh: Bermula RM85/bulan atau Pampasan RM500k"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Penerangan Perlindungan</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Terangkan ringkasan perlindungan dan fungsi pelan ini untuk klien."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manfaat Utama Pelan (Pilihan)
                </label>
                <textarea
                  rows={2}
                  value={form.benefits}
                  onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                  placeholder="Contoh: Had tahunan RM1.5 Juta, Bilik Single, Tiada Co-takaful, Elaun Wad RM150/hari."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teks Butang Tindakan</label>
                  <input
                    type="text"
                    value={form.actionText}
                    onChange={(e) => setForm({ ...form, actionText: e.target.value })}
                    placeholder="Contoh: Dapatkan Sebut Harga"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pautan Tindakan (Pilihan)
                  </label>
                  <input
                    type="text"
                    value={form.actionUrl}
                    onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
                    placeholder="Kosongkan untuk pautan terus WhatsApp"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gambar Produk / Poster</label>
                <div className="flex items-center gap-3">
                  {form.imageUrl && (
                    <img
                      src={form.imageUrl}
                      alt="Pratonton"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                    />
                  )}
                  <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{form.imageUrl ? 'Tukar Gambar' : 'Muat Naik Gambar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="text-xs text-rose-600 hover:underline font-medium"
                    >
                      Buang
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Aktifkan paparan pelan ini di landing page
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : editingProduct ? 'Kemaskini' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
