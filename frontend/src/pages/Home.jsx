import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Heart, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API, axios } from '../App';

const Home = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      loadCategories();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('/question', { state: { question: searchQuery } });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (showSplash) {
    return (
      <div className="splash-container">
        <div className="splash-icon fade-in">🕌</div>
        <h1 className="splash-title slide-up">İlmihal Asistanı</h1>
        <p className="splash-subtitle slide-up">Günlük sorularınıza hızlı ve güvenilir cevaplar</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2c5f6f] mb-3" data-testid="app-title">
          İlmihal Asistanı
        </h1>
        <p className="text-lg text-[#4f8c9f]" data-testid="app-subtitle">Günlük sorularınıza hızlı ve güvenilir cevaplar</p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="search-container">
          <Search className="search-icon" size={24} />
          <Input
            data-testid="search-input"
            type="text"
            placeholder="Sorunuzu yazın... (örn: Namaz kaç rekattır?)"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button
          data-testid="search-button"
          onClick={handleSearch}
          className="w-full mt-4 py-6 text-lg font-semibold bg-[#4f8c9f] hover:bg-[#3d7080] text-white rounded-xl"
        >
          Cevap Al
        </Button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#2c5f6f] mb-6" data-testid="categories-title">Kategoriler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              data-testid={`category-card-${category.id}`}
              className="category-card glass-effect p-6 rounded-2xl"
              onClick={() => navigate('/categories', { state: { category } })}
            >
              <div className="text-5xl mb-3">{category.icon}</div>
              <h3 className="text-xl font-semibold text-[#2c5f6f] mb-2">{category.name}</h3>
              <p className="text-sm text-[#6b9dad]">{category.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-nav">
        <div className="bottom-nav-content">
          <div className="nav-item active" data-testid="nav-home" onClick={() => navigate('/')}>
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
          <div className="nav-item" data-testid="nav-settings" onClick={() => navigate('/settings')}>
            <SettingsIcon size={24} />
            <span>Ayarlar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;