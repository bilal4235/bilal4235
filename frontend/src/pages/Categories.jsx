import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { API, axios } from '../App';

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [category] = useState(location.state?.category);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNewQuestionDialog, setShowNewQuestionDialog] = useState(false);
  const [newQuestionSearch, setNewQuestionSearch] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Sample FAQ data for each category
  const faqData = {
    namaz: [
      { q: 'Namaz kaç rekattır?', a: 'Farz namazlar şu rekatlardan oluşur: Sabah 2, Öğle 4, İkindi 4, Akşam 3, Yatsı 4 rekattır.' },
      { q: 'Abdest nasıl alınır?', a: 'Abdest alırken önce niyet edilir, besmele çekilir. Eller, ağız, burun, yüz, kollar dirseklere kadar, baş meshedilir ve ayaklar topuklara kadar yıkanır.' },
      { q: 'Namazda rükû nasıl yapılır?', a: 'Rükûya giderken Allahu Ekber denilir, eller dizlere konulur, sırt düz tutulur ve Sübhane Rabbiyel Azîm en az üç kez söylenir.' },
    ],
    oruc: [
      { q: 'Oruç ne zaman bozulur?', a: 'Bilerek yeme, içme, cinsel ilişki ve kasıtlı kusma orucu bozar. İstemeden yapılan bu durumlar orucu bozmaz.' },
      { q: 'Sahur ne zaman yenir?', a: 'Sahur, imsak vaktine kadar yenir. İmsaktan sonra artık oruç tutulmalıdır.' },
      { q: 'Hasta oruç tutabilir mi?', a: 'Hastalığı ağırlaşacak veya iyileşmesi gecikecek olan kişi oruç tutmayabilir ve daha sonra kaza eder.' },
    ],
    zekat: [
      { q: 'Zekât kime verilir?', a: 'Zekât fakirlere, yoksullara, borçlulara, yolda kalmışlara ve Allah yolunda olanlara verilir.' },
      { q: 'Fitre ne zaman verilir?', a: 'Fitre, Ramazan Bayramı namazından önce verilmelidir. Namazdan sonra verilirse sadaka olarak kabul edilir.' },
      { q: 'Zekât miktarı nasıl hesaplanır?', a: 'Nisap miktarına ulaşan malın %2.5\'i zekât olarak verilir.' },
    ],
    hac: [
      { q: 'Hac farz mıdır?', a: 'Evet, gücü yeten her Müslüman için ömründe bir kez hac yapmak farzdır.' },
      { q: 'Umre ile hac arasındaki fark nedir?', a: 'Hac belirli vakitlerde yapılır ve farz iken, umre yılın her döneminde yapılabilir ve sünnettir.' },
      { q: 'İhram nedir?', a: 'İhram, hac veya umre için girilecek özel bir hâl ve bu hâlde giyilen dikişsiz elbisedir.' },
    ],
    gunluk: [
      { q: 'Yemek öncesi hangi dua okunur?', a: 'Yemek öncesi "Bismillah" denir. Unutulursa "Bismillahi evvelehu ve ahirehu" denir.' },
      { q: 'Misafir nasıl ağırlanır?', a: 'Misafir güler yüzle karşılanır, ikram yapılır ve üç gün misafir hakkı vardır. Sonrası sadakadır.' },
      { q: 'Komşu hakkı nedir?', a: 'Komşuya iyilik yapmak, incitmemek, ihtiyacında yardım etmek İslam\'da önemlidir.' },
    ],
    dua: [
      { q: 'Sabah-akşam duaları nelerdir?', a: 'Sabah-akşam Ayetel Kürsi, İhlas, Felak ve Nas sureleri okunur. Tesbih, tahmid ve tekbir getirilir.' },
      { q: 'Hangi dualar kabul olur?', a: 'İçten, samimi, huşu ile yapılan dualar kabul olur. Özellikle secde, ezan ile kamet arası ve cuma günleri.' },
      { q: 'Zikir nasıl yapılır?', a: 'Zikir kalpten, dille Allah\'ı anmaktır. Tesbih (Sübhanallah), Tahmid (Elhamdülillah) ve Tekbir (Allahu Ekber) getirilebilir.' },
    ],
  };

  const faqs = category ? faqData[category.id] || [] : [];

  const handleQuestionClick = (q) => {
    navigate('/question', { state: { question: q } });
  };

  const handleNewQuestionSearch = async (value) => {
    setNewQuestionSearch(value);

    if (value.length >= 1 && category) {
      try {
        // Kategoriye özel sorular getir
        const response = await axios.get(`${API}/autocomplete?query=${encodeURIComponent(value)}&limit=50`);
        // Sadece bu kategoriye ait olanları filtrele
        const categoryQuestions = response.data.suggestions.filter(
          s => s.category === category.id
        );
        setFilteredQuestions(categoryQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    } else {
      setFilteredQuestions([]);
    }
  };

  const selectQuestion = (question) => {
    setShowNewQuestionDialog(false);
    setNewQuestionSearch('');
    setFilteredQuestions([]);
    navigate('/question', { state: { question: question } });
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

      {category && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{category.icon}</div>
            <h1 className="text-3xl font-bold text-[#2c5f6f] mb-2" data-testid="category-title">{category.name}</h1>
            <p className="text-lg text-[#6b9dad]">{category.description}</p>
          </div>

          <div className="mb-8">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <Input
                data-testid="category-search-input"
                type="text"
                placeholder="Bu kategoride ara..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-[#2c5f6f] mb-4" data-testid="faq-title">Sık Sorulan Sorular</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-[#4f8c9f]">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#3a5a68]">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-6">
            <Button
              data-testid="ask-new-question-button"
              onClick={() => navigate('/question')}
              className="w-full py-6 text-lg font-semibold bg-[#4f8c9f] hover:bg-[#3d7080] text-white rounded-xl"
            >
              Yeni Soru Sor
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;