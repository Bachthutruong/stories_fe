export default function LotteryWinnersBanner() {
  return (
    <div className="w-full mb-8 sm:mb-12">
      <div className="bg-gradient-to-b from-primary/20 to-primary/40 rounded-xl shadow-lg p-6 sm:p-8 text-center border border-primary/20">
        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4 sm:mb-6">
          每一張夢想卡，都是希望的種子
        </h1>
        
        {/* Subtitle */}
        <div className="text-primary/80 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed">
          <p className="mb-2">當幸運降臨，它會化作一份甜蜜的驚喜，送到卡友身邊</p>
        </div>
      </div>
    </div>
  );
}
