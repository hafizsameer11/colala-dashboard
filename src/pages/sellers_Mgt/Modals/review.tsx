import images from "../../../constants/images";

interface ReviewProps {
  reviews?: any[];
  statistics?: any;
}

const Reviews: React.FC<ReviewProps> = ({ reviews = [], statistics }) => {
  return (
    <div className="mt-5">
      <div className="flex flex-row items-center justify-center gap-2 mt-10 mb-10">
        <span>
          <img 
            className="w-10 h-10" 
            src={images.start1} 
            alt="Star" 
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDRMMjQuMTggMTQuMDlMMzYgMTYuMzZMMjggMjQuMDlMMjkuNjQgMzZMMjAgMzAuMThMMTAuMzYgMzZMMTIgMjQuMDlMNC4zNiAxNi4zNkwxNS44MiAxNC4wOUwyMCA0WiIgZmlsbD0iI0ZGRDAwMCIvPgo8L3N2Zz4=';
            }}
          />
        </span>
        <span>
          <img 
            className="w-10 h-10" 
            src={images.start1} 
            alt="Star" 
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDRMMjQuMTggMTQuMDlMMzYgMTYuMzZMMjggMjQuMDlMMjkuNjQgMzZMMjAgMzAuMThMMTAuMzYgMzZMMTIgMjQuMDlMNC4zNiAxNi4zNkwxNS44MiAxNC4wOUwyMCA0WiIgZmlsbD0iI0ZGRDAwMCIvPgo8L3N2Zz4=';
            }}
          />
        </span>
        <span>
          <img 
            className="w-10 h-10" 
            src={images.start1} 
            alt="Star" 
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDRMMjQuMTggMTQuMDlMMzYgMTYuMzZMMjggMjQuMDlMMjkuNjQgMzZMMjAgMzAuMThMMTAuMzYgMzZMMTIgMjQuMDlMNC4zNiAxNi4zNkwxNS44MiAxNC4wOUwyMCA0WiIgZmlsbD0iI0ZGRDAwMCIvPgo8L3N2Zz4=';
            }}
          />
        </span>
        <span>
          <img 
            className="w-10 h-10" 
            src={images.start1} 
            alt="Star" 
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDRMMjQuMTggMTQuMDlMMzYgMTYuMzZMMjggMjQuMDlMMjkuNjQgMzZMMjAgMzAuMThMMTAuMzYgMzZMMTIgMjQuMDlMNC4zNiAxNi4zNkwxNS44MiAxNC4wOUwyMCA0WiIgZmlsbD0iI0ZGRDAwMCIvPgo8L3N2Zz4=';
            }}
          />
        </span>
        <span>
          <img 
            className="w-10 h-10" 
            src={images.star2} 
            alt="Star" 
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDRMMjQuMTggMTQuMDlMMzYgMTYuMzZMMjggMjQuMDlMMjkuNjQgMzZMMjAgMzAuMThMMTAuMzYgMzZMMTIgMjQuMDlMNC4zNiAxNi4zNkwxNS44MiAxNC4wOUwyMCA0WiIgZmlsbD0iI0ZGRDAwMCIvPgo8L3N2Zz4=';
            }}
          />
        </span>
      </div>
      <div className="flex flex-row justify-between border-b border-[#00000080] pb-4">
        <span className="text-[#E53E3E] text-lg ">{statistics?.average_rating || 0} Stars</span>
        <span className="text-[#E53E3E] text-lg ">{statistics?.total_reviews || 0} Reviews</span>
      </div>
      <div className="mt-5 border border-[#C3C3C3] rounded-2xl w-full p-3">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2">
            <span>
              <img 
                className="w-10 h-10" 
                src={images.admin} 
                alt="Admin" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTIwIDEwQzE1LjU4IDEwIDEyIDEzLjU4IDEyIDE4UzE1LjU4IDI2IDIwIDI2UzI4IDIyLjQyIDI4IDE4UzI0LjQyIDEwIDIwIDEwWk0yMCAyNEMxNi42OSAyNCAxNCAyMS4zMSAxNCAxOFMxNi42OSAxMiAyMCAxMlMyNiAxNC42OSAyNiAxOFMyMy4zMSAyNCAyMCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
                }}
              />
            </span>
            <div className="flex-flex-col">
              <span className="font-medium text-md text-black">
                Adam Sandler
              </span>
              <div className="flex flex-row">
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-[#00000080] text-sm">07-16-25/05:33AM</span>
          </div>
        </div>
        <div className="mt-3 mb-3">
          <span className="text-sm">
            Really great product, i enjoyed using it for a long time
          </span>
        </div>
        <div>
          <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
            Delete Review
          </button>
        </div>
      </div>

      <div className="mt-5 border border-[#C3C3C3] rounded-2xl w-full p-3">
        <div className="flex flex-row justify-between mb-3">
          <div className="flex flex-row gap-2">
            <span>
              <img 
                className="w-10 h-10" 
                src={images.admin} 
                alt="Admin" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTIwIDEwQzE1LjU4IDEwIDEyIDEzLjU4IDEyIDE4UzE1LjU4IDI2IDIwIDI2UzI4IDIyLjQyIDI4IDE4UzI0LjQyIDEwIDIwIDEwWk0yMCAyNEMxNi42OSAyNCAxNCAyMS4zMSAxNCAxOFMxNi42OSAxMiAyMCAxMlMyNiAxNC42OSAyNiAxOFMyMy4zMSAyNCAyMCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
                }}
              />
            </span>
            <div className="flex-flex-col">
              <span className="font-medium text-md text-black">Chris Pine</span>
              <div className="flex flex-row">
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-[#00000080] text-sm">07-16-25/05:33AM</span>
          </div>
        </div>
        <div className="flex flex-row mt-3 gap-2">
          <span>
            <img className="w-15 h-15 rounded-lg" src={images.ivideo} alt="" />
          </span>
          <span>
            <img className="w-15 h-15 rounded-lg" src={images.i10} alt="" />
          </span>
          <span>
            <img className="w-15 h-15 rounded-lg" src={images.i1} alt="" />
          </span>
        </div>
        <div className="mt-3 mb-3">
          <span className="text-sm">
            Really great product, i enjoyed using it for a long time
          </span>
        </div>
        <div>
          <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
            Delete Review
          </button>
        </div>
      </div>

      <div className="mt-5 border border-[#C3C3C3] rounded-2xl w-full p-3">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2">
            <span>
              <img 
                className="w-10 h-10" 
                src={images.admin} 
                alt="Admin" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTIwIDEwQzE1LjU4IDEwIDEyIDEzLjU4IDEyIDE4UzE1LjU4IDI2IDIwIDI2UzI4IDIyLjQyIDI4IDE4UzI0LjQyIDEwIDIwIDEwWk0yMCAyNEMxNi42OSAyNCAxNCAyMS4zMSAxNCAxOFMxNi42OSAxMiAyMCAxMlMyNiAxNC42OSAyNiAxOFMyMy4zMSAyNCAyMCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
                }}
              />
            </span>
            <div className="flex-flex-col">
              <span className="font-medium text-md text-black">
                Adam Sandler
              </span>
              <div className="flex flex-row">
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-[#00000080] text-sm">07-16-25/05:33AM</span>
          </div>
        </div>
        <div className="mt-3 mb-3">
          <span className="text-sm">
            Really great product, i enjoyed using it for a long time
          </span>
        </div>
        <div>
          <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
            Delete Review
          </button>
        </div>
      </div>

      <div className="mt-5 border border-[#C3C3C3] rounded-2xl w-full p-3">
        <div className="flex flex-row justify-between mb-3">
          <div className="flex flex-row gap-2">
            <span>
              <img 
                className="w-10 h-10" 
                src={images.admin} 
                alt="Admin" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTIwIDEwQzE1LjU4IDEwIDEyIDEzLjU4IDEyIDE4UzE1LjU4IDI2IDIwIDI2UzI4IDIyLjQyIDI4IDE4UzI0LjQyIDEwIDIwIDEwWk0yMCAyNEMxNi42OSAyNCAxNCAyMS4zMSAxNCAxOFMxNi42OSAxMiAyMCAxMlMyNiAxNC42OSAyNiAxOFMyMy4zMSAyNCAyMCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==';
                }}
              />
            </span>
            <div className="flex-flex-col">
              <span className="font-medium text-md text-black">Chris Pine</span>
              <div className="flex flex-row">
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
                <span>
                  <img src={images.start1} alt="" />
                </span>
              </div>
            </div>
          </div>
          <div>
            <span className="text-[#00000080] text-sm">07-16-25/05:33AM</span>
          </div>
        </div>
        <div className="flex flex-row mt-3 gap-2">
          <span>
            <img className="w-15 h-15 rounded-lg" src={images.ivideo} alt="" />
          </span>
          <span>
            <img className="w-15 h-15 rounded-lg" src={images.i10} alt="" />
          </span>
          <span>
            <img className="w-15 h-15 rounded-lg" src={images.i1} alt="" />
          </span>
        </div>
        <div className="mt-3 mb-3">
          <span className="text-sm">
            Really great product, i enjoyed using it for a long time
          </span>
        </div>
        <div>
          <button className="bg-[#E53E3E] text-white rounded-full cursor-pointer px-6 py-1">
            Delete Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
