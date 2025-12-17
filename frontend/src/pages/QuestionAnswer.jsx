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
  const [showShareDialog, setShowShareDialog] = useState(false);

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

  const shareAnswer = () => {
    setShowShareDialog(true);
  };

  const shareToWhatsApp = () => {
    const text = `İlmihal Asistanı\n\nSoru: ${question}\n\nCevap: ${answer}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareDialog(false);
    toast.success('WhatsApp\'a yönlendiriliyorsunuz');
  };

  const shareToTwitter = () => {
    const text = `${question}\n\n${answer.substring(0, 200)}...\n\n#İlmihalAsistanı #İslamiyet`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
    setShowShareDialog(false);
    toast.success('X\'e yönlendiriliyorsunuz');
  };

  const shareToTelegram = () => {
    const text = `İlmihal Asistanı\n\nSoru: ${question}\n\nCevap: ${answer}`;
    const telegramUrl = `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
    setShowShareDialog(false);
    toast.success('Telegram\'a yönlendiriliyorsunuz');
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

      {/* Paylaş Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Paylaş</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              data-testid="share-whatsapp"
              onClick={shareToWhatsApp}
              className="flex flex-col items-center gap-2 h-24 bg-[#25D366] hover:bg-[#20BD5C] text-white"
            >
              <MessageCircle size={32} />
              <span className="text-sm font-medium">WhatsApp</span>
            </Button>

            <Button
              data-testid="share-twitter"
              onClick={shareToTwitter}
              className="flex flex-col items-center gap-2 h-24 bg-black hover:bg-gray-800 text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm font-medium">X (Twitter)</span>
            </Button>

            <Button
              data-testid="share-telegram"
              onClick={shareToTelegram}
              className="flex flex-col items-center gap-2 h-24 bg-[#0088cc] hover:bg-[#006699] text-white"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8"
                fill="currentColor"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <span className="text-sm font-medium">Telegram</span>
            </Button>

            <Button
              data-testid="save-note"
              onClick={saveAsNote}
              className="flex flex-col items-center gap-2 h-24 bg-[#4f8c9f] hover:bg-[#3d7080] text-white"
            >
              <FileText size={32} />
              <span className="text-sm font-medium">Not Kaydet</span>
            </Button>

            <Button
              data-testid="copy-clipboard"
              onClick={copyToClipboard}
              variant="outline"
              className="flex flex-col items-center gap-2 h-24 col-span-2 border-2 border-[#4f8c9f] text-[#4f8c9f] hover:bg-[#4f8c9f] hover:text-white"
            >
              <Copy size={32} />
              <span className="text-sm font-medium">Panoya Kopyala</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionAnswer;
