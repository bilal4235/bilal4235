import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Heart, Settings as SettingsIcon, Trophy, Calendar as CalendarIcon, ChevronRight, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API, axios } from '../App';

const Calendar = () => {
  const navigate = useNavigate();
  const [calendarData, setCalendarData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
    loadUpcomingEvents();
  }, []);

  const loadCalendarData = async () => {
    try {
      const response = await axios.get(`${API}/calendar`);
      setCalendarData(response.data);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
    setLoading(false);
  };

  const loadUpcomingEvents = async () => {
    try {
      const response = await axios.get(`${API}/calendar/upcoming?limit=3`);
      setUpcomingEvents(response.data.upcoming_events);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      kandil: 'bg-purple-100 text-purple-700 border-purple-200',
      bayram: 'bg-green-100 text-green-700 border-green-200',
      ozel_gun: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getCategoryName = (category) => {
    const names = {
      kandil: 'Kandil',
      bayram: 'Bayram',
      ozel_gun: 'Özel Gün'
    };
    return names[category] || category;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('tr-TR', options);
  };

  const getDaysUntilText = (daysUntil) => {
    if (daysUntil === 0) return 'Bugün!';
    if (daysUntil === 1) return 'Yarın';
    if (daysUntil <= 7) return `${daysUntil} gün sonra`;
    if (daysUntil <= 30) return `${Math.ceil(daysUntil / 7)} hafta sonra`;
    return `${Math.ceil(daysUntil / 30)} ay sonra`;
  };

  const filteredEvents = calendarData?.important_dates?.filter(event => {
    if (activeFilter === 'all') return true;
    return event.category === activeFilter;
  }) || [];

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">📅</div>
          <p className="text-[#4f8c9f]">Takvim yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Etkinlik Detay Modal
  if (selectedEvent) {
    return (
      <div className="page-container pb-24">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedEvent(null)}
            className="mb-4 text-[#4f8c9f]"
          >
            ← Geri
          </Button>

          <div className="glass-effect rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#4f8c9f] to-[#2c5f6f] p-6 text-white">
              <div className="text-5xl mb-3">{selectedEvent.icon}</div>
              <h1 className="text-2xl font-bold mb-2">{selectedEvent.name}</h1>
              <p className="text-white/80">{selectedEvent.hijri_date}</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <CalendarIcon className="w-5 h-5 text-[#4f8c9f]" />
                <span className="text-[#2c5f6f] font-medium">
                  {formatDate(selectedEvent.date)}
                  {selectedEvent.end_date && ` - ${formatDate(selectedEvent.end_date)}`}
                </span>
              </div>

              <span className={`inline-block px-3 py-1 rounded-full text-sm border ${getCategoryColor(selectedEvent.category)} mb-4`}>
                {getCategoryName(selectedEvent.category)}
              </span>

              <div className="mb-6">
                <h3 className="font-semibold text-[#2c5f6f] mb-2">Açıklama</h3>
                <p className="text-[#4f8c9f] leading-relaxed">{selectedEvent.description}</p>
              </div>

              {selectedEvent.practices && selectedEvent.practices.length > 0 && (
                <div className="bg-[#f5fafb] rounded-xl p-4">
                  <h3 className="font-semibold text-[#2c5f6f] mb-3">Bu Günde Yapılacaklar</h3>
                  <ul className="space-y-2">
                    {selectedEvent.practices.map((practice, index) => (
                      <li key={index} className="flex items-center gap-2 text-[#4f8c9f]">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {practice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-[#6b9dad] mt-4">
                Kaynak: Diyanet İşleri Başkanlığı
              </p>
            </div>
          </div>
        </div>

        <div className="bottom-nav">
          <div className="bottom-nav-content">
            <div className="nav-item" onClick={() => navigate('/')}>
              <BookOpen size={24} />
              <span>Ana Sayfa</span>
            </div>
            <div className="nav-item active">
              <CalendarIcon size={24} />
              <span>Takvim</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/quiz')}>
              <Trophy size={24} />
              <span>Quiz</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/settings')}>
              <SettingsIcon size={24} />
              <span>Ayarlar</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📅</div>
          <h1 className="text-3xl font-bold text-[#2c5f6f] mb-1">İslami Takvim</h1>
          <p className="text-[#4f8c9f]">{calendarData?.hijri_year} Hicri Yılı</p>
        </div>

        {/* Yaklaşan Etkinlikler */}
        {upcomingEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#2c5f6f] mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Yaklaşan Önemli Günler
            </h2>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`glass-effect rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all ${
                    event.is_today ? 'ring-2 ring-green-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{event.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#2c5f6f]">{event.name}</h3>
                        {event.is_today && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                            BUGÜN!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#6b9dad]">{formatDate(event.date)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        event.is_today ? 'text-green-600' : 
                        event.is_this_week ? 'text-orange-600' : 'text-[#4f8c9f]'
                      }`}>
                        {getDaysUntilText(event.days_until)}
                      </span>
                      <ChevronRight className="w-5 h-5 text-[#4f8c9f] ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtre Butonları */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['all', 'kandil', 'bayram', 'ozel_gun'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-[#4f8c9f] text-white'
                  : 'bg-white text-[#4f8c9f] border border-[#4f8c9f]'
              }`}
            >
              {filter === 'all' ? 'Tümü' : getCategoryName(filter)}
            </button>
          ))}
        </div>

        {/* Tüm Etkinlikler Listesi */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#2c5f6f] mb-3">
            {calendarData?.year} Yılı Önemli Günler ({filteredEvents.length})
          </h2>
          
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="glass-effect rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{event.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2c5f6f]">{event.name}</h3>
                  <p className="text-sm text-[#6b9dad]">{event.hijri_date}</p>
                  <p className="text-xs text-[#4f8c9f] mt-1">{formatDate(event.date)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(event.category)}`}>
                    {getCategoryName(event.category)}
                  </span>
                  <ChevronRight className="w-5 h-5 text-[#4f8c9f]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kaynak Bilgisi */}
        <div className="mt-6 text-center text-xs text-[#6b9dad]">
          <p>Kaynak: {calendarData?.source}</p>
        </div>
      </div>

      <div className="bottom-nav">
        <div className="bottom-nav-content">
          <div className="nav-item" onClick={() => navigate('/')}>
            <BookOpen size={24} />
            <span>Ana Sayfa</span>
          </div>
          <div className="nav-item active">
            <CalendarIcon size={24} />
            <span>Takvim</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/quiz')}>
            <Trophy size={24} />
            <span>Quiz</span>
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

export default Calendar;
