import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Heart, Settings as SettingsIcon, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API, axios } from '../App';

const Home = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

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

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);

    if (value.length >= 2) {
      try {
        const response = await axios.get(`${API}/autocomplete?query=${encodeURIComponent(value)}`);
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate('/question', { state: { question: searchQuery } });
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.question);
    setShowSuggestions(false);
    setSuggestions([]);
    navigate('/question', { state: { question: suggestion.question } });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        selectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
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
        <div className="search-container" style={{ position: 'relative' }}>
          <Search className="search-icon" size={24} />
          <Input
            data-testid="search-input"
            type="text"
            placeholder="Sorunuzu yazın... (örn: Namaz kaç rekattır?)"
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyPress}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoComplete="off"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div 
              className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
              style={{ top: '100%' }}
              data-testid="suggestions-dropdown"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  data-testid={`suggestion-item-${index}`}
                  className={`p-4 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedIndex === index ? 'bg-[#e8f4f8]' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-[#4f8c9f] bg-opacity-10 flex items-center justify-center">
                        <Search size={16} className="text-[#4f8c9f]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#2c5f6f] mb-1">{suggestion.question}</p>
                      <p className="text-sm text-[#6b9dad] line-clamp-2">{suggestion.preview}</p>
                      <span className="inline-block mt-2 text-xs px-2 py-1 bg-[#4f8c9f] bg-opacity-10 text-[#4f8c9f] rounded-full">
                        {suggestion.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <div className="nav-item" data-testid="nav-calendar" onClick={() => navigate('/calendar')}>
            <Calendar size={24} />
            <span>Takvim</span>
          </div>
          <div className="nav-item" data-testid="nav-quiz" onClick={() => navigate('/quiz')}>
            <Trophy size={24} />
            <span>Quiz</span>
          </div>
          <div className="nav-item" data-testid="nav-reminders" onClick={() => navigate('/reminders')}>
            <Bell size={24} />
            <span>Hatırlatma</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;