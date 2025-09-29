import { Link } from 'react-router-dom';
import { Button } from './ui/button';

export default function HomeBanner() {
  return (
    <div className="w-full mb-8 sm:mb-12">
      <div className="bg-gradient-to-b from-primary/20 to-primary/40 rounded-xl shadow-lg p-6 sm:p-8 text-center border border-primary/20">
        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4 sm:mb-6">
          把夢想寫下，讓希望慢慢發芽
        </h1>
        
        {/* Subtitle */}
        <div className="text-primary/80 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed">
          <p className="mb-2">在希望綠豆湯，夢想都有一個可以歇息的地方</p>
          <p className="mb-2">一張卡片，承載回憶；一堵牆，連結希望!</p>
          <p className="mb-2">故事會停留，心意能延續——在這裡，每一張夢想卡，都是一份被珍藏的心聲——夢想不會孤單，因為總有人願意陪你看見...</p>
        </div>
        
        {/* Call to Action Button */}
        <div className="flex justify-center">
          <Link to="/create-post">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              放上我的夢想卡
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
