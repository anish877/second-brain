import { Brain, File, Hash, Twitter, Youtube, X } from 'lucide-react';

interface SidebarProps {
  setCategory: (category: string) => void;
  category: string;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ setCategory, category, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
  const menuItems = [
    { icon: <Twitter className="w-5 h-5" />, label: 'Tweets', value: 'twitter' },
    { icon: <Youtube className="w-5 h-5" />, label: 'Youtube', value: 'youtube' },
    { icon: <File className="w-5 h-5" />, label: 'Document', value: 'document' },
    { icon: <Hash className="w-5 h-5" />, label: 'Tags', value: 'tags' }
  ];

  const handleCategoryClick = (value: string) => {
    setCategory(value);
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 transform transition-transform duration-200 ease-in-out
        bg-white border-r border-gray-200 flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            onClick={() => handleCategoryClick("all")}
          >
            <Brain className="w-7 h-7 text-indigo-600" />
            <span className="text-lg font-semibold text-gray-900">Second Brain</span>
          </div>
          <button 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleCategoryClick(item.value)}
              className={`
                w-full flex items-center gap-3 px-6 py-3 font-medium
                transition-all duration-200 ease-in-out
                ${category === item.value 
                  ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar