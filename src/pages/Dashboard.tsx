import { useState, useEffect } from 'react';
import { PlusIcon, Share, Wand2, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import CreateContentModel from '../components/ui/CreateContentModel';
import Sidebar from '../components/ui/Sidebar';
import ShareContentModel from '../components/ui/ShareContentModel';
import axios from 'axios';
import AIContentCreator from '../components/ui/AIContentCreatorModel';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/ui/SearchBar';

interface CardType {
  _id: string;
  title: string;
  type: 'youtube' | 'twitter' | 'document';
  link: string;
  description: string;
  tags: {name:string}[];
}

interface AIContentSuggestion {
  title: string;
  type: string;
  link: string;
  description: string;
  tags: string[];
}

const useResponsiveColumns = () => {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 1024) setColumns(2);
      else if (width < 1536) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
};

const Dashboard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const api = axios.create({
    baseURL: 'https://second-brain-backend-rymw.onrender.com',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const [link, setLink] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const columns = useResponsiveColumns();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/v1/content");
      setCards(response.data.content);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase());
  };

  const handleAIContentGenerated = async (contentSuggestion: AIContentSuggestion) => {
    try {
      await api.post("/api/v1/content", {
        title: contentSuggestion.title,
        type: contentSuggestion.type.toLowerCase(),
        link: contentSuggestion.link,
        description: contentSuggestion.description,
        tags: contentSuggestion.tags || []
      });
      fetchCards();
    } catch (error) {
      console.error('Error creating AI content:', error);
    }
  };

  const fetchLink = async () => {
    try {
      const response = await api.post("/api/v1/brain/share", {
        share: true
      });
      setLink(response.data.link);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [category]);

  useEffect(() => {
    fetchLink();
  }, [isModalOpen]);

  const distributeCards = (cards: CardType[]) => {
    const filteredCards = cards.filter(card => {
      const matchesCategory = category === "all" || card.type === category;
      const matchesSearch = searchTerm === '' || 
        card.title.toLowerCase().includes(searchTerm) ||
        card.description?.toLowerCase().includes(searchTerm) ||
        card.tags.some(tag => 
          typeof tag === 'string' 
          // @ts-ignore
            ? tag.toLowerCase().includes(searchTerm)
            : tag.name.toLowerCase().includes(searchTerm)
        );
      
      return matchesCategory && matchesSearch;
    });
    
    const columnArrays = Array.from({ length: columns }, () => [] as CardType[]);
    
    filteredCards.forEach((card, index) => {
      const columnIndex = index % columns;
      columnArrays[columnIndex].push(card);
    });
    
    return columnArrays;
  };

  const columnArrays = distributeCards(cards);

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar 
        setCategory={setCategory} 
        category={category} 
        isMobileOpen={false}
        setIsMobileOpen={() => {}}
      />
      
      <div className="flex-1 overflow-x-hidden">
        {/* Navbar */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-[2000px] mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center flex-1 gap-4">
                <h1 className="text-2xl font-semibold text-gray-800 whitespace-nowrap">
                  {category.charAt(0).toUpperCase() + category.slice(1)} Content
                </h1>
                <div className="flex-1 max-w-xl">
                  <SearchBar onSearch={handleSearch} />
                </div>
              </div>
              <div className="flex gap-4">
                <Button 
                  text='Share Brain' 
                  variant='secondary' 
                  size='md' 
                  startIcon={<Share/>} 
                  onClick={() => setIsShareModalOpen(true)}
                />
                <Button 
                  text='Create with AI' 
                  variant='secondary' 
                  size='md' 
                  startIcon={<Wand2/>} 
                  onClick={() => setIsAIModalOpen(true)}
                />
                <Button 
                  text='Add Content' 
                  variant='primary' 
                  size='md' 
                  startIcon={<PlusIcon/>} 
                  onClick={() => setIsModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <div className="max-w-[2000px] mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              </div>
            ) : columnArrays[0].length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <Search className="w-12 h-12 mb-4 text-gray-400" />
                <p className="text-lg font-medium">No matching content found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="flex gap-6 w-full min-h-[200px]">
                {columnArrays.map((columnCards, columnIndex) => (
                  <div key={columnIndex} className="flex-1 flex flex-col gap-6">
                    {columnCards.map((card) => (
                      <div key={card._id}>
                        <Card 
                          title={card.title}
                          type={card.type}
                          link={card.link}
                          _id={card._id}
                          fetchCards={fetchCards}
                          tags={card.tags}
                          description={card.description}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CreateContentModel 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fetchCards={fetchCards}
        />
      )}

      {isAIModalOpen && (
        <AIContentCreator 
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          //@ts-ignore
          cards={cards}
          //@ts-ignore
          onContentGenerated={handleAIContentGenerated}
        />
      )}

      <ShareContentModel 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        link={link}
      />
    </div>
  );
};

export default Dashboard;