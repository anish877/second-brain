import { File, Share2, Trash2, Twitter, Youtube } from "lucide-react"
import axios from "axios"
import CardModal from "./CardModal"
import { useState, useEffect } from "react"

interface CardInterface {
    title: string
    type: "youtube" | "twitter" | "document"
    link: string
    tags: {name: string}[]
    description: string
    _id: string
    fetchCards: () => void
}

function createYouTubeEmbedLink(link: string) {
    return link.replace("https://www.youtube.com/watch?v=", "https://www.youtube.com/embed/");
}

const api = axios.create({
    baseURL: 'https://second-brain-backend-rymw.onrender.com', 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

const handleDelete = async (contentId: string, fetchCards: () => void) => {
    try {
        await api.delete("/api/v1/content", {
            data: { contentId }
        });
        fetchCards();
    } catch (error) {
        console.error('Error deleting content:', error);
    }
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

const Card = (props: CardInterface) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to load Twitter embed script
    const loadTwitterWidget = () => {
        // Remove any existing Twitter script
        const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
        if (existingScript) {
            existingScript.remove();
        }

        // Create and add new Twitter script
        const script = document.createElement('script');
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        document.body.appendChild(script);
    };

    // Load Twitter widget when component mounts or when link changes
    useEffect(() => {
        if (props.type === "twitter") {
            loadTwitterWidget();
        }
    }, [props.type, props.link, isModalOpen]);

    const CardContent = ({ isModal = false }) => (
        <div className={`bg-white border border-gray-200 rounded-xl ${!isModal && 'shadow-xl transition-all duration-300 hover:shadow-lg'} max-w-full`}>
            <div className="flex justify-between p-4 items-center border-b border-gray-100">
                <div className="flex gap-2 items-center text-gray-400">
                    {props.type === "youtube" && <Youtube className="h-5 w-5" />}
                    {props.type === "twitter" && <Twitter className="h-5 w-5" />}
                    {props.type === "document" && <File className="h-5 w-5" />}
                    <h3 className="font-medium text-gray-900 line-clamp-1">{props.title}</h3>
                </div>
                <div className="flex gap-3">
                    <button 
                        className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Share"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Add share functionality here
                        }}
                    >
                        <Share2 className="h-4 w-4" />
                    </button>
                    <button 
                        className="p-1.5 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(props._id, props.fetchCards);
                        }}
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {props.type === "youtube" && (
                <div className="p-4">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        <iframe 
                            width={isModal ? "100%" : "400"}
                            height={isModal ? "450" : "250"}
                            src={createYouTubeEmbedLink(props.link)} 
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

            {props.type === "twitter" && (
                <div className="p-4">
                    <div key={props.link} className="twitter-tweet-container">
                        <blockquote className="twitter-tweet">
                            <a href={props.link.replace("x.com", "twitter.com")}>Loading tweet...</a>
                        </blockquote>
                    </div>
                </div>
            )}

            {props.type === "document" && (
                <div className="p-4">
                    <div className="rounded-lg overflow-hidden shadow-sm">
                        <iframe
                            src={props.link}
                            className={`w-full ${isModal ? 'h-[70vh]' : 'h-96'} border-none`}
                            title="Google Document"
                        />
                    </div>
                </div>
            )}

            {props.description && (
                <div className="px-4 py-3 border-t border-gray-100">
                    <div
                        className="prose prose-sm max-w-none text-gray-600"
                        dangerouslySetInnerHTML={formatDescription(props.description)}
                    />
                </div>
            )}

            <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2 flex-wrap">
                    {props.tags.map((item: any) => (
                        
                        <div 
                            key={item.name || item} 
                            className="py-1 px-2.5 rounded-full text-indigo-600 bg-indigo-50 text-xs font-medium transition-colors hover:bg-indigo-100"
                        >   
                            #{item.name || item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div 
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer max-w-sm"
            >
                <CardContent />
            </div>

            <CardModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
            >
                <CardContent isModal={true} />
            </CardModal>
        </>
    );
};

export default Card;