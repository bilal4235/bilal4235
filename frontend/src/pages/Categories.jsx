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
              onClick={() => setShowNewQuestionDialog(true)}
              className="w-full py-6 text-lg font-semibold bg-[#4f8c9f] hover:bg-[#3d7080] text-white rounded-xl flex items-center justify-center gap-2"
            >
              <Plus size={24} />
              Yeni Soru Sor
            </Button>
          </div>
        </div>
      )}

      {/* Yeni Soru Sor Dialog */}
      <Dialog open={showNewQuestionDialog} onOpenChange={setShowNewQuestionDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {category?.name} Hakkında Soru Sor
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4f8c9f]" size={20} />
              <Input
                data-testid="new-question-search"
                type="text"
                placeholder={`${category?.name} ile ilgili arama yapın... (örn: na)`}
                className="pl-10 py-6 text-base border-2 border-[#4f8c9f] border-opacity-30 focus:border-[#4f8c9f] rounded-xl"
                value={newQuestionSearch}
                onChange={(e) => handleNewQuestionSearch(e.target.value)}
                autoFocus
              />
            </div>

            {newQuestionSearch.length >= 1 && (
              <div className="overflow-y-auto max-h-[50vh] space-y-2">
                {filteredQuestions.length > 0 ? (
                  <>
                    <p className="text-sm text-[#6b9dad] px-2">
                      {filteredQuestions.length} soru bulundu
                    </p>
                    {filteredQuestions.map((q, index) => (
                      <div
                        key={index}
                        data-testid={`filtered-question-${index}`}
                        className="p-4 rounded-xl border border-gray-200 hover:border-[#4f8c9f] hover:bg-[#e8f4f8] cursor-pointer transition-all"
                        onClick={() => selectQuestion(q.question)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 rounded-full bg-[#4f8c9f] bg-opacity-10 flex items-center justify-center">
                              <Search size={16} className="text-[#4f8c9f]" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#2c5f6f] mb-2">
                              {q.question}
                            </p>
                            <p className="text-sm text-[#6b9dad] line-clamp-2">
                              {q.preview}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#6b9dad]">
                      "{newQuestionSearch}" için sonuç bulunamadı
                    </p>
                    <p className="text-sm text-[#6b9dad] mt-2">
                      Farklı bir anahtar kelime deneyin
                    </p>
                  </div>
                )}
              </div>
            )}

            {newQuestionSearch.length === 0 && (
              <div className="text-center py-8">
                <Search size={48} className="mx-auto text-[#6b9dad] mb-4" />
                <p className="text-[#6b9dad]">
                  Aramak için yazmaya başlayın
                </p>
                <p className="text-sm text-[#6b9dad] mt-2">
                  Örnek: "na" yazarak namaz sorularını görebilirsiniz
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;