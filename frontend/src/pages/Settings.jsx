import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Type, BookOpen, Heart, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="page-container">
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
        <h1 className="text-3xl font-bold text-[#2c5f6f] mb-6" data-testid="settings-title">Ayarlar</h1>

        <div className="space-y-6">
          <div className="glass-effect p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-[#2c5f6f] mb-4">Görünüm</h2>
            
            <div className="flex items-center justify-between mb-6">
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

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Type size={24} className="text-[#4f8c9f]" />
                <Label className="font-medium">Yazı Boyutu</Label>
              </div>
              <RadioGroup value={fontSize} onValueChange={setFontSize}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="small" id="small" data-testid="font-size-small" />
                  <Label htmlFor="small" className="cursor-pointer">Küçük</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="medium" id="medium" data-testid="font-size-medium" />
                  <Label htmlFor="medium" className="cursor-pointer">Orta</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="large" data-testid="font-size-large" />
                  <Label htmlFor="large" className="cursor-pointer">Büyük</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-[#2c5f6f] mb-4">Bildirimler</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={24} className="text-[#4f8c9f]" />
                <div>
                  <Label htmlFor="notifications" className="font-medium">Bildirimler</Label>
                  <p className="text-sm text-[#6b9dad]">Hatırlatmaları açın/kapatın</p>
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

          <div className="glass-effect p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-[#2c5f6f] mb-4">Hakkında</h2>
            <div className="space-y-3 text-[#3a5a68]">
              <p><strong>Uygulama:</strong> İlmihal Asistanı</p>
              <p><strong>Versiyon:</strong> 1.0.0</p>
              <p><strong>İçerik Kaynakları:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Diyanet İşleri Başkanlığı Yayınları</li>
                <li>Güvenilir Fıkıh Kitapları</li>
                <li>Hadis ve Ayet Kaynakları</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <div className="bottom-nav-content">
          <div className="nav-item" data-testid="nav-home" onClick={() => navigate('/')}>
            <BookOpen size={24} />
            <span>Ana Sayfa</span>
          </div>
          <div className="nav-item" data-testid="nav-favorites" onClick={() => navigate('/favorites')}>
            <Heart size={24} />
            <span>Favoriler</span>
          </div>
          <div className="nav-item" data-testid="nav-reminders" onClick={() => navigate('/reminders')}>
            <Bell size={24} />
            <span>Hatırlatma</span>
          </div>
          <div className="nav-item active" data-testid="nav-settings" onClick={() => navigate('/settings')}>
            <SettingsIcon size={24} />
            <span>Ayarlar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;