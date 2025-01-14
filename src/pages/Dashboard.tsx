import { useState, useEffect } from 'react'
import { PlusIcon, Share,Wand2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import CreateContentModel from '../components/ui/CreateContentModel'
import Sidebar from '../components/ui/Sidebar'
import ShareContentModel from '../components/ui/ShareContentModel'
import axios from 'axios'
import AIContentCreator from '../components/ui/AIContentCreatorModel';
import { useNavigate } from 'react-router'


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
    const navigate = useNavigate()
    useEffect(()=>{
      const user = sessionStorage.getItem('user')
      if(!user){
        navigate('/login')
      }
    },[])
    const api = axios.create({
        baseURL: 'http://localhost:3000',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        }
    });
    var [link,setLink] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [category, setCategory] = useState("all");
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
    //@ts-ignore
    const handleAIContentGenerated = async (contentSuggestion) => {
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

    useEffect(() => {
        fetchCards();
    }, [category]);
    console.log(link)
    // Distribute cards into columns
    const distributeCards = (cards: any[]) => {
        const filteredCards = cards.filter(card => 
            category === "all" || card.type === category
        );
        
        const columnArrays = Array.from({ length: columns }, () => []);
        
        filteredCards.forEach((card, index) => {
            const columnIndex = index % columns;
            //@ts-ignore
            columnArrays[columnIndex].push(card);
        });
        
        return columnArrays;
    };

    const fetchLink = async ()=>{
      try {
        const response = await api.post("/api/v1/brain/share",{
          share : true
        })
        console.log(response.data)
        setLink(response.data.link)
        console.log(link)
      } catch (error) {
        console.log(error)
      }
    }
    useEffect(()=>{
      fetchLink()
    },[isModalOpen])

    const columnArrays = distributeCards(cards);

    return (
        <div className="flex w-full min-h-screen bg-gray-50">
            <Sidebar setCategory={setCategory} category={category} isMobileOpen={false} setIsMobileOpen={function (isOpen: boolean): void {
          throw new Error('Function not implemented.')
        } } />
            
            <div className="flex-1 p-6 overflow-x-hidden">
                <div className="max-w-[2000px] mx-auto">
                    <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50 z-10 py-1">
                        <h1 className="text-2xl font-semibold text-gray-800">
                            {category.charAt(0).toUpperCase() + category.slice(1)} Content
                        </h1>
                        <div className="flex gap-4">
                          <Button text='Share Brain' variant='secondary' size='md' startIcon={<Share/>} onClick={()=>setIsShareModalOpen(true)}/>
                          <Button text='Create with AI' variant='secondary' size='md' startIcon={<Wand2/>} onClick={()=>setIsAIModalOpen(true)}/>
                          <Button text='Add Content' variant='primary' size='md' startIcon={<PlusIcon/>} onClick={()=>setIsModalOpen(true)}/>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full"></div>
                        </div>
                    ) : (
                        <div className="flex gap-6 w-full min-h-[200px]">
                            {columnArrays.map((columnCards, columnIndex) => (
                                <div key={columnIndex} className="flex-1 flex flex-col gap-6">
                                    {columnCards.map((card: any) => (
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

            {isModalOpen && (
                <CreateContentModel 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fetchCards = {fetchCards}
                />
            )}

            {isAIModalOpen && (
              <AIContentCreator 
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                cards={cards}
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