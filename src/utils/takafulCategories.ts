export interface TakafulCategoryInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
  defaultActionText: string;
  sampleBenefits: string;
  samplePrice: string;
}

export const TAKAFUL_CATEGORIES: TakafulCategoryInfo[] = [
  {
    id: 'kad-perubatan',
    name: 'Kad Perubatan',
    description: 'Membantu menampung kos rawatan dan kemasukan ke hospital swasta dengan had tahunan yang tinggi.',
    iconName: 'Activity',
    defaultActionText: 'Semak Kelayakan Kad',
    sampleBenefits: 'Had tahunan sehingga RM1.5 Juta, tiada ko-takaful, perlindungan bilik hospital peribadi.',
    samplePrice: 'Bermula RM90/bulan',
  },
  {
    id: 'hibah-takaful',
    name: 'Hibah Takaful',
    description: 'Menyediakan manfaat kewangan kepada penerima apabila peserta meninggal dunia atau hilang upaya kekal, mengikut sijil.',
    iconName: 'Shield',
    defaultActionText: 'Kira Nilai Hibah',
    sampleBenefits: 'Pampasan tunai RM250,000 - RM1,000,000 terus kepada waris tanpa melalui faraid atau probet.',
    samplePrice: 'Bermula RM80/bulan',
  },
  {
    id: 'penyakit-kritikal',
    name: 'Penyakit Kritikal',
    description: 'Manfaat kewangan apabila peserta disahkan menghidap penyakit kritikal yang dilindungi.',
    iconName: 'HeartPulse',
    defaultActionText: 'Dapatkan Sebut Harga',
    sampleBenefits: 'Perlindungan sehingga 45 jenis penyakit kritikal utama termasuk kanser, strok, dan serangan jantung.',
    samplePrice: 'Bermula RM75/bulan',
  },
  {
    id: 'perlindungan-pendapatan',
    name: 'Perlindungan Pendapatan',
    description: 'Membantu menyediakan sokongan kewangan jika peserta tidak dapat bekerja akibat keadaan yang dilindungi.',
    iconName: 'TrendingUp',
    defaultActionText: 'Rundingan Kewangan',
    sampleBenefits: 'Penggantian gaji bulanan sehingga 5-10 tahun perbelanjaan isi rumah bagi mengekalkan taraf hidup.',
    samplePrice: 'Bermula RM100/bulan',
  },
  {
    id: 'kemalangan-diri',
    name: 'Takaful Kemalangan Diri',
    description: 'Perlindungan bagi kecederaan, hilang upaya atau kematian akibat kemalangan 24 jam di seluruh dunia.',
    iconName: 'AlertTriangle',
    defaultActionText: 'Mohon Sekarang',
    sampleBenefits: 'Pampasan berganda kemalangan jalan raya/pengangkutan awam, elaun kemasukan hospital harian.',
    samplePrice: 'Bermula RM35/bulan',
  },
  {
    id: 'simpanan-pendidikan',
    name: 'Simpanan dan Pendidikan',
    description: 'Pelan yang menggabungkan simpanan disiplin dengan perlindungan takaful untuk masa depan anak.',
    iconName: 'GraduationCap',
    defaultActionText: 'Rancang Pendidikan Anak',
    sampleBenefits: 'Ganjaran kecemerlangan akademik PT3/SPM/Ijazah, penepian caruman takaful jika pembayar meninggal dunia.',
    samplePrice: 'Bermula RM120/bulan',
  },
  {
    id: 'pelaburan',
    name: 'Takaful Berkaitan Pelaburan',
    description: 'Perlindungan bersama nilai pelaburan patuh syariah yang tertakluk kepada prestasi dana.',
    iconName: 'Coins',
    defaultActionText: 'Ketahui Prestasi Dana',
    sampleBenefits: 'Kepelbagaian dana ekuiti dan sukuk patuh syariah diuruskan oleh pengurus dana profesional.',
    samplePrice: 'Bermula RM150/bulan',
  },
  {
    id: 'keluarga',
    name: 'Takaful Keluarga',
    description: 'Perlindungan komprehensif merangkumi diri sendiri, pasangan dan anak-anak di bawah satu sijil.',
    iconName: 'Users',
    defaultActionText: 'Pakej 1 Keluarga',
    sampleBenefits: 'Satu pelan mudah menjimatkan kos untuk seluruh ahli keluarga dengan perkongsian had tahunan.',
    samplePrice: 'Bermula RM280/keluarga',
  },
  {
    id: 'perjalanan',
    name: 'Takaful Perjalanan',
    description: 'Perlindungan berkaitan perjalanan domestik dan antarabangsa, termasuk pembatalan dan rawatan kecemasan.',
    iconName: 'Plane',
    defaultActionText: 'Dapatkan Perlindungan Trip',
    sampleBenefits: 'Pampasan kelewatan penerbangan, kehilangan bagasi, pemindahan perubatan kecemasan antarabangsa.',
    samplePrice: 'Bermula RM25/perjalanan',
  },
  {
    id: 'takaful-am',
    name: 'Takaful Am (Kenderaan / Rumah)',
    description: 'Perlindungan kenderaan, rumah kediaman, harta benda atau perniagaan daripada kebakaran dan bencana.',
    iconName: 'Home',
    defaultActionText: 'Dapatkan Sebut Harga Roadtax/Rumah',
    sampleBenefits: 'Perlindungan komprehensif banjir/tanah runtuh, tunda kenderaan percuma 24 jam.',
    samplePrice: 'Mengikut NCD & Nilai Pasaran',
  },
];

export const TAKAFUL_OPERATORS = [
  'Prudential BSN Takaful',
  'Great Eastern Takaful',
  'AIA Public Takaful',
  'Takaful Ikhlas',
  'FWD Takaful',
  'Zurich Takaful',
  'Hong Leong MSIG Takaful',
  'Sun Life Malaysia Takaful',
  'Syarikat Takaful Malaysia Am/Keluarga',
  'Etiqa Takaful',
];
