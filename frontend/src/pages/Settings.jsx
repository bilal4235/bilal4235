import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Type, BookOpen, Heart, Bell, Settings as SettingsIcon, Trophy, Calendar, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  
  // localStorage'dan ayarları yükle
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ilmihal_darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('ilmihal_fontSize') || 'medium';
  });
  
  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('ilmihal_fontFamily') || 'default';
  });
  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('ilmihal_notifications');
    return saved ? JSON.parse(saved) : true;
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('ilmihal_accentColor') || 'teal';
  });

  // Tema değişikliklerini uygula
  useEffect(() => {
    // Dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1a1a2e';
      document.body.style.color = '#e0e0e0';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f0f7f4';
      document.body.style.color = '#2c5f6f';
    }
    localStorage.setItem('ilmihal_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Font boyutu değişikliklerini uygula
  useEffect(() => {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    document.documentElement.style.fontSize = sizes[fontSize];
    localStorage.setItem('ilmihal_fontSize', fontSize);
  }, [fontSize]);

  // Font ailesi değişikliklerini uygula
  useEffect(() => {
    const fonts = {
      default: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      serif: "'Georgia', 'Times New Roman', serif",
      arabic: "'Amiri', 'Traditional Arabic', serif",
      modern: "'Poppins', 'Montserrat', sans-serif"
    };
    document.body.style.fontFamily = fonts[fontFamily];
    localStorage.setItem('ilmihal_fontFamily', fontFamily);
  }, [fontFamily]);

  // Accent renk değişikliklerini uygula
  useEffect(() => {
    const colors = {
      teal: { primary: '#4f8c9f', secondary: '#2c5f6f' },
      green: { primary: '#4a9f6e', secondary: '#2c6f4a' },
      blue: { primary: '#4a7fb5', secondary: '#2c4a6f' },
      purple: { primary: '#8f6fb5', secondary: '#5f4a8f' }
    };
    const color = colors[accentColor];
    document.documentElement.style.setProperty('--color-primary', color.primary);
    document.documentElement.style.setProperty('--color-secondary', color.secondary);
    localStorage.setItem('ilmihal_accentColor', accentColor);
  }, [accentColor]);

  // Bildirim ayarını kaydet
  useEffect(() => {
    localStorage.setItem('ilmihal_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleReset = () => {
    setDarkMode(false);
    setFontSize('medium');
    setFontFamily('default');
    setAccentColor('teal');
    setNotifications(true);
    toast.success('Ayarlar varsayılana sıfırlandı!');
  };

  const colorOptions = [
    { id: 'teal', name: 'Turkuaz', color: '#4f8c9f' },
    { id: 'green', name: 'Yeşil', color: '#4a9f6e' },
    { id: 'blue', name: 'Mavi', color: '#4a7fb5' },
    { id: 'purple', name: 'Mor', color: '#8f6fb5' }
  ];

  return (
    <div className={`page-container pb-24 ${darkMode ? 'dark-mode' : ''}`}>
      <div className="mb-6">
        <Button
          data-testid="back-button"
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#4f8c9f] hover:text-[#2c5f6f]"
        >
          <ArrowLeft size={20} />
          Geri
        </Button>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2c5f6f] mb-6" data-testid="settings-title">
          ⚙️ Ayarlar
        </h1>

        <div className="space-y-6">
          {/* Tema Ayarları */}
          <div className={`glass-effect p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : ''}`}>
            <h2 className="text-xl font-semibold text-[#2c5f6f] mb-4 flex items-center gap-2">
              <Palette size={24} />
              Tema Ayarları
            </h2>
            
            {/* Karanlık Mod */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={24} className="text-[#4f8c9f]" /> : <Sun size={24} className="text-[#4f8c9f]" />}
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">Karanlık Mod</Label>
                  <p className="text-sm text-[#6b9dad]">Gözlerinizi dinlendirin</p>
                </div>
              </div>
              <Switch
                data-testid="dark-mode-toggle"
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            {/* Renk Seçimi */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <Label className="font-medium mb-3 block">Tema Rengi</Label>
              <div className="flex gap-3">
                {colorOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setAccentColor(option.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      accentColor === option.id ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: option.color }}
                    title={option.name}
                  >
                    {accentColor === option.id && <Check size={20} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Yazı Ayarları */}
          <div className={`glass-effect p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : ''}`}>
            <h2 className="text-xl font-semibold text-[#2c5f6f] mb-4 flex items-center gap-2">
              <Type size={24} />
              Yazı Ayarları
            </h2>
            
            {/* Yazı Boyutu */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <Label className="font-medium mb-3 block">Yazı Boyutu</Label>
              <RadioGroup value={fontSize} onValueChange={setFontSize} className="grid grid-cols-2 gap-2">
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${fontSize === 'small' ? 'border-[#4f8c9f] bg-[#4f8c9f]/10' : 'border-gray-200'}`}>
                  <RadioGroupItem value="small" id="small" data-testid="font-size-small" />
                  <Label htmlFor="small" className="cursor-pointer text-sm">Küçük (14px)</Label>
                </div>
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${fontSize === 'medium' ? 'border-[#4f8c9f] bg-[#4f8c9f]/10' : 'border-gray-200'}`}>
                  <RadioGroupItem value="medium" id="medium" data-testid="font-size-medium" />
                  <Label htmlFor="medium" className="cursor-pointer">Orta (16px)</Label>
                </div>
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${fontSize === 'large' ? 'border-[#4f8c9f] bg-[#4f8c9f]/10' : 'border-gray-200'}`}>
                  <RadioGroupItem value="large" id="large" data-testid="font-size-large" />
                  <Label htmlFor="large" className="cursor-pointer text-lg">Büyük (18px)</Label>
                </div>
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${fontSize === 'xlarge' ? 'border-[#4f8c9f] bg-[#4f8c9f]/10' : 'border-gray-200'}`}>
                  <RadioGroupItem value="xlarge" id="xlarge" data-testid="font-size-xlarge" />
                  <Label htmlFor="xlarge" className="cursor-pointer text-xl">Çok Büyük (20px)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Yazı Tipi */}
            <div>
              <Label className="font-medium mb-3 block">Yazı Tipi</Label>
              <RadioGroup value={fontFamily} onValueChange={setFontFamily} className="space-y-2">
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${fontFamily === 'default' ? 'border-[#4f8c9f] bg-[#4f8c9f]/10' : 'border-gray-200'}`}>
                  <RadioGroupItem value="default" id="font-default" />
                  <Label htmlFor="font-default" className="cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Varsayılan (Inter)
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${fontFamily === 'serif' ? 'border-[#4f8c9f] bg-[#4f8c9f]/10' : 'border-gray-200'}`}>
                  <RadioGroupItem value="serif" id="font-serif" />
                  <Label htmlFor="font-serif" className="cursor-pointer" style={{ fontFamily: 'Georgia, serif' }}>
                    Klasik (Georgia)
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 p-3 rounded-lg border ${fontFamily === 'modern' ? 'border-[#4f8c9f] bg-[#4f8c9f]/10' : 'border-gray-200'}`}>
                  <RadioGroupItem value="modern" id="font-modern" />
                  <Label htmlFor="font-modern" className="cursor-pointer" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Modern (Poppins)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Önizleme */}
            <div className="mt-4 p-4 bg-[#f5fafb] rounded-xl">
              <p className="text-sm text-[#6b9dad] mb-2">Önizleme:</p>
              <p className="text-[#2c5f6f]">
                Bismillahirrahmanirrahim. Rahman ve Rahim olan Allah'ın adıyla.
              </p>
            </div>
          </div>

          {/* Bildirim Ayarları */}
          <div className={`glass-effect p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : ''}`}>
            <h2 className="text-xl font-semibold text-[#2c5f6f] mb-4 flex items-center gap-2">
              <Bell size={24} />
              Bildirim Ayarları
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={24} className="text-[#4f8c9f]" />
                <div>
                  <Label htmlFor="notifications" className="font-medium">Hatırlatma Bildirimleri</Label>
                  <p className="text-sm text-[#6b9dad]">Namaz ve dua hatırlatmalarını al</p>
                </div>
              </div>
              <Switch
                data-testid="notifications-toggle"
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>

          {/* Hakkında */}
          <div className={`glass-effect p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : ''}`}>
            <h2 className="text-xl font-semibold text-[#2c5f6f] mb-4">📱 Uygulama Hakkında</h2>
            <div className="space-y-3 text-[#3a5a68]">
              <p><strong>Uygulama:</strong> İlmihal Asistanı</p>
              <p><strong>Versiyon:</strong> 1.0.0</p>
              <p><strong>Toplam Soru:</strong> 219+</p>
              <p><strong>İçerik Kaynakları:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Diyanet İşleri Başkanlığı Yayınları</li>
                <li>Güvenilir Fıkıh Kitapları</li>
                <li>Hadis ve Ayet Kaynakları</li>
              </ul>
            </div>
          </div>

          {/* Sıfırla Butonu */}
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full py-6 border-red-300 text-red-600 hover:bg-red-50"
          >
            Ayarları Varsayılana Sıfırla
          </Button>
        </div>
      </div>

      <div className="bottom-nav">
        <div className="bottom-nav-content">
          <div className="nav-item" onClick={() => navigate('/')}>
            <BookOpen size={24} />
            <span>Ana Sayfa</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/calendar')}>
            <Calendar size={24} />
            <span>Takvim</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/quiz')}>
            <Trophy size={24} />
            <span>Quiz</span>
          </div>
          <div className="nav-item active" onClick={() => navigate('/settings')}>
            <SettingsIcon size={24} />
            <span>Ayarlar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
