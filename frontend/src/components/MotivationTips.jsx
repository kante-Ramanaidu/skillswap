// ✅ components/MotivationTips.jsx
import { useState } from 'react';
import './MotivationTips.css';

const quotes = [
  "Push yourself, because no one else is going to do it for you.",
  "Success doesn’t just find you. You have to go out and get it.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Don’t stop when you’re tired. Stop when you’re done.",
  "Little things make big days.",
  "It’s going to be hard, but hard does not mean impossible.",
  "Don’t wait for opportunity. Create it.",
  "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "Work hard in silence, let success make the noise.",
  "Stay focused and never give up.",
  "Your limitation—it's only your imagination.",
  "The harder you work for something, the greater you’ll feel when you achieve it.",
  "Believe in yourself and all that you are.",
  "You are stronger than you think.",
  "Do something today that your future self will thank you for.",
  "Push through the pain. You got this.",
  "Focus on your goal. Don’t look in any direction but ahead.",
  "If you believe it, you can achieve it.",
  "Consistency is more important than perfection.",
  "Every accomplishment starts with the decision to try.",
  "Discipline is the bridge between goals and accomplishment.",
  "Start where you are. Use what you have. Do what you can.",
  "Doubt kills more dreams than failure ever will.",
  "Hard work beats talent when talent doesn’t work hard.",
  "You don’t have to be great to start, but you have to start to be great.",
  "Winners are not people who never fail, but people who never quit.",
  "The best way to predict the future is to create it.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Learning never exhausts the mind.",
  "Only those who dare to fail greatly can ever achieve greatly.",
  "Study now and be proud later.",
  "Mistakes are proof that you are trying.",
  "Motivation gets you going, but discipline keeps you growing.",
  "Make each day your masterpiece.",
  "Be so good they can't ignore you.",
  "The secret of getting ahead is getting started.",
  "The pain you feel today is the strength you feel tomorrow.",
  "It's not whether you get knocked down, it's whether you get up.",
  "Success usually comes to those who are too busy to be looking for it.",
  "Don't wish it were easier, wish you were better.",
  "Do what you can with all you have, wherever you are.",
  "What seems hard now will one day be your warm-up.",
  "Set your goals high, and don’t stop till you get there.",
  "One hour of focused study is worth 10 hours of distracted effort.",
  "Every expert was once a beginner.",
  "Studying is not about being the best; it’s about being better than you were yesterday.",
  "Your future depends on what you do today.",
  "If you’re going through hell, keep going."
];

function getRandomThreeQuotes() {
  const shuffled = quotes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

function MotivationTips() {
  const [quoteSet, setQuoteSet] = useState(getRandomThreeQuotes());

  const handleRefresh = () => {
    setQuoteSet(getRandomThreeQuotes());
  };

  return (
    <div className="motivation-box">
      <h3 className="motivation-heading">💡 Study Tips</h3>
      <ul className="motivation-quote-list">
        {quoteSet.map((q, i) => (
          <li key={i} className="motivation-quote">"{q}"</li>
        ))}
      </ul>
      <button className="next-quote-btn" onClick={handleRefresh}>🔁 </button>
    </div>
  );
}

export default MotivationTips;
