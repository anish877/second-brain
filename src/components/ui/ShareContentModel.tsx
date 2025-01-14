import { Copy, X } from "lucide-react"

interface ShareContentModelProps {
    isOpen: boolean;
    link: string
    onClose: () => void;
  }

const ShareContentModel = ({ isOpen, onClose,link }: ShareContentModelProps) => {
  console.log(link)
    if(!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-semibold text-gray-800">Share Content</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
            <p>Share the entire collection of your brain to you friends and mfs.</p>
        </div>
        <div className="flex justify-end gap-3 p-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex gap-2 items-center"
              onClick={()=>{
                navigator.clipboard.writeText
                (`https://second-brain-rosy.vercel.app/${link}`);
              }}
            >
                <Copy className="h-5"/>
                <p>Share Brain</p>
            </button>
        </div>
        </div>
    </div>
  )
}

export default ShareContentModel
