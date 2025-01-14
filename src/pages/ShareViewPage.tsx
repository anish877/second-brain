import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'

interface Tag {
    name: string;
}

interface Content {
    _id: string;
    title: string;
    type: 'youtube' | 'twitter';
    link: string;
    description?: string;
    tags: Tag[];
}

interface SharedData {
    username: string;
    content: Content[];
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

const SharedView = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<SharedData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const columns = useResponsiveColumns();

    useEffect(() => {
        const fetchSharedContent = async () => {
            try {
                const shareId = window.location.pathname.split('/').pop();
                const response = await fetch(`http://localhost:3000/api/v1/brain/${shareId}`);
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchSharedContent();
    }, []);

    const distributeCards = (cards: Content[]) => {
        const columnArrays = Array.from({ length: columns }, () => [] as Content[]);
        cards.forEach((card, index) => {
            const columnIndex = index % columns;
            columnArrays[columnIndex].push(card);
        });
        return columnArrays;
    };

    const createYouTubeEmbedLink = (link: string) => {
        return link.replace("https://www.youtube.com/watch?v=", "https://www.youtube.com/embed/");
    };

    const formatDescription = (text: string) => {
        if (!text) return { __html: '' };
        
        const formattedText = text
            .split('\n')
            .map(line => {
                let processedLine = line;
                processedLine = processedLine.replace(
                    /\*\*(.*?)\*\*/g,
                    '<span class="font-bold">$1</span>'
                );
                processedLine = processedLine.replace(
                    /__(.*?)__/g,
                    '<span class="underline">$1</span>'
                );
                if (processedLine.startsWith('• ')) {
                    processedLine = `<li class="ml-4">${processedLine.substring(2)}</li>`;
                }
                return processedLine;
            })
            .join('<br/>');

        return { __html: formattedText };
    };

    const Card = ({ content }: { content: Content }) => (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl transition-all duration-300 hover:shadow-lg max-w-full">
            <div className="flex justify-between p-4 items-center border-b border-gray-100">
                <div className="flex gap-2 items-center">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{content.title}</h3>
                </div>
            </div>

            {content.type === "youtube" && (
                <div className="p-4">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        <iframe 
                            width="100%"
                            height="250"
                            src={createYouTubeEmbedLink(content.link)} 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen 
                            className="w-full rounded-lg shadow-sm"
                        />
                    </div>
                </div>
            )}

            {content.type === "twitter" && (
                <div className="p-4">
                    <div className="twitter-tweet-container">
                        <blockquote className="twitter-tweet">
                            <a href={content.link.replace("x.com", "twitter.com")}>Loading tweet...</a>
                        </blockquote>
                    </div>
                </div>
            )}

            {content.description && (
                <div className="px-4 py-3 border-t border-gray-100">
                    <div
                        className="prose prose-sm max-w-none text-gray-600"
                        dangerouslySetInnerHTML={formatDescription(content.description)}
                    />
                </div>
            )}

            <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2 flex-wrap">
                    {content.tags.map((tag, index) => (
                        <div 
                            key={index} 
                            className="py-1 px-2.5 rounded-full text-indigo-600 bg-indigo-50 text-xs font-medium"
                        >
                            #{tag.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        // Load Twitter embed script
        const script = document.createElement('script');
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);

        // Mock data for testing - replace with actual API call
        setData({
            username: "Anish",
            content: []
        });
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
            </div>
        );
    }

    const columnArrays = data ? distributeCards(data.content) : [];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                            {data?.username}'s Second Brain
                        </h1>
                        <p className="text-gray-600">
                            Explore this curated collection of content
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Brain className="h-5 w-5" />
                        Create Your Own Second Brain
                    </button>
                </div>

                <div className="flex gap-6 w-full min-h-[200px]">
                    {columnArrays.map((columnCards, columnIndex) => (
                        <div key={columnIndex} className="flex-1 flex flex-col gap-6">
                            {columnCards.map((card) => (
                                <Card key={card._id} content={card} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SharedView;