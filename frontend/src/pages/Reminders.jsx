import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, BookOpen, Heart, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { API, axios } from '../App';
import { toast } from 'sonner';

const Reminders = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReminder, setNewReminder] = useState({ title: '', time: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const response = await axios.get(`${API}/reminders`);
      setReminders(response.data);
    } catch (error) {
      console.error('Error loading reminders:', error);
      toast.error('Hatırlatmalar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async () => {
    if (!newReminder.title || !newReminder.time) {
      toast.error('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const response = await axios.post(`${API}/reminders`, newReminder);
      setReminders([...reminders, response.data]);
      setNewReminder({ title: '', time: '' });
      setDialogOpen(false);
      toast.success('Hatırlatma eklendi!');
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Hatırlatma eklenirken hata oluştu.');
    }
  };

  const deleteReminder = async (id) => {
    try {
      await axios.delete(`${API}/reminders/${id}`);
      setReminders(reminders.filter(r => r.id !== id));
      toast.success('Hatırlatma silindi!');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Silme sırasında hata oluştu.');
    }
  };

  const toggleReminder = async (id, currentState) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      await axios.put(`${API}/reminders/${id}`, {
        ...reminder,
        enabled: !currentState
      });
      setReminders(reminders.map(r => 
        r.id === id ? { ...r, enabled: !currentState } : r
      ));
    } catch (error) {
      console.error('Error toggling reminder:', error);
      toast.error('Güncelleme sırasında hata oluştu.');
    }
  };

  return (
    <div className="page-container">
      <div className="mb-6 flex justify-between items-center">
        <Button
          data-testid="back-button"
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#4f8c9f] hover:text-[#2c5f6f]"
        >
          <ArrowLeft size={20} />
          Geri
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="add-reminder-button"
              className="flex items-center gap-2 bg-[#4f8c9f] hover:bg-[#3d7080] text-white"
            >
              <Plus size={20} />
              Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Hatırlatma</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Başlık</Label>
                <Input
                  data-testid="reminder-title-input"
                  id="title"
                  placeholder="örn: Sabah Namazı"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Saat</Label>
                <Input
                  data-testid="reminder-time-input"
                  id="time"
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                />
              </div>
              <Button
                data-testid="save-reminder-button"
                onClick={createReminder}
                className="w-full bg-[#4f8c9f] hover:bg-[#3d7080] text-white"
              >
                Kaydet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2c5f6f] mb-6" data-testid="reminders-title">Hatırlatmalar</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#6b9dad]">Yükleniyor...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="glass-effect p-12 rounded-2xl text-center" data-testid="no-reminders">
            <Bell size={64} className="mx-auto mb-4 text-[#6b9dad]" />
            <p className="text-lg text-[#6b9dad]">Henüz hatırlatma eklemediniz.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                data-testid={`reminder-item-${reminder.id}`}
                className="glass-effect p-4 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Bell size={24} className="text-[#4f8c9f]" />
                  <div>
                    <h3 className="font-semibold text-[#2c5f6f]" data-testid="reminder-title">{reminder.title}</h3>
                    <p className="text-sm text-[#6b9dad]" data-testid="reminder-time">{reminder.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    data-testid={`reminder-toggle-${reminder.id}`}
                    checked={reminder.enabled}
                    onCheckedChange={() => toggleReminder(reminder.id, reminder.enabled)}
                  />
                  <Button
                    data-testid={`delete-reminder-${reminder.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <div className="nav-item active" data-testid="nav-reminders" onClick={() => navigate('/reminders')}>
            <Bell size={24} />
            <span>Hatırlatma</span>
          </div>
          <div className="nav-item" data-testid="nav-settings" onClick={() => navigate('/settings')}>
            <SettingsIcon size={24} />
            <span>Ayarlar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;