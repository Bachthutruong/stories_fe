export default function CreatePostBanner() {
  return (
    <div className="w-full mb-8 sm:mb-12">
      <div className="bg-gradient-to-b from-primary/20 to-primary/40 rounded-xl shadow-lg p-6 sm:p-8 text-center border border-primary/20">
        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4 sm:mb-6">
          寫下你的夢想卡
        </h1>
        
        {/* Subtitle */}
        <div className="text-primary/80 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed">
          <p className="mb-2">在希望夢想牆，每一張卡都是一段獨特的故事。</p>
          <p className="mb-2">把夢想、回憶或心願寫下來，讓我們一起 收藏、陪伴、傳遞，</p>
          <p className="mb-2">也許，它就是本月閃閃發光的「幸運卡 ✨」。</p>
        </div>
      </div>
    </div>
  );
}
