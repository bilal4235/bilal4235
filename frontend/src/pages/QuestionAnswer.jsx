import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Volume2, Share2, Loader2, MessageCircle, FileText, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { API, axios } from '../App';
import { toast } from 'sonner';

const QuestionAnswer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(location.state?.question || '');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (question) {
      askQuestion(question);
    }
  }, []);

  const askQuestion = async (q) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/ask`, {
        question: q,
        session_id: sessionId
      });
      setAnswer(response.data.answer);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async () => {
    try {
      await axios.post(`${API}/favorites`, {
        question,
        answer,
        category: 'genel'
      });
      toast.success('Favorilere eklendi!');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Favorilere eklenirken hata oluştu.');
    }
  };

  const playAudio = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      // Use browser's Speech Synthesis API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(answer);
        utterance.lang = 'tr-TR';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onend = () => {
          setIsPlaying(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          toast.error('Sesli okuma sırasında hata oluştu.');
        };
        
        window.speechSynthesis.speak(utterance);
        toast.success('Sesli okuma başlatıldı');
      } else {
        toast.error('Tarayıcınız sesli okuma özelliğini desteklemiyor.');
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Sesli okuma sırasında hata oluştu.');
      setIsPlaying(false);
    }
  };

  const [showShareDialog, setShowShareDialog] = useState(false);

  const shareAnswer = () => {
    setShowShareDialog(true);
  };

  const shareToWhatsApp = () => {
    const text = `İlmihal Asistanı\n\nSoru: ${question}\n\nCevap: ${answer}\n\nwww.ilmihalasistani.com`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareDialog(false);
  };

  const shareToTwitter = () => {
    const text = `${question}\n\n${answer.substring(0, 200)}...\n\n#İlmihalAsistanı #İslamiyet`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
    setShowShareDialog(false);
  };

  const shareToTelegram = () => {
    const text = `İlmihal Asistanı\n\nSoru: ${question}\n\nCevap: ${answer}`;
    const telegramUrl = `https://t.me/share/url?url=www.ilmihalasistani.com&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
    setShowShareDialog(false);
  };

  const copyToClipboard = () => {
    const text = `Soru: ${question}\n\nCevap: ${answer}`;
    navigator.clipboard.writeText(text);
    toast.success('Panoya kopyalandı!');
    setShowShareDialog(false);
  };

  const saveAsNote = () => {
    const text = `İlmihal Asistanı\n\nSoru: ${question}\n\nCevap: ${answer}\n\nTarih: ${new Date().toLocaleDateString('tr-TR')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ilmihal-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Not olarak kaydedildi!');
    setShowShareDialog(false);
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
        <div className="answer-card">
          <h2 className="question-text" data-testid="question-text">{question}</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12" data-testid="loading-indicator">
              <Loader2 className="animate-spin text-[#4f8c9f]" size={48} />
            </div>
          ) : answer ? (
            <div>
              <p className="answer-text" data-testid="answer-text">{answer}</p>
              
              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  data-testid="favorite-button"
                  variant="outline"
                  onClick={addToFavorites}
                  className="flex items-center gap-2"
                >
                  <Heart size={18} />
                  Favorilere Ekle
                </Button>
                
                <Button
                  data-testid="audio-button"
                  variant="outline"
                  onClick={playAudio}
                  disabled={isPlaying}
                  className="flex items-center gap-2"
                >
                  <Volume2 size={18} />
                  {isPlaying ? 'Oynatılıyor...' : 'Sesli Dinle'}
                </Button>
                
                <Button
                  data-testid="share-button"
                  variant="outline"
                  onClick={shareAnswer}
                  className="flex items-center gap-2"
                >
                  <Share2 size={18} />
                  Paylaş
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Soru sorulması bekleniyor...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionAnswer;