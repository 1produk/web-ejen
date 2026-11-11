import React from 'react';
import { Sparkles, Heart, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

interface Props {
  onOpenConfigGuide: () => void;
}

export const Footer: React.FC<Props> = ({ onOpenConfigGuide }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <span className="font-black text-white text-base tracking-tight">TAKAFUL Builder</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Sistem penerbitan landing page perunding Takaful tahunan berkuasa Firebase. Menghubungkan orang awam dan bakal peserta dengan pelan perlindungan Takaful patuh syariah yang telus.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Pematuhan Keselamatan Zero-Trust</span>
            </div>
          </div>

          {/* Col 2: Pelan & Harga */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Pelan Langganan</h4>
            <ul className="space-y-2">
              <li className="text-slate-300 font-medium">Langganan Tahunan: RM 150.00</li>
              <li>Tempoh Akses: 365 Hari</li>
              <li>Pengesahan Manual oleh Admin</li>
              <li>Peringatan Tamat Tempoh 30/14/3 Hari</li>
              <li>Pilihan Pembaharuan Mudah</li>
            </ul>
          </div>

          {/* Col 3: Templat & Ciri */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Templat Reka Bentuk</h4>
            <ul className="space-y-2">
              <li>Templat 1: Profil Profesional</li>
              <li>Templat 2: Fokus Produk & Pelan</li>
              <li>Templat 3: Ringkas dan Terus (Mobile-First)</li>
              <li>10 Kategori Pelan Takaful Standard</li>
              <li>5 Pilihan Tema Warna Eksklusif</li>
              <li>Pautan Slug Tersuai (/p/slug)</li>
            </ul>
          </div>

          {/* Col 4: Hubungi Kami */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Sokongan & Bantuan</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>infaq.my@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>+60 12-901 0345 (WhatsApp)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Kuala Lumpur, Malaysia</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenConfigGuide}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Panduan Konfigurasi Firebase →
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} TAKAFUL Landing Page Builder. Hak cipta terpelihara.</p>
          <p className="flex items-center gap-1">
            Dibina untuk perunding Takaful profesional & pemerkasaan perlindungan patuh syariah.
          </p>
        </div>
      </div>
    </footer>
  );
};
