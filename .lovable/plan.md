

# HUDA - Yerel Secim Kampanya Platformu Tanitim Sayfasi

## Ozet
`/huda` rotasinda HUDA icin Turkce bir tanitim sayfasi olusturulacak. Tasarim `/tanitim` sayfasinin "Stark Minimal" GovTech estetigi ile ayni olacak. Fiyatlandirma yok. Icerik tamamen Turkce.

## Sayfa Yapisi (10 bolum)

### 1. Header
- Portolan Labs logosu + "Siteye don" linki
- `/tanitim` ile ayni minimal yapi

### 2. HudaHero
- Etiket: "Gizli Urun Dosyasi"
- Baslik: **"Yerel secimler icin yapay zeka destekli kampanya istihbarati"**
- Alt baslik: "Secmen segmentasyonu. Cok kanalli erisim. Anlik analitik. Tek platform."
- Metrikler: **81 il** | **973 ilce** | **5 kanal**
- Guven gostergeleri: KVKK uyumlu, Yerinde kurulum, Anlik analitik

### 3. HudaMarketContext - "Stratejik Baglam"
- Istatistikler: 64M+ kayitli secmen, 81 il, 973 ilce
- Mevcut kampanya araclarinin daginik yapisi vurgusu

### 4. HudaProblem - "Sorun"
- "Mevcut kampanya araclari daginik ve manuel"
- 6 sorun karti: yapay zeka segmentasyonu yok, kanallararasi kopukluk, geri bildirim dongusu yok, saha takibi manuel, duygu analizi yok, demografik kor noktalar

### 5. HudaSolution - "Cozum"
- "Butunlesik kampanya istihbarati"
- Dort modul: Secmen Istihbarati, Erisim Motoru, Saha Operasyonlari, Analitik Paneli

### 6. HudaMockups - "Platform Goruntuleri"
- Uc sekmeli UI mockup:
  - **Kontrol Paneli**: Secmen segmentasyonu pasta grafigi, performans cizgi grafigi, KPI kartlari (erisim, etkilesim, donusum) - recharts ile
  - **Erisim Motoru**: Cok kanalli mesaj olusturucu, kanal secimi (SMS/WhatsApp/Sosyal), hedef kitle filtreleri
  - **Saha Operasyonlari**: Ekip atamalari, ziyaret kayitlari, ilce kapsama ilerleme cubuklar

### 7. HudaTechnology - "Teknik Altyapi"
- "Siyasi operasyonlar icin olceklenebilir altyapi"
- Yetenekler: Yapay zeka secmen segmentasyonu, anlik duygu takibi, cok kanalli orkestrasyon, cevrimdisi mobil
- Metrikler: <2sn segmentasyon, 5 kanal, 81 il, anlik senkronizasyon

### 8. HudaComparison - "Karsilastirma"
- "Manuel kampanyalar vs. HUDA"
- Tablo: secmen segmentasyonu, cok kanal senkronizasyonu, anlik analitik, saha takibi, duygu analizi, KVKK uyumu

### 9. HudaTimeline - "Yol Haritasi"
- 12 aylik gelistirme plani:
  - Faz 1 (1-2 ay): MVP, temel segmentasyon + SMS
  - Faz 2 (3-5 ay): Cok kanal + saha operasyonlari
  - Faz 3 (6-8 ay): Yapay zeka optimizasyonu + duygu analizi
  - Faz 4 (9-12 ay): Tam platform + ileri analitik

### 10. HudaFooter
- "HUDA by Portolan Labs"
- Guven rozetleri + belge siniflandirmasi

## Teknik Detaylar

### Yeni Dosyalar
- `src/pages/Huda.tsx` - Sayfa bileseni
- `src/components/huda/HudaHero.tsx`
- `src/components/huda/HudaMarketContext.tsx`
- `src/components/huda/HudaProblem.tsx`
- `src/components/huda/HudaSolution.tsx`
- `src/components/huda/HudaMockups.tsx` - Sekmeli mockup panelleri (recharts grafikleri ile)
- `src/components/huda/HudaTechnology.tsx`
- `src/components/huda/HudaComparison.tsx`
- `src/components/huda/HudaTimeline.tsx`
- `src/components/huda/HudaFooter.tsx`

### Degistirilecek Dosyalar
- `src/App.tsx` - `/huda` rotasi eklenir

### Tasarim Yaklasimu
- `/tanitim` ile ayni minimal estetik
- Mevcut `accent` renk tokeni (teal)
- Mockup'lar Tailwind + recharts ile CSS kompozisyonlari olarak
- Mevcut UI bilesenleri (Card, Badge, Tabs) kullanilacak
- Fiyatlandirma yok
- Kisa, net Turkce metin, em dash yok
