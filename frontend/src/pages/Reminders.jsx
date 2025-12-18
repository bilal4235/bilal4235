import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, BookOpen, Bell, Settings as SettingsIcon, Trophy, Calendar, Clock, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API, axios } from '../App';
import { toast } from 'sonner';

// Varsayılan namaz vakitleri hatırlatıcıları
const DEFAULT_PRAYER_REMINDERS = [
  { id: 'fajr', title: 'Sabah Namazı', time: '05:30', icon: 'sunrise', category: 'namaz', enabled: true },
  { id: 'dhuhr', title: 'Öğle Namazı', time: '12:30', icon: 'sun', category: 'namaz', enabled: true },
  { id: 'asr', title: 'İkindi Namazı', time: '15:45', icon: 'sunset', category: 'namaz', enabled: true },
  { id: 'maghrib', title: 'Akşam Namazı', time: '18:15', icon: 'moon', category: 'namaz', enabled: true },
  { id: 'isha', title: 'Yatsı Namazı', time: '19:45', icon: 'moon', category: 'namaz', enabled: true },
];

// Varsayılan dua hatırlatıcıları
const DEFAULT_DUA_REMINDERS = [
  { id: 'morning_dua', title: 'Sabah Duası', time: '06:00', category: 'dua', description: 'Sabah zikir ve duaları', enabled: false },
  { id: 'evening_dua', title: 'Akşam Duası', time: '18:30', category: 'dua', description: 'Akşam zikir ve duaları', enabled: false },
  { id: 'before_sleep', title: 'Uyku Öncesi Dua', time: '22:00', category: 'dua', description: 'Yatmadan önce okunacak dualar', enabled: false },
];

const Reminders = () => {
  const navigate = useNavigate();
  const [prayerReminders, setPrayerReminders] = useState([]);
  const [duaReminders, setDuaReminders] = useState([]);
  const [customReminders, setCustomReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReminder, setNewReminder] = useState({ title: '', time: '', category: 'custom', description: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('namaz');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      // localStorage'dan hatırlatıcıları yükle
      const savedPrayer = localStorage.getItem('ilmihal_prayerReminders');
      const savedDua = localStorage.getItem('ilmihal_duaReminders');
      
      if (savedPrayer) {
        setPrayerReminders(JSON.parse(savedPrayer));
      } else {
        setPrayerReminders(DEFAULT_PRAYER_REMINDERS);
        localStorage.setItem('ilmihal_prayerReminders', JSON.stringify(DEFAULT_PRAYER_REMINDERS));
      }
      
      if (savedDua) {
        setDuaReminders(JSON.parse(savedDua));
      } else {
        setDuaReminders(DEFAULT_DUA_REMINDERS);
        localStorage.setItem('ilmihal_duaReminders', JSON.stringify(DEFAULT_DUA_REMINDERS));
      }

      // Backend'den özel hatırlatıcıları yükle
      try {
        const response = await axios.get(`${API}/reminders`);
        setCustomReminders(response.data || []);
      } catch (error) {
        console.log('Backend reminders not available, using local storage');
        const savedCustom = localStorage.getItem('ilmihal_customReminders');
        if (savedCustom) {
          setCustomReminders(JSON.parse(savedCustom));
        }
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePrayerReminder = (id) => {
    const updated = prayerReminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setPrayerReminders(updated);
    localStorage.setItem('ilmihal_prayerReminders', JSON.stringify(updated));
    
    const reminder = updated.find(r => r.id === id);
    if (reminder.enabled) {
      toast.success(`${reminder.title} hatırlatıcısı açıldı`);
      scheduleNotification(reminder);
    } else {
      toast.info(`${reminder.title} hatırlatıcısı kapatıldı`);
    }
  };

  const toggleDuaReminder = (id) => {
    const updated = duaReminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setDuaReminders(updated);
    localStorage.setItem('ilmihal_duaReminders', JSON.stringify(updated));
    
    const reminder = updated.find(r => r.id === id);
    if (reminder.enabled) {
      toast.success(`${reminder.title} hatırlatıcısı açıldı`);
    } else {
      toast.info(`${reminder.title} hatırlatıcısı kapatıldı`);
    }
  };

  const updatePrayerTime = (id, newTime) => {
    const updated = prayerReminders.map(r => 
      r.id === id ? { ...r, time: newTime } : r
    );
    setPrayerReminders(updated);
    localStorage.setItem('ilmihal_prayerReminders', JSON.stringify(updated));
    toast.success('Namaz vakti güncellendi');
  };

  const scheduleNotification = async (reminder) => {
    // Tarayıcı bildirimi izni iste
    if ('Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Bildirim izni verilmedi. Hatırlatmalar çalışmayacak.');
        return;
      }
    }
  };

  const createCustomReminder = async () => {
    if (!newReminder.title || !newReminder.time) {
      toast.error('Lütfen başlık ve saat girin.');
      return;
    }

    const reminder = {
      id: `custom_${Date.now()}`,
      ...newReminder,
      enabled: true
    };

    try {
      // Backend'e kaydet
      await axios.post(`${API}/reminders`, reminder);
      setCustomReminders([...customReminders, reminder]);
    } catch (error) {
      // Backend başarısızsa localStorage'a kaydet
      const updated = [...customReminders, reminder];
      setCustomReminders(updated);
      localStorage.setItem('ilmihal_customReminders', JSON.stringify(updated));
    }

    setNewReminder({ title: '', time: '', category: 'custom', description: '' });
    setDialogOpen(false);
    toast.success('Hatırlatıcı eklendi!');
  };

  const deleteCustomReminder = async (id) => {
    try {
      await axios.delete(`${API}/reminders/${id}`);
    } catch (error) {
      console.log('Backend delete failed, removing locally');
    }
    
    const updated = customReminders.filter(r => r.id !== id);
    setCustomReminders(updated);
    localStorage.setItem('ilmihal_customReminders', JSON.stringify(updated));
    toast.success('Hatırlatıcı silindi');
  };

  const toggleCustomReminder = async (id) => {
    const updated = customReminders.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setCustomReminders(updated);
    localStorage.setItem('ilmihal_customReminders', JSON.stringify(updated));
  };

  const getPrayerIcon = (iconName) => {
    switch (iconName) {
      case 'sunrise': return <Sunrise className="w-6 h-6 text-orange-500" />;
      case 'sun': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'sunset': return <Sunset className="w-6 h-6 text-orange-600" />;
      case 'moon': return <Moon className="w-6 h-6 text-indigo-500" />;
      default: return <Clock className="w-6 h-6 text-[#4f8c9f]" />;
    }
  };

  const enableAllPrayers = () => {
    const updated = prayerReminders.map(r => ({ ...r, enabled: true }));
    setPrayerReminders(updated);
    localStorage.setItem('ilmihal_prayerReminders', JSON.stringify(updated));
    toast.success('Tüm namaz hatırlatıcıları açıldı');
  };

  const disableAllPrayers = () => {
    const updated = prayerReminders.map(r => ({ ...r, enabled: false }));
    setPrayerReminders(updated);
    localStorage.setItem('ilmihal_prayerReminders', JSON.stringify(updated));
    toast.info('Tüm namaz hatırlatıcıları kapatıldı');
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bell size={48} className="mx-auto mb-4 text-[#4f8c9f] animate-pulse" />
          <p className="text-[#6b9dad]">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-24">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#4f8c9f] hover:text-[#2c5f6f]"
        >
          <ArrowLeft size={20} />
          Geri
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#4f8c9f] hover:bg-[#3d7080] text-white">
              <Plus size={20} />
              Özel Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Özel Hatırlatıcı Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Başlık</Label>
                <Input
                  id="title"
                  placeholder="örn: Kur'an Okuma"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Saat</Label>
                <Input
                  id="time"
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                <Input
                  id="description"
                  placeholder="örn: Her gün en az 1 sayfa"
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                />
              </div>
              <Button
                onClick={createCustomReminder}
                className="w-full bg-[#4f8c9f] hover:bg-[#3d7080] text-white"
              >
                Kaydet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔔</div>
          <h1 className="text-3xl font-bold text-[#2c5f6f] mb-1">Hatırlatıcılar</h1>
          <p className="text-[#6b9dad]">Namaz ve dua vakitlerini kaçırmayın</p>
        </div>

        {/* Tab Seçimi */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('namaz')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'namaz' 
                ? 'bg-white text-[#2c5f6f] shadow-sm' 
                : 'text-[#6b9dad]'
            }`}
          >
            🕌 Namaz Vakitleri
          </button>
          <button
            onClick={() => setActiveTab('dua')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'dua' 
                ? 'bg-white text-[#2c5f6f] shadow-sm' 
                : 'text-[#6b9dad]'
            }`}
          >
            🤲 Dua & Zikir
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'custom' 
                ? 'bg-white text-[#2c5f6f] shadow-sm' 
                : 'text-[#6b9dad]'
            }`}
          >
            ⭐ Özel
          </button>
        </div>

        {/* Namaz Vakitleri */}
        {activeTab === 'namaz' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-[#6b9dad]">5 vakit namaz hatırlatıcısı</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={enableAllPrayers}>
                  Tümünü Aç
                </Button>
                <Button size="sm" variant="outline" onClick={disableAllPrayers}>
                  Tümünü Kapat
                </Button>
              </div>
            </div>

            {prayerReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`glass-effect p-4 rounded-xl transition-all ${
                  reminder.enabled ? 'border-2 border-green-200' : 'opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getPrayerIcon(reminder.icon)}
                    <div>
                      <h3 className="font-semibold text-[#2c5f6f]">{reminder.title}</h3>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={reminder.time}
                          onChange={(e) => updatePrayerTime(reminder.id, e.target.value)}
                          className="w-28 h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={() => togglePrayerReminder(reminder.id)}
                  />
                </div>
              </div>
            ))}

            <div className="p-4 bg-blue-50 rounded-xl mt-4">
              <p className="text-sm text-blue-700">
                💡 <strong>İpucu:</strong> Namaz vakitlerini bulunduğunuz şehre göre güncelleyin. 
                Vakitleri Diyanet İşleri Başkanlığı'nın resmi sitesinden kontrol edebilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* Dua & Zikir */}
        {activeTab === 'dua' && (
          <div className="space-y-4">
            <p className="text-sm text-[#6b9dad] mb-4">Günlük dua ve zikir hatırlatıcıları</p>

            {duaReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`glass-effect p-4 rounded-xl transition-all ${
                  reminder.enabled ? 'border-2 border-purple-200' : 'opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      🤲
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2c5f6f]">{reminder.title}</h3>
                      <p className="text-sm text-[#6b9dad]">{reminder.description}</p>
                      <p className="text-xs text-[#4f8c9f] mt-1">{reminder.time}</p>
                    </div>
                  </div>
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={() => toggleDuaReminder(reminder.id)}
                  />
                </div>
              </div>
            ))}

            <div className="glass-effect p-4 rounded-xl">
              <h4 className="font-semibold text-[#2c5f6f] mb-2">📖 Sabah-Akşam Zikirleri</h4>
              <ul className="text-sm text-[#4f8c9f] space-y-1">
                <li>• Ayet'el-Kürsi (1 kez)</li>
                <li>• İhlas, Felak, Nas Sureleri (3'er kez)</li>
                <li>• Sübhanallah (33 kez)</li>
                <li>• Elhamdülillah (33 kez)</li>
                <li>• Allahu Ekber (33 kez)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Özel Hatırlatıcılar */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            <p className="text-sm text-[#6b9dad] mb-4">Kendi hatırlatıcılarınızı oluşturun</p>

            {customReminders.length === 0 ? (
              <div className="glass-effect p-12 rounded-2xl text-center">
                <Bell size={64} className="mx-auto mb-4 text-[#6b9dad]" />
                <p className="text-lg text-[#6b9dad] mb-4">Henüz özel hatırlatıcı eklemediniz.</p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-[#4f8c9f] hover:bg-[#3d7080] text-white"
                >
                  <Plus size={20} className="mr-2" />
                  İlk Hatırlatıcıyı Ekle
                </Button>
              </div>
            ) : (
              customReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`glass-effect p-4 rounded-xl transition-all ${
                    reminder.enabled ? 'border-2 border-[#4f8c9f]/30' : 'opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#4f8c9f]/10 flex items-center justify-center">
                        ⭐
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2c5f6f]">{reminder.title}</h3>
                        {reminder.description && (
                          <p className="text-sm text-[#6b9dad]">{reminder.description}</p>
                        )}
                        <p className="text-xs text-[#4f8c9f] mt-1">{reminder.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={() => toggleCustomReminder(reminder.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCustomReminder(reminder.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
          <div className="nav-item active" onClick={() => navigate('/reminders')}>
            <Bell size={24} />
            <span>Hatırlatma</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/settings')}>
            <SettingsIcon size={24} />
            <span>Ayarlar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
