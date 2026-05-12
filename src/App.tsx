import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, Palette, Languages, ChevronRight, Loader2, ListTodo, CheckCircle2, Circle, GraduationCap, Play, RotateCcw, Check, X, Home, Youtube, Menu, Bell, User, ThumbsUp, Clock, Sparkles, BookOpen, Image as ImageIcon, Upload, Trash2, Heart } from 'lucide-react';
import { translateText, generateQuizQuestion } from './services/geminiService';

const VOCABULARY = {
  CORE: [
    "Ability", "About", "Above", "Accept", "According", "Account", "Across", "Action", "Activity", "Actually",
    "Address", "Administration", "Admit", "Adult", "Affect", "After", "Again", "Against", "Age", "Agency",
    "Agent", "Ago", "Agree", "Agreement", "Ahead", "Air", "All", "Allow", "Almost", "Alone",
    "Along", "Already", "Also", "Although", "Always", "American", "Among", "Amount", "Analysis", "And",
    "Animal", "Another", "Answer", "Any", "Anyone", "Anything", "Appear", "Apply", "Approach", "Area",
    "Argue", "Arm", "Around", "Arrive", "Art", "Article", "Artist", "As", "Ask", "Assume",
    "At", "Attack", "Attention", "Attorney", "Audience", "Author", "Authority", "Available", "Avoid", "Away",
    "Baby", "Back", "Bad", "Bag", "Ball", "Bank", "Bar", "Base", "Be", "Beat",
    "Beautiful", "Because", "Become", "Bed", "Before", "Begin", "Behavior", "Behind", "Believe", "Benefit",
    "Best", "Better", "Between", "Beyond", "Big", "Bill", "Billion", "Bit", "Black", "Blood",
    "Blue", "Board", "Body", "Book", "Born", "Both", "Box", "Boy", "Break", "Bring"
  ],
  ACADEMIC: [
    "Analyze", "Approach", "Assume", "Authority", "Available", "Benefit", "Concept", "Consistent", "Context", "Data",
    "Derive", "Distribute", "Economic", "Environment", "Establish", "Estimate", "Evidence", "Export", "Factor", "Finance",
    "Formula", "Function", "Identify", "Income", "Indicate", "Individual", "Interpret", "Involve", "Issue", "Labour",
    "Legal", "Legislate", "Major", "Method", "Occur", "Percent", "Period", "Policy", "Principle", "Proceed",
    "Process", "Require", "Research", "Respond", "Role", "Section", "Sector", "Significant", "Similar", "Source",
    "Specific", "Structure", "Theory", "Variable", "Achieve", "Acquisition", "Alternative", "Appropriate", "Aspect", "Assist"
  ],
  BUSINESS: [
    "Management", "Liability", "Asset", "Revenue", "Investment", "Strategy", "Proposal", "Negotiation", "Growth", "Innovation",
    "Accounting", "Acquisition", "Advantage", "Advertisement", "Agenda", "Amortization", "Analysis", "Asset", "Audit", "Automation",
    "Benchmark", "Bid", "Blue-chip", "Boardroom", "Brainstorm", "Budget", "Capital", "Cash flow", "CEO", "Collaboration",
    "Commercial", "Commodity", "Competition", "Consultant", "Consumer", "Contract", "Corporate", "Currency", "Deadline", "Deficit",
    "Delivery", "Department", "Depreciation", "Director", "Distribution", "Dividend", "Downsizing", "E-commerce", "Efficiency", "Employee"
  ],
  TRAVEL: [
    "Itinerary", "Departure", "Arrival", "Accommodation", "Destination", "Passport", "Shuttle", "Excursion", "Landmark", "Customs",
    "Adventure", "Backpack", "Baggage", "Boarding pass", "Booking", "Budget", "Carry-on", "Check-in", "City break", "Cruise",
    "Currency exchange", "Delayed", "Duty-free", "Ecotourism", "Embassy", "Flight", "Guidebook", "Hostel", "Insurance", "Jet lag",
    "Journey", "Landing", "Layover", "Luggage", "Map", "Motel", "Passenger", "Reservation", "Resort", "Route",
    "Safari", "Sightseeing", "Souvenir", "Suitcase", "Terminal", "Ticket", "Tour", "Tourist", "Transfer", "Travel agent"
  ],
  DAILY: [
    "Hello", "How are you?", "Thank you", "Good morning", "Good night", 
    "I am hungry", "Excuse me", "Nice to meet you", "Have a great day", "See you later",
    "What's up?", "Take care", "I'm sorry", "No problem", "I don't know", "Could you help me?",
    "Where is the restroom?", "How much is this?", "I need a doctor", "Can I have some water?",
    "Bless you", "Congratulations", "Merry Christmas", "Happy Birthday", "Long time no see",
    "I'm on my way", "Better late than never", "So far so good", "Keep it up", "Good luck"
  ],
  IDIOMS: [
    "Piece of cake", "Break a leg", "Under the weather", "Better late than never", "Call it a day",
    "A blessing in disguise", "Bite the bullet", "Cutting corners", "Easy does it", "Get out of hand"
  ],
  PHRASAL_VERBS: [
    "Get up", "Look for", "Run out of", "Break down", "Give up", "Carry on", "Back down", "Call off", "Bring up", "Check in"
  ]
};

const ALL_WORDS = Object.values(VOCABULARY).flat();

const BOOKS = [
  { 
    id: 1, 
    title: "The Little Prince", 
    author: "Antoine de Saint-Exupéry", 
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&h=600&auto=format&fit=crop", 
    level: "A2 - Elementary", 
    desc: "A beautiful story about a young prince who travels to different planets.",
    content: "Once when I was six years old I saw a magnificent picture in a book, called True Stories from Nature, about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal. Here is a copy of the drawing.\n\nIn the book it said: 'Boa constrictors swallow their prey whole, without chewing it. After that they are not able to move, and they sleep through the six months that they need for digestion.'\n\nI pondered deeply, then, over the adventures of the jungle. And after some work with a colored pencil I succeeded in making my first drawing. My Drawing Number One.\n\nI showed my masterpiece to the grown-ups, and asked them whether the drawing frightened them. They answered: 'Frighten? Why should any one be frightened by a hat?'\n\nMy drawing was not a picture of a hat. It was a picture of a boa constrictor digesting an elephant. But since the grown-ups were not able to understand it, I made another drawing: I drew the inside of a boa constrictor, so that the grown-ups could see it clearly. They always need to have things explained. My Drawing Number Two looked like this..."
  },
  { 
    id: 2, 
    title: "1984", 
    author: "George Orwell", 
    cover: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400&h=600&auto=format&fit=crop", 
    level: "B2 - Upper Intermediate", 
    desc: "A classic dystopian novel about government surveillance and control.",
    content: "It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.\n\nThe hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features.\n\nWinston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working, and at present the electric current was cut off during daylight hours. It was part of the economy drive in preparation for Hate Week. The flat was seven flights up, and Winston, who was thirty-nine and had a varicose ulcer above his right ankle, went slowly, resting several times on the way. On each landing, opposite the lift-shaft, the poster with the enormous face gazed from the wall. It was one of those pictures which are so contrived that the eyes follow you about when you move. BIG BROTHER IS WATCHING YOU, the caption beneath it ran."
  },
  { 
    id: 3, 
    title: "The Great Gatsby", 
    author: "F. Scott Fitzgerald", 
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=400&h=600&auto=format&fit=crop", 
    level: "C1 - Advanced", 
    desc: "A story of passion, wealth, and the American Dream in the 1920s.",
    content: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.\n\n'Whenever you feel like criticizing any one,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.'\n\nHe didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores. The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men. Most of the confidences were unsought—frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quivering on the horizon."
  },
  { 
    id: 4, 
    title: "Alice in Wonderland", 
    author: "Lewis Carroll", 
    cover: "https://images.unsplash.com/photo-1490730141103-6ac2155cd3ea?q=80&w=400&h=600&auto=format&fit=crop", 
    level: "A1/A2 - Beginner", 
    desc: "A young girl named Alice falls through a rabbit hole into a fantasy world.",
    content: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversations?'\n\nSo she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.\n\nThere was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, 'Oh dear! Oh dear! I shall be late!' (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge."
  },
  { 
    id: 5, 
    title: "War and Peace", 
    author: "Leo Tolstoy", 
    cover: "https://images.unsplash.com/photo-1543003923-9992601e3ec7?q=80&w=400&h=600&auto=format&fit=crop", 
    level: "C2 - Mastery", 
    desc: "A sprawling epic about the Napoleonic Wars and Russian society.",
    content: "'Well, Prince, so Genoa and Lucca are now just family estates of the Buonapartes. But I warn you, if you don't tell me that this means war, if you still try to defend the infamies and horrors perpetrated by that Antichrist—I really believe he is Antichrist—I will have nothing more to do with you and you are no longer my friend, no longer my 'faithful slave,' as you call yourself! But how do you do? I see I have frightened you—sit down and tell me all the news.'\n\nIt was in July, 1805, and the speaker was the well-known Anna Pavlovna Scherer, maid of honor and favorite of the Empress Marya Fedorovna. With these words she greeted Prince Vasili Kuragin, a man of high rank and importance, who was the first to arrive at her reception. Anna Pavlovna had had a cough for some days. She was, as she said, suffering from la grippe; grippe being then a new word in St. Petersburg, used only by the elite."
  }
];

const VIDEOS = [
  { 
    id: "v-W8u7D7GqM", 
    title: "Advanced English Vocabulary Lesson", 
    channel: "English with Lucy", 
    views: "5.2M", 
    time: "18:24",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400&h=225"
  },
  { 
    id: "JU6X_A_qN40", 
    title: "Everyday English Conversations", 
    channel: "Smart Learning", 
    views: "2.1M", 
    time: "12:15",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400&h=225"
  },
  { 
    id: "pTkZ2ZqQidg", 
    title: "Learn English with TV Series", 
    channel: "Learn English with TV", 
    views: "10M+", 
    time: "25:40",
    thumbnail: "https://images.unsplash.com/photo-1522881451255-634c75ca3382?auto=format&fit=crop&q=80&w=400&h=225"
  },
  { 
    id: "hE2Ira-Cwxo", 
    title: "100 Most Common English Phrases", 
    channel: "English Academy", 
    views: "3.5M", 
    time: "15:42",
    thumbnail: "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=400&h=225"
  },
  { 
    id: "_OBlgSz8sSM", 
    title: "Improve Your English Speaking", 
    channel: "Speak English With Tiffani", 
    views: "4.1M", 
    time: "21:05",
    thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400&h=225"
  },
  { 
    id: "87_L5XIn3S0", 
    title: "English for Real Life", 
    channel: "BBC Learning English", 
    views: "1.8M", 
    time: "10:30",
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400&h=225"
  },
  { 
    id: "Yp86L-mS_0E", 
    title: "How to Learn English Faster", 
    channel: "Mister Duncan", 
    views: "2.5M", 
    time: "14:20",
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400&h=225"
  },
  { 
    id: "Z78An5mX5kE", 
    title: "Business English Masterclass", 
    channel: "Learn English", 
    views: "950K", 
    time: "32:15",
    thumbnail: "https://images.unsplash.com/photo-1454165833767-027ffcb7141b?auto=format&fit=crop&q=80&w=400&h=225"
  }
];

const THEMES = [
  { id: 'light', bg: 'bg-zinc-50', primary: '#FF0000', text: 'text-zinc-900', secondaryBg: 'bg-white' },
  { id: 'dark', bg: 'bg-zinc-950', primary: '#FF0000', text: 'text-zinc-100', secondaryBg: 'bg-zinc-900' },
  { id: 'indigo', bg: 'bg-indigo-950', primary: '#6366f1', text: 'text-indigo-50', secondaryBg: 'bg-indigo-900' },
  { id: 'emerald', bg: 'bg-emerald-950', primary: '#10b981', text: 'text-emerald-50', secondaryBg: 'bg-emerald-900' }
];

const LANGUAGES = [
  { code: "Uzbek", name: "O'zbek" },
  { code: "Russian", name: "Rus" },
  { code: "German", name: "Nemis" },
  { code: "French", name: "Fransuz" },
  { code: "Spanish", name: "Ispan" },
  { code: "Turkish", name: "Turk" }
];

type QuizQuestion = {
  phrase: string;
  correct: string;
  options: string[];
};

type HistoryItem = {
  phrase: string;
  translation: string;
  language: string;
  timestamp: number;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'quiz' | 'history' | 'profile' | 'books'>('home');
  const [search, setSearch] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [learnedPhrases, setLearnedPhrases] = useState<Set<string>>(new Set());
  const [learningPoints, setLearningPoints] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [correctAnswersList, setCorrectAnswersList] = useState<Set<string>>(new Set());
  const [wrongAnswersList, setWrongAnswersList] = useState<Set<string>>(new Set());
  const [userName, setUserName] = useState("Shoxhusanov");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("Shoxhusanov");
  const [selectedBook, setSelectedBook] = useState<typeof BOOKS[0] | null>(null);
  const [readerFontSize, setReaderFontSize] = useState(18);
  const [readerFontFamily, setReaderFontFamily] = useState('font-serif');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quiz State
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [usedQuizPhrases, setUsedQuizPhrases] = useState<Set<string>>(new Set());

  const filteredPhrases = useMemo(() => {
    let base = activeCategory === 'ALL' ? ALL_WORDS : VOCABULARY[activeCategory as keyof typeof VOCABULARY];
    return base.filter(phrase => 
      phrase.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, activeCategory]);

  const handleTranslate = async (phrase: string) => {
    if (translations[`${phrase}_${selectedLanguage.code}`]) return;
    setLoading(prev => ({ ...prev, [phrase]: true }));
    const result = await translateText(phrase, selectedLanguage.code);
    setTranslations(prev => ({ ...prev, [`${phrase}_${selectedLanguage.code}`]: result }));
    setLoading(prev => ({ ...prev, [phrase]: false }));
    
    setHistory(prev => [{
      phrase,
      translation: result,
      language: selectedLanguage.name,
      timestamp: Date.now()
    }, ...prev].slice(0, 50));
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startNewQuestion = useCallback(async () => {
    setQuizLoading(true);
    setAnswered(null);
    setTimeLeft(20);
    
    let availablePhrases = ALL_WORDS.filter(p => !usedQuizPhrases.has(p));
    if (availablePhrases.length === 0) {
      setUsedQuizPhrases(new Set());
      availablePhrases = ALL_WORDS;
    }
    
    const randomPhrase = availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
    setUsedQuizPhrases(prev => new Set(prev).add(randomPhrase));
    
    const question = await generateQuizQuestion(randomPhrase, selectedLanguage.code);
    
    // Shuffle the options so they appear in different places every time
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    
    setCurrentQuestion({
      ...question,
      options: shuffledOptions
    });
    setQuizLoading(false);
  }, [selectedLanguage.code, usedQuizPhrases]);

  useEffect(() => {
    if (activeTab === 'quiz' && currentQuestion && !answered && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !answered) {
      setAnswered("TIME_UP");
    }
  }, [activeTab, currentQuestion, answered, timeLeft]);

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(option);
    
    if (option === currentQuestion?.correct) {
      setQuizScore(prev => prev + 1);
      setCorrectAnswersList(prev => new Set(prev).add(currentQuestion!.phrase));
    } else {
      setWrongAnswersList(prev => new Set(prev).add(currentQuestion!.phrase));
    }
  };

  const isDark = currentTheme.id !== 'light';

  return (
    <div className={`min-h-screen transition-all duration-500 font-sans ${currentTheme.text} relative overflow-x-hidden`}>
      {/* Background Layer */}
      <div 
        className={`fixed inset-0 z-[-1] transition-all duration-700 ${customBg ? '' : currentTheme.bg}`}
        style={customBg ? { 
          backgroundImage: `url(${customBg})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          filter: isDark ? 'brightness(0.3)' : 'brightness(0.9) contrast(0.8)'
        } : {}}
      />
      {customBg && <div className={`fixed inset-0 z-[-1] bg-black/20 backdrop-blur-[1px] transition-opacity ${isDark ? 'opacity-100' : 'opacity-0'}`} />}

      {/* Header */}
      <header className={`fixed top-0 left-0 w-full h-14 ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-white/70 border-zinc-200'} backdrop-blur-xl flex items-center justify-between px-4 z-50 border-b shadow-sm`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-black/10 rounded-full transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="bg-[#FF0000] p-1 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
              <Youtube className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-indigo-600">
              Super English
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-2xl px-8">
          <div className={`flex flex-1 items-center bg-transparent border rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all ${isDark ? 'border-zinc-700 bg-zinc-900/40' : 'border-zinc-300 bg-zinc-100/40'}`}>
            <input 
              type="text" 
              placeholder="Istalgan so'zni qidiring..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-500 font-medium"
            />
            <Search className="w-4 h-4 text-zinc-500" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 mr-2 border-r pr-3 border-zinc-500/30">
             <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-black/10 rounded-full transition-colors relative group"
              title="Orqa fonni almashtirish"
            >
              <ImageIcon className="w-5 h-5" />
              <input type="file" ref={fileInputRef} onChange={handleBgUpload} accept="image/*" className="hidden" />
            </button>
            <button 
              onClick={() => {
                const currentIdx = THEMES.indexOf(currentTheme);
                setCurrentTheme(THEMES[(currentIdx + 1) % THEMES.length]);
              }}
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
            >
              <Palette className="w-5 h-5" />
            </button>
          </div>
          <button className="p-2 hover:bg-black/10 rounded-full group">
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </button>
          <div 
            onClick={() => setActiveTab('profile')}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-lg cursor-pointer ring-2 ring-white/20 hover:scale-110 transition-all"
          >
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 transition-all duration-300 z-40 border-r ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200'} backdrop-blur-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="p-4 space-y-1.5">
          <SidebarItem active={activeTab === 'home'} icon={<Home className="w-5 h-5" />} label="Asosiy" onClick={() => setActiveTab('home')} isDark={isDark} />
          <SidebarItem active={activeTab === 'books'} icon={<BookOpen className="w-5 h-5" />} label="Kitoblar" onClick={() => setActiveTab('books')} isDark={isDark} />
          <SidebarItem active={activeTab === 'videos'} icon={<Youtube className="w-5 h-5" />} label="Videolar" onClick={() => setActiveTab('videos')} isDark={isDark} />
          <SidebarItem active={activeTab === 'quiz'} icon={<GraduationCap className="w-5 h-5" />} label="Testlar" onClick={() => setActiveTab('quiz')} isDark={isDark} />
          <div className={`my-6 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`} />
          <SidebarItem active={activeTab === 'history'} icon={<Clock className="w-5 h-5" />} label="Tarix" onClick={() => setActiveTab('history')} isDark={isDark} />
          <SidebarItem active={activeTab === 'profile'} icon={<User className="w-5 h-5" />} label="Profil" onClick={() => setActiveTab('profile')} isDark={isDark} />
          {customBg && (
            <button 
              onClick={() => setCustomBg(null)}
              className="w-full flex items-center gap-5 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors mt-8 text-sm font-bold"
            >
              <Trash2 className="w-5 h-5" /> Fonni o'chirish
            </button>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pt-14 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-[calc(100vh-3.5rem)]">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-10">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <StatCard icon={<ListTodo className="w-6 h-6" />} label="Progress" value={`${Math.round((learnedPhrases.size / ALL_WORDS.length) * 100)}%`} progress={(learnedPhrases.size / ALL_WORDS.length) * 100} isDark={isDark} />
                  <StatCard icon={<CheckCircle2 className="w-6 h-6" />} label="O'rganildi" value={`${learnedPhrases.size} so'z`} isDark={isDark} color="emerald" />
                  <StatCard icon={<ThumbsUp className="w-6 h-6" />} label="Tajriba balli" value={learningPoints + (quizScore * 50)} isDark={isDark} color="amber" />
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black tracking-tight">Lug'at bazasi</h2>
                      <p className="text-sm text-zinc-500 font-medium">Kundalik hayotda eng ko'p ishlatiladigan so'zlar to'plami</p>
                    </div>
                    <div className="flex items-center gap-4 bg-black/5 p-1 rounded-xl backdrop-blur-sm self-stretch md:self-auto">
                      <span className="text-xs font-bold text-zinc-500 ml-3 uppercase tracking-wider">Tili:</span>
                      <select 
                        value={selectedLanguage.code}
                        onChange={(e) => setSelectedLanguage(LANGUAGES.find(l => l.code === e.target.value)!)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-bold border-none outline-none shadow-sm transition-all ${isDark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setActiveCategory('ALL')}
                      className={`px-5 py-2 rounded-full text-xs font-black transition-all ${activeCategory === 'ALL' ? 'bg-[#FF0000] text-white' : (isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-100 text-zinc-500')}`}
                    >
                      HAMMASI
                    </button>
                    {Object.keys(VOCABULARY).map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-xs font-black transition-all ${activeCategory === cat ? 'bg-[#FF0000] text-white' : (isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-100 text-zinc-500')}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                  {search && !ALL_WORDS.some(p => p.toLowerCase() === search.toLowerCase()) && (
                    <motion.div 
                      key="ai-search"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleTranslate(search)}
                      className={`group p-6 rounded-2xl cursor-pointer transition-all border-2 border-dashed relative overflow-hidden ${isDark ? 'bg-indigo-600/10 border-indigo-500/40 hover:bg-indigo-600/20' : 'bg-indigo-50 border-indigo-300 hover:bg-indigo-100/50'}`}
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:rotate-12 transition-transform">
                        <Sparkles className="w-8 h-8 text-indigo-500" />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">AI Discover</span>
                      </div>
                      <h3 className="font-black text-xl mb-3 leading-tight">"{search}"</h3>
                      <div className="min-h-[1.5rem]">
                        {loading[search] ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin"/> AI...
                          </div>
                        ) : (
                          <div className="space-y-2">
                             <p className="text-indigo-600 font-black text-sm">
                               {translations[`${search}_${selectedLanguage.code}`] || "Tarjima qilish"}
                             </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  {filteredPhrases.slice(0, 100).map((phrase, idx) => (
                    <PhraseCard 
                      key={phrase}
                      phrase={phrase}
                      idx={idx}
                      isDark={isDark}
                      isLearned={learnedPhrases.has(phrase)}
                      loading={loading[phrase]}
                      translation={translations[`${phrase}_${selectedLanguage.code}`]}
                      onTranslate={() => handleTranslate(phrase)}
                      onToggleLearned={() => setLearnedPhrases(prev => {
                        const next = new Set(prev);
                        if (next.has(phrase)) { next.delete(phrase); setLearningPoints(p => Math.max(0, p - 10)); }
                        else { next.add(phrase); setLearningPoints(p => p + 10); }
                        return next;
                      })}
                    />
                  ))}
                </div>
                {filteredPhrases.length > 100 && (
                  <div className="flex justify-center pb-20">
                    <button className="px-10 py-4 bg-black/5 hover:bg-black/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                      Yana ko'proq yuklash
                    </button>
                  </div>
                )}   </div>
              </motion.div>
            )}

            {activeTab === 'books' && (
              <motion.div key="books" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-black tracking-tight">Kitoblar</h2>
                  <p className="text-sm text-zinc-500 font-medium">Til o'rganish uchun tavsiya etilgan adabiyotlar</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {BOOKS.map((book) => (
                    <BookCard key={book.id} book={book} isDark={isDark} onRead={() => setSelectedBook(book)} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'videos' && (
              <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-3xl font-black mb-8">Video Darslar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {VIDEOS.map((video) => (
                    <VideoCard key={video.id} video={video} isDark={isDark} onClick={() => setSelectedVideo(video.id)} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex flex-col items-center py-10">
                {!currentQuestion ? (
                  <div className={`p-14 rounded-[32px] text-center max-w-lg w-full border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white/60 border-zinc-200 shadow-2xl backdrop-blur-md'}`}>
                    <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
                      <GraduationCap className="w-12 h-12 text-[#FF0000]" />
                    </div>
                    <h2 className="text-4xl font-black mb-3 italic">Challenge Time!</h2>
                    <p className="text-zinc-500 mb-10 font-bold">20 soniya ichida javob toping. Tayyormisiz?</p>
                    <button 
                      onClick={startNewQuestion}
                      disabled={quizLoading}
                      className="w-full bg-[#FF0000] hover:bg-[#CC0000] text-white py-5 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
                    >
                      {quizLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" />}
                      BOSHLASH
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-3xl">
                    <div className="flex justify-between items-center mb-10 bg-black/5 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                      <div className="bg-indigo-600 text-white px-5 py-2 rounded-full font-black text-lg">BALL: {quizScore}</div>
                      <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center font-black text-2xl transition-colors ${timeLeft < 5 ? 'border-red-500 text-red-500 animate-pulse' : 'border-indigo-500/20 text-indigo-600'}`}>
                        {timeLeft}
                      </div>
                    </div>

                    <motion.div 
                      layout
                      className={`p-10 rounded-[40px] text-center mb-10 border-t border-white/20 shadow-2xl relative overflow-hidden ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-zinc-100'}`}
                    >
                      <span className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block underline">Question</span>
                      <h3 className="text-4xl font-black leading-tight">"{currentQuestion.phrase}"</h3>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {currentQuestion.options.map((option, idx) => {
                        const isCorrect = option === currentQuestion.correct;
                        const isSelected = answered === option;
                        let itemClass = isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white/60 border-zinc-200 backdrop-blur-sm';
                        
                        if (answered) {
                          if (isCorrect) itemClass = "bg-emerald-500 border-emerald-500 text-white scale-[1.02]";
                          else if (isSelected) itemClass = "bg-red-500 border-red-500 text-white";
                          else itemClass = "opacity-30 grayscale pointer-events-none";
                        }

                        return (
                          <motion.button
                            key={idx}
                            whileHover={!answered ? { scale: 1.02, y: -2 } : {}}
                            onClick={() => handleAnswer(option)}
                            disabled={!!answered}
                            className={`p-6 rounded-[24px] text-left font-black text-lg border-2 transition-all flex items-center justify-between group shadow-sm ${itemClass}`}
                          >
                            <span>{option}</span>
                            {answered && isCorrect && <Check className="w-5 h-5 text-white stroke-[4px]" />}
                            {answered && isSelected && !isCorrect && <X className="w-5 h-5 text-white stroke-[4px]" />}
                          </motion.button>
                        );
                      })}
                    </div>

                    {answered && (
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
                        <button 
                          onClick={startNewQuestion}
                          className="w-full bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all"
                        >
                          <RotateCcw className="w-6 h-6" /> KEYINGI SAVOL
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

             {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black">Tarix</h2>
                  <button onClick={() => setHistory([])} className="px-6 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-black hover:bg-red-500/20 transition-all border border-red-500/20">TOZALASH</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.length > 0 ? history.map((item, idx) => (
                    <div key={idx} className={`p-6 rounded-2xl border flex justify-between items-center group transition-all ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white/60 border-zinc-100 shadow-sm backdrop-blur-md'}`}>
                      <div>
                        <p className="font-black text-lg uppercase">{item.phrase}</p>
                        <p className="text-sm font-bold text-zinc-500">{item.translation} <span className="text-[10px] opacity-40 ml-2">({item.language})</span></p>
                      </div>
                      <span className="text-[10px] font-black text-zinc-300">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )) : <div className="col-span-full py-32 text-center opacity-40 uppercase font-black tracking-widest">Tarix bo'sh</div>}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto py-10">
                <div className={`p-12 rounded-[48px] border relative overflow-hidden ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-zinc-100 shadow-2xl backdrop-blur-xl'}`}>
                   <div className="relative flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black mb-8 shadow-2xl ring-4 ring-white/20 transform hover:rotate-6 transition-transform">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    {isEditingName ? (
                      <div className="flex flex-col items-center gap-4 w-full max-w-sm mb-6">
                        <input 
                          type="text" 
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className={`w-full px-6 py-4 rounded-2xl text-xl font-black text-center outline-none ring-2 ring-indigo-500/50 ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'}`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setUserName(tempName);
                              setIsEditingName(false);
                            }
                          }}
                        />
                        <div className="flex gap-2 w-full">
                          <button 
                            onClick={() => {
                              setUserName(tempName);
                              setIsEditingName(false);
                            }}
                            className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-black text-xs uppercase"
                          >
                            Saqlash
                          </button>
                          <button 
                            onClick={() => setIsEditingName(false)}
                            className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-xl font-black text-xs uppercase"
                          >
                            Bekor qilish
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative mb-1">
                        <h2 className="text-4xl font-black italic">{userName}</h2>
                        <button 
                          onClick={() => {
                            setTempName(userName);
                            setIsEditingName(true);
                          }}
                          className="absolute -top-1 -right-8 opacity-0 group-hover:opacity-100 p-2 text-indigo-500 transition-opacity"
                        >
                          <Palette className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <p className="text-zinc-500 font-bold mb-10 tracking-wide uppercase text-xs">Premium ESL Explorer</p>
                    
                    <div className="grid grid-cols-2 gap-6 w-full mb-12">
                      <div className={`p-6 rounded-3xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-zinc-50 shadow-inner'}`}>
                        <p className="text-xs text-zinc-500 font-black uppercase mb-1">To'g'ri</p>
                        <p className="text-3xl font-black text-emerald-500">{correctAnswersList.size}</p>
                      </div>
                      <div className={`p-6 rounded-3xl ${isDark ? 'bg-white/5 border border-white/5' : 'bg-zinc-50 shadow-inner'}`}>
                        <p className="text-xs text-zinc-500 font-black uppercase mb-1">Noto'g'ri</p>
                        <p className="text-3xl font-black text-red-500">{wrongAnswersList.size}</p>
                      </div>
                    </div>

                    <div className="w-full text-left space-y-4">
                      <h3 className="font-black text-xl uppercase tracking-tighter">Yutuqlar</h3>
                      <div className="flex gap-3 flex-wrap">
                        <Badge label="🚀 Starter" active={learnedPhrases.size > 0} icon={<Sparkles className="w-4 h-4" />} />
                        <Badge label="📚 Bookworm" active={learnedPhrases.size > 10} icon={<BookOpen className="w-4 h-4" />} />
                        <Badge label="🔥 Expert" active={quizScore > 5} icon={<ThumbsUp className="w-4 h-4" />} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Navbar */}
      <nav className={`md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-18 ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-zinc-200 shadow-2xl'} border rounded-[32px] backdrop-blur-2xl z-50 flex items-center justify-around px-4`}>
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'home' ? 'text-red-600' : 'text-zinc-500 opacity-60'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Home</span>
        </button>
        <button onClick={() => setActiveTab('books')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'books' ? 'text-indigo-600' : 'text-zinc-500 opacity-60'}`}>
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Books</span>
        </button>
        <button onClick={() => setActiveTab('videos')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'videos' ? 'text-red-600' : 'text-zinc-500 opacity-60'}`}>
          <Youtube className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Video</span>
        </button>
        <button onClick={() => setActiveTab('quiz')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'quiz' ? 'text-purple-600' : 'text-zinc-500 opacity-60'}`}>
          <GraduationCap className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Quiz</span>
        </button>
      </nav>

      {/* Video Modal Player */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book Reader Modal */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className={`relative w-full max-w-4xl h-[85vh] rounded-[40px] overflow-hidden flex flex-col ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900 shadow-2xl'}`}
            >
              <div className="p-8 md:p-12 overflow-y-auto flex-grow custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-10 mb-12">
                  <div className="w-48 h-72 shrink-0 rounded-2xl overflow-hidden shadow-2xl">
                    <img src={selectedBook.cover} className="w-full h-full object-cover" alt={selectedBook.title} />
                  </div>
                  <div className="space-y-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div className="inline-block px-3 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-full uppercase">
                        {selectedBook.level}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setReaderFontFamily(prev => prev === 'font-serif' ? 'font-sans' : 'font-serif')}
                          className={`p-2 rounded-lg text-[10px] font-black uppercase transition-all ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'}`}
                        >
                          {readerFontFamily === 'font-serif' ? 'Sans' : 'Serif'}
                        </button>
                        <div className="flex items-center gap-2 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          <button onClick={() => setReaderFontSize(s => Math.max(12, s - 2))} className="font-black p-1 hover:text-indigo-500">-</button>
                          <span className="text-[10px] font-black w-4 text-center">{readerFontSize}</span>
                          <button onClick={() => setReaderFontSize(s => Math.min(32, s + 2))} className="font-black p-1 hover:text-indigo-500">+</button>
                        </div>
                      </div>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{selectedBook.title}</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest">{selectedBook.author}</p>
                    <div className="h-1 w-20 bg-indigo-500 rounded-full" />
                  </div>
                </div>

                <div 
                  className={`leading-relaxed font-medium transition-all ${readerFontFamily} ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
                  style={{ fontSize: `${readerFontSize}px` }}
                >
                  {selectedBook.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-8">{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className={`p-6 border-t flex justify-between items-center ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Kitob mutolaasi</p>
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Yopish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ active, icon, label, onClick, isDark }: { active: boolean, icon: React.ReactNode, label: string, onClick?: () => void, isDark: boolean }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
        active 
          ? (isDark ? 'bg-zinc-800 text-white font-black shadow-lg shadow-black/20 ring-1 ring-white/10' : 'bg-white text-zinc-900 font-black shadow-lg ring-1 ring-black/5') 
          : (isDark ? 'text-zinc-400 hover:bg-zinc-900/60' : 'text-zinc-600 hover:bg-zinc-100')
      }`}
    >
      {active && <div className="absolute left-0 w-1 h-5 bg-red-600 rounded-full" />}
      <div className={`${active ? 'text-red-600' : 'text-zinc-500 group-hover:scale-110 transition-transform'}`}>{icon}</div>
      <span className="text-sm tracking-tight">{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, progress, isDark, color = "indigo" }: any) {
  return (
    <div className={`p-6 rounded-3xl border flex flex-col gap-4 group transition-all duration-500 overflow-hidden relative shadow-sm ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white/60 border-zinc-100 backdrop-blur-md'}`}>
      <div className="flex items-center gap-4 relative">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform ${color === "emerald" ? "bg-emerald-500 text-white" : color === "amber" ? "bg-amber-500 text-white" : "bg-indigo-600 text-white"}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">{label}</p>
          <p className="text-2xl font-black mt-0.5 leading-none">{value}</p>
        </div>
      </div>
      {typeof progress === 'number' && (
        <div className="w-full h-2 bg-zinc-200/50 rounded-full overflow-hidden relative">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-indigo-600" />
        </div>
      )}
    </div>
  );
}

function PhraseCard({ phrase, isDark, loading, translation, onTranslate, isLearned, onToggleLearned, idx }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.03, 1) }}
      onClick={onTranslate}
      className={`group p-5 rounded-2xl cursor-pointer transition-all border relative overflow-hidden flex flex-col h-full justify-between ${isDark ? 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800/80 hover:shadow-2xl' : 'bg-white border-zinc-100 shadow-sm hover:shadow-xl'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}><Languages className="w-5 h-5 text-indigo-500" /></div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleLearned(); }} 
          className={`p-1.5 rounded-full transition-all ${isLearned ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-300 hover:text-emerald-500 hover:bg-emerald-500/5'}`}
        >
          <CheckCircle2 className={`w-6 h-6 ${isLearned ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div>
        <h3 className={`font-black text-xl mb-3 leading-tight tracking-tight uppercase ${isLearned ? 'opacity-30 line-through' : ''}`}>{phrase}</h3>
        <div className="min-h-[1.5rem] mt-auto">
          {loading ? (
             <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 italic uppercase">
                <Loader2 className="w-3 h-3 animate-spin"/> ...
             </div>
          ) : (
            <p className="text-zinc-500 text-sm font-bold border-l-2 border-indigo-500/30 pl-3 leading-snug">
              {translation || "Tarjima"}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BookCard({ book, isDark, onRead }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={`group relative rounded-[32px] overflow-hidden transition-all h-[420px] ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white shadow-2xl border border-zinc-100'}`}
    >
      <div className="h-3/5 overflow-hidden relative">
        <img src={book.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={book.title} />
        <div className="absolute top-4 left-4 bg-white text-zinc-900 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg z-10">
          {book.level}
        </div>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6 text-center">
          <p className="text-white text-xs font-bold leading-relaxed">{book.desc}</p>
        </div>
      </div>
      <div className="p-6 h-2/5 flex flex-col justify-between">
        <div>
          <h3 className="font-black text-lg line-clamp-1 leading-tight uppercase tracking-tight">{book.title}</h3>
          <p className="text-zinc-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{book.author}</p>
        </div>
        <button 
          onClick={onRead}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest transition-all shadow-lg active:scale-95"
        >
          O'qishni boshlash
        </button>
      </div>
    </motion.div>
  );
}

function VideoCard({ video, isDark, onClick }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -4 }}
      className="cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-video rounded-[24px] overflow-hidden mb-4 shadow-xl">
        <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={video.title} />
        <div className="absolute bottom-3 right-3 bg-black/90 text-white text-[10px] font-black px-2 py-1 rounded-lg">
          {video.time}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-[#FF0000] p-4 rounded-full shadow-2xl">
            <Play className="w-6 h-6 text-white fill-current" />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-xl bg-zinc-200 shrink-0 shadow-inner" />
        <div className="space-y-1">
          <h3 className="font-black text-sm line-clamp-2 leading-tight tracking-tight uppercase">{video.title}</h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>{video.channel}</span>
            <span>•</span>
            <span>{video.views}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Badge({ label, active, icon }: { label: string, active: boolean, icon: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border transition-all ${active ? 'bg-indigo-500 text-white border-indigo-500 shadow-xl shadow-indigo-500/20' : 'bg-black/5 border-transparent text-zinc-400 opacity-40'}`}>
      {icon}
      {label}
    </div>
  );
}
