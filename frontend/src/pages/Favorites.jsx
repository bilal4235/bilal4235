import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, BookOpen, Heart, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API, axios } from '../App';
import { toast } from 'sonner';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await axios.get(`${API}/favorites`);
      setFavorites(response.data);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Favoriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const deleteFavorite = async (id) => {
    try {
      await axios.delete(`${API}/favorites/${id}`);
      setFavorites(favorites.filter(f => f.id !== id));
      toast.success('Favorilerden kaldırıldı!');
    } catch (error) {
      console.error('Error deleting favorite:', error);
      toast.error('Silme sırasında hata oluştu.');
    }
  };

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
        <h1 className="text-3xl font-bold text-[#2c5f6f] mb-6" data-testid="favorites-title">Favorilerim</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#6b9dad]">Yükleniyor...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="glass-effect p-12 rounded-2xl text-center" data-testid="no-favorites">
            <Heart size={64} className="mx-auto mb-4 text-[#6b9dad]" />
            <p className="text-lg text-[#6b9dad]">Henüz favori eklemediniz.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="answer-card" data-testid={`favorite-item-${favorite.id}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="question-text flex-1" data-testid="favorite-question">{favorite.question}</h3>
                  <Button
                    data-testid={`delete-favorite-${favorite.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFavorite(favorite.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
                <p className="answer-text" data-testid="favorite-answer">{favorite.answer}</p>
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
          <div className="nav-item active" data-testid="nav-favorites" onClick={() => navigate('/favorites')}>
            <Heart size={24} />
            <span>Favoriler</span>
          </div>
          <div className="nav-item" data-testid="nav-reminders" onClick={() => navigate('/reminders')}>
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

export default Favorites;