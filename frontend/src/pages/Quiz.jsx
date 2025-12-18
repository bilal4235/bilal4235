import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Heart, Bell, Settings as SettingsIcon, Trophy, CheckCircle, XCircle, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API, axios } from '../App';

const Quiz = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API}/quiz/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const startQuiz = async (category = null) => {
    setLoading(true);
    try {
      const url = category 
        ? `${API}/quiz?category=${category}&count=10`
        : `${API}/quiz?count=10`;
      
      const response = await axios.get(url);
      setQuestions(response.data.questions);
      setSelectedCategory(category);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswers([]);
      setQuizComplete(false);
      setFinalScore(null);
      setQuizStarted(true);
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
    setLoading(false);
  };

  const handleAnswerSelect = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleConfirm = () => {
    if (selectedAnswer === null) return;
    
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct_answer;
    
    setAnswers([...answers, {
      question_id: currentQ.id,
      selected: selectedAnswer,
      correct_answer: currentQ.correct_answer,
      is_correct: isCorrect
    }]);
    
    setShowResult(true);
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz tamamlandı
      await submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      const allAnswers = [...answers];
      if (selectedAnswer !== null && !showResult) {
        const currentQ = questions[currentQuestion];
        allAnswers.push({
          question_id: currentQ.id,
          selected: selectedAnswer,
          correct_answer: currentQ.correct_answer
        });
      }

      const response = await axios.post(`${API}/quiz/submit`, {
        answers: allAnswers,
        category: selectedCategory
      });
      
      setFinalScore(response.data);
      setQuizComplete(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setQuizComplete(false);
    setFinalScore(null);
    setSelectedCategory(null);
  };

  const getCategoryIcon = (categoryId) => {
    const icons = {
      namaz: '🕌',
      oruc: '🌙',
      zekat: '💰',
      hac: '🕋',
      gunluk: '📖',
      dua: '🤲',
      iman: '✨'
    };
    return icons[categoryId] || '📚';
  };

  const getCategoryName = (categoryId) => {
    const names = {
      namaz: 'Namaz',
      oruc: 'Oruç',
      zekat: 'Zekât',
      hac: 'Hac & Umre',
      gunluk: 'Günlük Hayat',
      dua: 'Dua ve Zikir',
      iman: 'İman Esasları'
    };
    return names[categoryId] || categoryId;
  };

  // Quiz tamamlandı ekranı
  if (quizComplete && finalScore) {
    const percentage = finalScore.percentage;
    let message = '';
    let emoji = '';
    
    if (percentage >= 90) {
      message = 'Mükemmel! Harika bir performans!';
      emoji = '🏆';
    } else if (percentage >= 70) {
      message = 'Çok iyi! Başarılı bir sonuç!';
      emoji = '🎉';
    } else if (percentage >= 50) {
      message = 'İyi! Biraz daha çalışmayla daha da iyileşirsiniz.';
      emoji = '👍';
    } else {
      message = 'Tekrar denemelisiniz. Pratik yapmaya devam edin!';
      emoji = '📚';
    }

    return (
      <div className="page-container pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="glass-effect rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">{emoji}</div>
            <h2 className="text-3xl font-bold text-[#2c5f6f] mb-2">Quiz Tamamlandı!</h2>
            <p className="text-lg text-[#4f8c9f] mb-6">{message}</p>
            
            <div className="bg-gradient-to-r from-[#4f8c9f] to-[#2c5f6f] rounded-2xl p-6 text-white mb-6">
              <div className="text-5xl font-bold mb-2">
                {finalScore.score} / {finalScore.total}
              </div>
              <div className="text-2xl">
                %{finalScore.percentage} Başarı
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{finalScore.score}</div>
                <div className="text-sm text-green-600">Doğru</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{finalScore.total - finalScore.score}</div>
                <div className="text-sm text-red-600">Yanlış</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={resetQuiz}
                className="flex-1 py-6 bg-[#4f8c9f] hover:bg-[#3d7080] text-white rounded-xl"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Tekrar Dene
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1 py-6 border-[#4f8c9f] text-[#4f8c9f] rounded-xl"
              >
                <Home className="w-5 h-5 mr-2" />
                Ana Sayfa
              </Button>
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
              <Trophy size={24} />
              <span>Quiz</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/favorites')}>
              <Heart size={24} />
              <span>Favoriler</span>
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

  // Quiz soruları ekranı
  if (quizStarted && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="page-container pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-[#4f8c9f] mb-2">
              <span>Soru {currentQuestion + 1} / {questions.length}</span>
              <span>{getCategoryName(currentQ.category)}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#4f8c9f] to-[#2c5f6f] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Soru Kartı */}
          <div className="glass-effect rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{getCategoryIcon(currentQ.category)}</span>
              <span className="text-sm px-3 py-1 bg-[#4f8c9f] bg-opacity-10 text-[#4f8c9f] rounded-full">
                {getCategoryName(currentQ.category)}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-[#2c5f6f] mb-6">
              {currentQ.question}
            </h2>

            {/* Seçenekler */}
            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all ";
                
                if (showResult) {
                  if (index === currentQ.correct_answer) {
                    buttonClass += "border-green-500 bg-green-50 text-green-700";
                  } else if (index === selectedAnswer && index !== currentQ.correct_answer) {
                    buttonClass += "border-red-500 bg-red-50 text-red-700";
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                  }
                } else {
                  if (index === selectedAnswer) {
                    buttonClass += "border-[#4f8c9f] bg-[#e8f4f8] text-[#2c5f6f]";
                  } else {
                    buttonClass += "border-gray-200 hover:border-[#4f8c9f] hover:bg-[#f5fafb]";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4f8c9f] bg-opacity-10 flex items-center justify-center text-[#4f8c9f] font-semibold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 text-sm leading-relaxed">{option}</span>
                      {showResult && index === currentQ.correct_answer && (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      )}
                      {showResult && index === selectedAnswer && index !== currentQ.correct_answer && (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Açıklama (Sonuç gösterildiğinde) */}
            {showResult && (
              <div className="mt-6 p-4 bg-[#f5fafb] rounded-xl border border-[#4f8c9f] border-opacity-20">
                <h4 className="font-semibold text-[#2c5f6f] mb-2">📚 Açıklama:</h4>
                <p className="text-sm text-[#4f8c9f] leading-relaxed">{currentQ.explanation}</p>
                <p className="text-xs text-[#6b9dad] mt-2">Kaynak: {currentQ.source}</p>
              </div>
            )}
          </div>

          {/* Butonlar */}
          <div className="flex gap-4">
            {!showResult ? (
              <Button
                onClick={handleConfirm}
                disabled={selectedAnswer === null}
                className="w-full py-6 bg-[#4f8c9f] hover:bg-[#3d7080] text-white rounded-xl disabled:opacity-50"
              >
                Cevabı Onayla
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full py-6 bg-[#4f8c9f] hover:bg-[#3d7080] text-white rounded-xl"
              >
                {currentQuestion < questions.length - 1 ? (
                  <>
                    Sonraki Soru
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Sonuçları Gör
                    <Trophy className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="bottom-nav">
          <div className="bottom-nav-content">
            <div className="nav-item" onClick={() => navigate('/')}>
              <BookOpen size={24} />
              <span>Ana Sayfa</span>
            </div>
            <div className="nav-item active">
              <Trophy size={24} />
              <span>Quiz</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/favorites')}>
              <Heart size={24} />
              <span>Favoriler</span>
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

  // Kategori seçim ekranı
  return (
    <div className="page-container pb-24">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h1 className="text-3xl font-bold text-[#2c5f6f] mb-2">Mini Quiz</h1>
        <p className="text-[#4f8c9f]">İlmihal bilgilerinizi test edin</p>
      </div>

      {/* Genel Quiz Butonu */}
      <div className="max-w-2xl mx-auto mb-8">
        <Button
          onClick={() => startQuiz(null)}
          disabled={loading}
          className="w-full py-8 text-lg bg-gradient-to-r from-[#4f8c9f] to-[#2c5f6f] hover:from-[#3d7080] hover:to-[#1e4a56] text-white rounded-2xl shadow-lg"
        >
          <Trophy className="w-6 h-6 mr-3" />
          {loading ? 'Yükleniyor...' : 'Karışık Quiz Başlat (10 Soru)'}
        </Button>
      </div>

      {/* Kategori Seçimi */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-[#2c5f6f] mb-4">veya Kategori Seçin</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => !loading && startQuiz(category.id)}
              className="glass-effect p-5 rounded-xl cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{getCategoryIcon(category.id)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2c5f6f]">{getCategoryName(category.id)}</h3>
                  <p className="text-sm text-[#6b9dad]">{category.question_count} soru</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#4f8c9f]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-nav">
        <div className="bottom-nav-content">
          <div className="nav-item" onClick={() => navigate('/')}>
            <BookOpen size={24} />
            <span>Ana Sayfa</span>
          </div>
          <div className="nav-item active">
            <Trophy size={24} />
            <span>Quiz</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/favorites')}>
            <Heart size={24} />
            <span>Favoriler</span>
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

export default Quiz;
