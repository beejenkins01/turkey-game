import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

export default function TurkeyHuntGame() {
  const [turkeyLocation, setTurkeyLocation] = useState([]);
  const [foundTurkeys, setFoundTurkeys] = useState(new Set());
  const [gameState, setGameState] = useState('playing'); // playing, found, wrong
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [clickedBushes, setClickedBushes] = useState(new Set());
  const [flyingTurkey, setFlyingTurkey] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [rabbitPosition, setRabbitPosition] = useState({ x: 110, y: 78, show: true });
  const [quailPositions, setQuailPositions] = useState([
    // Left covey
    { x: 15, y: 70, direction: 1 },
    { x: 18, y: 71, direction: 1 },
    { x: 21, y: 70, direction: 1 },
    { x: 24, y: 71, direction: 1 },
    { x: 27, y: 70, direction: 1 },
    // Right covey
    { x: 75, y: 78, direction: -1 },
    { x: 78, y: 79, direction: -1 },
    { x: 81, y: 78, direction: -1 },
    { x: 84, y: 79, direction: -1 },
    { x: 87, y: 78, direction: -1 },
  ]);
  const [flyingQuail, setFlyingQuail] = useState(null);
  const [hasHoveredBush, setHasHoveredBush] = useState(false);
  const [hoverCount, setHoverCount] = useState(0);
  const [firstTurkeyFound, setFirstTurkeyFound] = useState(false);

  // Function to play "gobble gobble" sound
  const playGobbleSound = () => {
    if (!soundOn) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a gobble-like sound with frequency modulation
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  };

  const jokes = [
    "Why did the turkey cross the road? To prove he wasn't chicken!",
    "What do you call a running turkey? Fast food!",
    "Why did the turkey join a band? He had the drumsticks!",
    "What's a turkey's favorite dessert? Peach gobbler!",
    "Why don't turkeys get invited to dinner parties? They use fowl language!",
    "What did the turkey say to the computer? Google, google, google!",
    "Why was the turkey put in jail? For fowl play!",
    "What do you get when you cross a turkey with a banjo? A turkey that plucks itself!",
    "Why did the turkey sit on the tomahawk? To hatchet!",
    "What's the best dance to do on Thanksgiving? The turkey trot!",
    "Why did the turkey refuse dessert? He was already stuffed!",
    "What did the turkey say before being roasted? Boy, I'm stuffed!",
    "Why did the cranberries turn red? They saw the turkey dressing!",
    "What sound does a limping turkey make? Wobble wobble!",
    "Why did the turkey go to the séance? To talk to the other side!",
  ];

  const [usedJokes, setUsedJokes] = useState([]);

  useEffect(() => {
    resetGame();
    
    // Rabbit hopping animation with bounce (right to left)
    const rabbitInterval = setInterval(() => {
      setRabbitPosition(prev => {
        if (prev.x < -10) {
          return { x: 110, y: 78, show: true };
        }
        // Create a hopping effect with sine wave
        const hopHeight = Math.abs(Math.sin(prev.x * 0.5)) * 3;
        return { x: prev.x - 0.8, y: 78 - hopHeight, show: true };
      });
    }, 50);
    
    // Quail waddle animation
    const quailInterval = setInterval(() => {
      setQuailPositions(prev => prev.map((quail, idx) => {
        let newX = quail.x + (quail.direction * 0.1);
        let newDirection = quail.direction;
        
        // Different ranges for left and right coveys
        let minX, maxX;
        if (idx < 5) {
          // Left covey (indices 0-4)
          minX = 10;
          maxX = 35;
        } else {
          // Right covey (indices 5-9)
          minX = 65;
          maxX = 92;
        }
        
        // Turn around at edges
        if (newX > maxX || newX < minX) {
          newDirection = -quail.direction;
          newX = quail.x;
        }
        
        return { ...quail, x: newX, direction: newDirection };
      }));
    }, 100);
    
    return () => {
      clearInterval(rabbitInterval);
      clearInterval(quailInterval);
    };
  }, []);

  const resetGame = () => {
    // Pick 3 random locations for turkeys
    const numTurkeys = 3;
    const locations = new Set();
    while (locations.size < numTurkeys) {
      locations.add(Math.floor(Math.random() * 25)); // 25 bushes now
    }
    setTurkeyLocation(Array.from(locations));
    setFoundTurkeys(new Set());
    setGameState('playing');
    setMessage("Use your dog cursor to find all the turkeys hiding in the sagebrush! Once you sniff out a turkey, the remaining turkeys will find new hiding spots. Find them all!");
    setClickedBushes(new Set());
    setFlyingTurkey(null);
    setHasHoveredBush(false);
    setFlyingQuail(null);
    setHoverCount(0);
    setFirstTurkeyFound(false);
  };

  const getRandomJoke = () => {
    let availableJokes = jokes.filter((_, index) => !usedJokes.includes(index));
    
    if (availableJokes.length === 0) {
      setUsedJokes([]);
      availableJokes = jokes;
    }
    
    const randomIndex = Math.floor(Math.random() * availableJokes.length);
    const selectedJoke = availableJokes[randomIndex];
    const jokeIndex = jokes.indexOf(selectedJoke);
    setUsedJokes([...usedJokes, jokeIndex]);
    
    return selectedJoke;
  };

  const handleBushClick = (bushIndex, bushX, bushY) => {
    if (gameState !== 'playing' || clickedBushes.has(bushIndex) || foundTurkeys.has(bushIndex)) return;

    setClickedBushes(new Set([...clickedBushes, bushIndex]));
    setAttempts(attempts + 1);

    setTimeout(() => {
      if (turkeyLocation.includes(bushIndex)) {
        // Found a turkey!
        playGobbleSound(); // Play gobble sound
        
        const newFoundTurkeys = new Set([...foundTurkeys, bushIndex]);
        setFoundTurkeys(newFoundTurkeys);
        
        setGameState('found');
        setFlyingTurkey({ x: bushX, y: bushY - 10, correct: true });
        
        // After finding first turkey, move the remaining turkeys to new locations
        if (!firstTurkeyFound && newFoundTurkeys.size === 1) {
          setFirstTurkeyFound(true);
          
          // Move remaining turkeys to new random locations
          setTimeout(() => {
            const remainingTurkeys = turkeyLocation.filter(loc => !newFoundTurkeys.has(loc));
            const newLocations = [...newFoundTurkeys];
            
            remainingTurkeys.forEach(() => {
              let newLoc;
              do {
                newLoc = Math.floor(Math.random() * 25);
              } while (newLocations.includes(newLoc));
              newLocations.push(newLoc);
            });
            
            setTurkeyLocation(newLocations);
          }, 500);
        }
        
        // Check if all turkeys found
        if (newFoundTurkeys.size === turkeyLocation.length) {
          // Found the last turkey!
          setMessage("🦃 Come hungry to the Jenkins' Thanksgiving Dinner at 4:30! 🦃");
          setScore(score + 1);
          setGameState('won');
        } else if (newFoundTurkeys.size === 1) {
          // Found the first turkey
          setMessage("Gobble gobble! Don't eat me!");
          setTimeout(() => {
            setGameState('playing');
            setFlyingTurkey(null);
          }, 2000);
        } else if (newFoundTurkeys.size === 2 && turkeyLocation.length === 3) {
          // Found the second turkey when there are 3 total
          setMessage("Winner winner! Turkey dinner!");
          setTimeout(() => {
            setGameState('playing');
            setFlyingTurkey(null);
          }, 2000);
        } else {
          // Fallback message (shouldn't normally happen with 2-3 turkey setup)
          setMessage(`Found ${newFoundTurkeys.size} of ${turkeyLocation.length} turkeys!`);
          setTimeout(() => {
            setGameState('playing');
            setFlyingTurkey(null);
          }, 2000);
        }
      } else {
        setGameState('wrong');
        const joke = getRandomJoke();
        setMessage(joke);
        
        // Show one of the unfound turkeys flying up
        const unfoundTurkeys = turkeyLocation.filter(loc => !foundTurkeys.has(loc));
        const randomUnfound = unfoundTurkeys[Math.floor(Math.random() * unfoundTurkeys.length)];
        setFlyingTurkey({ x: bushPositions[randomUnfound].x, y: bushPositions[randomUnfound].y - 10, correct: false });
        
        setTimeout(() => {
          setGameState('playing');
          setMessage("Keep searching! The turkeys are hiding in the sagebrush!");
          setFlyingTurkey(null);
        }, 4000);
      }
    }, 800);
  };

  const bushPositions = [
    { x: 8, y: 76 },
    { x: 15, y: 73 },
    { x: 22, y: 75 },
    { x: 29, y: 72 },
    { x: 36, y: 74 },
    { x: 43, y: 71 },
    { x: 50, y: 73 },
    { x: 57, y: 70 },
    { x: 64, y: 72 },
    { x: 71, y: 74 },
    { x: 78, y: 71 },
    { x: 85, y: 73 },
    { x: 92, y: 75 },
    { x: 12, y: 82 },
    { x: 25, y: 80 },
    { x: 38, y: 81 },
    { x: 51, y: 79 },
    { x: 64, y: 81 },
    { x: 77, y: 80 },
    { x: 88, y: 82 },
    { x: 18, y: 87 },
    { x: 35, y: 86 },
    { x: 52, y: 88 },
    { x: 69, y: 86 },
    { x: 84, y: 87 },
  ];

  const grassPositions = [
    { x: 10, y: 74 },
    { x: 19, y: 77 },
    { x: 27, y: 73 },
    { x: 40, y: 76 },
    { x: 48, y: 72 },
    { x: 55, y: 75 },
    { x: 66, y: 73 },
    { x: 75, y: 76 },
    { x: 83, y: 74 },
    { x: 20, y: 84 },
    { x: 44, y: 83 },
    { x: 72, y: 85 },
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-400 via-sky-300 via-60% to-amber-200 overflow-hidden relative dog-cursor">
      {/* Clouds */}
      <div className="absolute top-10 left-10 opacity-70">
        <svg width="120" height="60" viewBox="0 0 120 60">
          <ellipse cx="30" cy="35" rx="25" ry="18" fill="white" opacity="0.9"/>
          <ellipse cx="55" cy="30" rx="30" ry="20" fill="white" opacity="0.9"/>
          <ellipse cx="80" cy="35" rx="28" ry="18" fill="white" opacity="0.9"/>
        </svg>
      </div>
      <div className="absolute top-20 right-20 opacity-60">
        <svg width="100" height="50" viewBox="0 0 100 50">
          <ellipse cx="25" cy="30" rx="20" ry="15" fill="white" opacity="0.9"/>
          <ellipse cx="50" cy="25" rx="25" ry="18" fill="white" opacity="0.9"/>
          <ellipse cx="70" cy="30" rx="22" ry="15" fill="white" opacity="0.9"/>
        </svg>
      </div>
      <div className="absolute top-40 left-1/3 opacity-50">
        <svg width="90" height="45" viewBox="0 0 90 45">
          <ellipse cx="20" cy="25" rx="18" ry="13" fill="white" opacity="0.9"/>
          <ellipse cx="45" cy="22" rx="22" ry="15" fill="white" opacity="0.9"/>
          <ellipse cx="65" cy="25" rx="20" ry="13" fill="white" opacity="0.9"/>
        </svg>
      </div>
      {/* Mountains Background */}
      <div className="absolute bottom-0 left-0 right-0 h-3/5">
        <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="100%" stopColor="#B0D4E8" />
            </linearGradient>
            <linearGradient id="mtGrad0" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A8B8C8" />
              <stop offset="50%" stopColor="#B8C8D8" />
              <stop offset="100%" stopColor="#C8D8E8" />
            </linearGradient>
            <linearGradient id="mtGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6B7C8C" />
              <stop offset="50%" stopColor="#8B9DAC" />
              <stop offset="100%" stopColor="#A5B5C5" />
            </linearGradient>
            <linearGradient id="mtGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7B8C6C" />
              <stop offset="50%" stopColor="#9BAC8C" />
              <stop offset="100%" stopColor="#B5C5A5" />
            </linearGradient>
            <linearGradient id="mtGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B9C7C" />
              <stop offset="50%" stopColor="#ABB59C" />
              <stop offset="100%" stopColor="#C5D5B5" />
            </linearGradient>
          </defs>
          
          {/* Very distant mountains - furthest back, most faded */}
          <polygon points="0,600 0,380 100,340 220,360 340,330 460,355 580,325 700,350 820,335 940,345 1000,340 1000,600" 
                   fill="url(#mtGrad0)" opacity="0.35"/>
          
          {/* Distant mountains - lightest */}
          <polygon points="0,600 0,320 120,260 240,280 360,240 480,270 600,235 720,260 840,245 960,265 1000,255 1000,600" 
                   fill="url(#mtGrad1)" opacity="0.5"/>
          
          {/* Middle mountains */}
          <polygon points="0,600 80,370 200,330 320,350 440,315 560,340 680,310 800,335 920,315 1000,330 1000,600" 
                   fill="url(#mtGrad2)" opacity="0.65"/>
          
          {/* Closer mountains - more detail */}
          <polygon points="0,600 40,400 160,360 280,385 400,350 520,375 640,345 760,370 880,350 1000,370 1000,600" 
                   fill="url(#mtGrad3)" opacity="0.8"/>
          
          {/* Mountain shadows for depth */}
          <polygon points="160,360 200,385 240,375 280,385 280,600 160,600" 
                   fill="#000" opacity="0.1"/>
          <polygon points="400,350 440,370 480,360 520,375 520,600 400,600" 
                   fill="#000" opacity="0.1"/>
          <polygon points="640,345 680,365 720,355 760,370 760,600 640,600" 
                   fill="#000" opacity="0.1"/>
        </svg>
      </div>

      {/* Score and Controls */}
      <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-4 shadow-lg">
        <div className="text-2xl font-bold text-brown-800">🏆 Score: {score}</div>
        <div className="text-sm text-gray-600">Attempts: {attempts}</div>
        <div className="text-sm text-blue-600 font-semibold">
          Turkeys: {foundTurkeys.size}/{turkeyLocation.length}
        </div>
        <button 
          onClick={resetGame}
          className="mt-2 flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <RotateCcw size={16} />
          New Game
        </button>
      </div>

      {/* Sound Toggle */}
      <button 
        onClick={() => setSoundOn(!soundOn)}
        className="absolute top-4 right-4 bg-white/90 rounded-lg p-3 shadow-lg hover:bg-white transition-colors"
      >
        {soundOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      {/* Message Box */}
      <div className={`absolute top-24 left-1/2 transform -translate-x-1/2 rounded-lg p-4 shadow-xl max-w-md text-center ${
        gameState === 'won' ? 'bg-orange-500 text-white text-2xl font-bold' : 'bg-white/95 text-gray-800 text-lg font-semibold'
      }`}>
        <p>{message}</p>
      </div>

        {/* Rabbit hopping across field */}
        {rabbitPosition.show && (
          <div
            className="absolute transition-all duration-100"
            style={{
              left: `${rabbitPosition.x}%`,
              top: `${rabbitPosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <svg width="60" height="50" viewBox="0 0 60 50">
              <g>
                {/* Shadow */}
                <ellipse cx="30" cy="45" rx="20" ry="4" fill="#000" opacity="0.2"/>
                
                {/* Back leg */}
                <ellipse cx="38" cy="38" rx="8" ry="12" fill="#8B7355" stroke="#000" strokeWidth="2"/>
                
                {/* Body */}
                <ellipse cx="30" cy="30" rx="16" ry="14" fill="#C9B299" stroke="#000" strokeWidth="2"/>
                
                {/* Front leg */}
                <ellipse cx="22" cy="38" rx="5" ry="10" fill="#8B7355" stroke="#000" strokeWidth="2"/>
                
                {/* Head */}
                <ellipse cx="22" cy="22" rx="10" ry="11" fill="#C9B299" stroke="#000" strokeWidth="2"/>
                
                {/* Ears */}
                <ellipse cx="18" cy="10" rx="4" ry="12" fill="#C9B299" stroke="#000" strokeWidth="2"/>
                <ellipse cx="26" cy="10" rx="4" ry="12" fill="#C9B299" stroke="#000" strokeWidth="2"/>
                <ellipse cx="18" cy="12" rx="2" ry="8" fill="#E9D9C9"/>
                <ellipse cx="26" cy="12" rx="2" ry="8" fill="#E9D9C9"/>
                
                {/* Eye */}
                <circle cx="24" cy="20" r="2" fill="#000"/>
                
                {/* Nose */}
                <circle cx="18" cy="24" r="1.5" fill="#FF69B4"/>
                
                {/* Tail */}
                <circle cx="42" cy="28" r="6" fill="#F5F5F5" stroke="#000" strokeWidth="1.5"/>
              </g>
            </svg>
          </div>
        )}

        {/* Flying Quail - distraction on first hover */}
        {flyingQuail && (
          <div
            className="absolute transition-all duration-2000"
            style={{
              left: `${flyingQuail.x}%`,
              top: `${flyingQuail.y}%`,
              animation: 'flyAway 2s ease-out',
            }}
          >
            <svg width="50" height="45" viewBox="0 0 50 45">
              <g>
                {/* Flying quail with wings spread */}
                {/* Body */}
                <ellipse cx="25" cy="25" rx="12" ry="11" fill="#654321" stroke="#000" strokeWidth="2"/>
                
                {/* Left wing - spread up */}
                <ellipse cx="15" cy="20" rx="10" ry="6" fill="#8B6F47" stroke="#000" strokeWidth="2" transform="rotate(-30 15 20)"/>
                <path d="M 10,18 Q 8,16 10,14 Q 12,16 14,14 Q 16,16 18,14" stroke="#654321" strokeWidth="1.5" fill="none"/>
                
                {/* Right wing - spread up */}
                <ellipse cx="35" cy="20" rx="10" ry="6" fill="#8B6F47" stroke="#000" strokeWidth="2" transform="rotate(30 35 20)"/>
                <path d="M 40,18 Q 42,16 40,14 Q 38,16 36,14 Q 34,16 32,14" stroke="#654321" strokeWidth="1.5" fill="none"/>
                
                {/* Head/neck */}
                <ellipse cx="20" cy="18" rx="6" ry="7" fill="#8B6F47" stroke="#000" strokeWidth="2"/>
                
                {/* Plume on head */}
                <path d="M 18,12 Q 16,8 18,5" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <circle cx="18" cy="5" r="2" fill="#000"/>
                
                {/* Eye */}
                <circle cx="19" cy="17" r="2" fill="#000"/>
                <circle cx="19.5" cy="16.5" r="0.8" fill="#FFF"/>
                
                {/* Beak */}
                <path d="M 15,18 L 11,18" stroke="#8B6914" strokeWidth="2.5"/>
                
                {/* Tail */}
                <path d="M 32,28 Q 38,30 40,28 Q 38,26 40,24" stroke="#654321" strokeWidth="2" fill="none"/>
              </g>
            </svg>
          </div>
        )}

        {/* Covey of Quail */}
        {quailPositions.map((quail, idx) => (
          <div
            key={idx}
            className="absolute transition-all duration-100"
            style={{
              left: `${quail.x}%`,
              top: `${quail.y}%`,
              transform: `translate(-50%, -50%) scaleX(${quail.direction})`,
            }}
          >
            <svg width="35" height="30" viewBox="0 0 35 30">
              <g>
                {/* Shadow */}
                <ellipse cx="17" cy="27" rx="12" ry="3" fill="#000" opacity="0.2"/>
                
                {/* Body */}
                <ellipse cx="17" cy="18" rx="10" ry="9" fill="#654321" stroke="#000" strokeWidth="1.5"/>
                
                {/* Wing pattern */}
                <path d="M 12,16 Q 10,18 12,20" stroke="#8B6F47" strokeWidth="2" fill="none"/>
                <path d="M 14,15 Q 12,17 14,19" stroke="#8B6F47" strokeWidth="2" fill="none"/>
                
                {/* Head/neck */}
                <ellipse cx="12" cy="13" rx="5" ry="6" fill="#8B6F47" stroke="#000" strokeWidth="1.5"/>
                
                {/* Plume on head */}
                <path d="M 10,8 Q 8,6 10,4" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <circle cx="10" cy="4" r="1.5" fill="#000"/>
                
                {/* Eye */}
                <circle cx="11" cy="12" r="1.5" fill="#000"/>
                <circle cx="11.5" cy="11.5" r="0.5" fill="#FFF"/>
                
                {/* Beak */}
                <path d="M 8,13 L 5,13" stroke="#8B6914" strokeWidth="2"/>
                
                {/* Legs */}
                <line x1="15" y1="25" x2="15" y2="28" stroke="#8B6914" strokeWidth="2"/>
                <line x1="19" y1="25" x2="19" y2="28" stroke="#8B6914" strokeWidth="2"/>
              </g>
            </svg>
          </div>
        ))}

        {/* Sagebrush Field */}
      <div className="absolute inset-0">
        {bushPositions.map((pos, index) => (
          <div
            key={index}
            className={`absolute transition-all duration-300 ${
              clickedBushes.has(index) ? 'opacity-50' : foundTurkeys.has(index) ? 'opacity-60' : ''
            }`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: turkeyLocation.includes(index) && !foundTurkeys.has(index) ? 20 : 10,
            }}
          >
            {/* Clickable wrapper around the bush */}
            <div 
              className="cursor-pointer hover:scale-105 transition-all"
              onClick={() => handleBushClick(index, pos.x, pos.y)}
              onMouseEnter={() => {
                const newCount = hoverCount + 1;
                setHoverCount(newCount);
                
                // Trigger quail every 4th hover
                if (newCount % 4 === 0) {
                  setFlyingQuail({ x: pos.x, y: pos.y });
                  setTimeout(() => setFlyingQuail(null), 2000);
                }
              }}
            >
            {/* Realistic Sagebrush */}
            <div className="relative">
              {/* Turkey feathers peeking out - only show if this is a hiding spot and not yet found */}
              {turkeyLocation.includes(index) && !foundTurkeys.has(index) && gameState === 'playing' && !clickedBushes.has(index) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                  <svg width="40" height="35" viewBox="0 0 30 25">
                    {/* Just a few tail feathers peeking out */}
                    <ellipse cx="10" cy="15" rx="3" ry="10" fill="#8B4513" transform="rotate(-15 10 15)" opacity="0.8"/>
                    <ellipse cx="15" cy="12" rx="3" ry="12" fill="#A0522D" transform="rotate(0 15 12)" opacity="0.8"/>
                    <ellipse cx="20" cy="15" rx="3" ry="10" fill="#CD853F" transform="rotate(15 20 15)" opacity="0.8"/>
                    {/* Feather tips with blue spots */}
                    <circle cx="10" cy="7" r="2" fill="#4169E1" opacity="0.6"/>
                    <circle cx="15" cy="3" r="2" fill="#4169E1" opacity="0.6"/>
                    <circle cx="20" cy="7" r="2" fill="#4169E1" opacity="0.6"/>
                  </svg>
                </div>
              )}
              
              {/* Checkmark for found turkeys */}
              {foundTurkeys.has(index) && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10 text-3xl pointer-events-none">
                  ✓
                </div>
              )}
              
              <svg width="110" height="90" viewBox="0 0 100 80">
                <defs>
                  <radialGradient id={`sageGrad${index}`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#B8C9A8" />
                    <stop offset="40%" stopColor="#8FA888" />
                    <stop offset="100%" stopColor="#6B8B6E" />
                  </radialGradient>
                  <radialGradient id={`darkSage${index}`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#7A9979" />
                    <stop offset="100%" stopColor="#5B7C5A" />
                  </radialGradient>
                  <radialGradient id={`lightSage${index}`} cx="30%" cy="30%">
                    <stop offset="0%" stopColor="#D4E3CB" />
                    <stop offset="50%" stopColor="#A8BDA0" />
                    <stop offset="100%" stopColor="#8FA888" />
                  </radialGradient>
                  <radialGradient id={`silverySage${index}`} cx="40%" cy="40%">
                    <stop offset="0%" stopColor="#E8F0E3" />
                    <stop offset="60%" stopColor="#C8D8BE" />
                    <stop offset="100%" stopColor="#A8BDA0" />
                  </radialGradient>
                  <filter id={`shadow${index}`}>
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                    <feOffset dx="2" dy="3" result="offsetblur"/>
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3"/>
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Ground shadow */}
                <ellipse cx="50" cy="73" rx="38" ry="6" fill="#4A5C35" opacity="0.3"/>
                
                <g filter={`url(#shadow${index})`}>
                  {/* Woody branch structure */}
                  <g>
                    {/* Main trunks */}
                    <path d="M 42,72 Q 40,60 38,48 Q 36,36 34,24" 
                          stroke="#5D4E37" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    <path d="M 50,72 Q 50,60 50,48 Q 50,36 49,24" 
                          stroke="#6B5A42" strokeWidth="5" fill="none" strokeLinecap="round"/>
                    <path d="M 58,72 Q 60,60 62,48 Q 64,36 66,24" 
                          stroke="#5D4E37" strokeWidth="4" fill="none" strokeLinecap="round"/>
                    
                    {/* Secondary branches */}
                    <path d="M 38,48 Q 32,44 28,38" stroke="#6B5A42" strokeWidth="2.5" fill="none"/>
                    <path d="M 50,48 Q 45,42 42,34" stroke="#5D4E37" strokeWidth="2.5" fill="none"/>
                    <path d="M 62,48 Q 68,44 72,38" stroke="#6B5A42" strokeWidth="2.5" fill="none"/>
                    <path d="M 50,48 Q 55,42 58,34" stroke="#5D4E37" strokeWidth="2.5" fill="none"/>
                    
                    {/* Smaller twigs */}
                    <path d="M 28,38 Q 24,34 22,28" stroke="#8B7355" strokeWidth="1.5" fill="none"/>
                    <path d="M 42,34 Q 38,28 36,22" stroke="#8B7355" strokeWidth="1.5" fill="none"/>
                    <path d="M 58,34 Q 62,28 64,22" stroke="#8B7355" strokeWidth="1.5" fill="none"/>
                    <path d="M 72,38 Q 76,34 78,28" stroke="#8B7355" strokeWidth="1.5" fill="none"/>
                  </g>
                  
                  {/* Foliage layers */}
                  {/* Dark base */}
                  <ellipse cx="50" cy="42" rx="34" ry="22" fill="url(#darkSage${index})" opacity="0.75"/>
                  
                  {/* Mid-dark clusters */}
                  <ellipse cx="33" cy="40" rx="17" ry="14" fill="url(#darkSage${index})" opacity="0.78"/>
                  <ellipse cx="50" cy="38" rx="21" ry="17" fill="url(#darkSage${index})" opacity="0.82"/>
                  <ellipse cx="67" cy="40" rx="17" ry="14" fill="url(#darkSage${index})" opacity="0.78"/>
                  
                  {/* Medium sage */}
                  <ellipse cx="36" cy="36" rx="16" ry="13" fill="url(#sageGrad${index})" opacity="0.88"/>
                  <ellipse cx="50" cy="33" rx="22" ry="17" fill="url(#sageGrad${index})" opacity="0.92"/>
                  <ellipse cx="64" cy="36" rx="16" ry="13" fill="url(#sageGrad${index})" opacity="0.88"/>
                  
                  {/* Light sage */}
                  <ellipse cx="40" cy="30" rx="14" ry="12" fill="url(#lightSage${index})" opacity="0.9"/>
                  <ellipse cx="50" cy="26" rx="18" ry="14" fill="url(#lightSage${index})" opacity="0.95"/>
                  <ellipse cx="60" cy="30" rx="14" ry="12" fill="url(#lightSage${index})" opacity="0.9"/>
                  
                  {/* Silvery highlights */}
                  <ellipse cx="28" cy="35" rx="11" ry="9" fill="url(#silverySage${index})" opacity="0.75"/>
                  <ellipse cx="42" cy="25" rx="12" ry="10" fill="url(#silverySage${index})" opacity="0.82"/>
                  <ellipse cx="50" cy="21" rx="14" ry="11" fill="url(#silverySage${index})" opacity="0.88"/>
                  <ellipse cx="58" cy="25" rx="12" ry="10" fill="url(#silverySage${index})" opacity="0.82"/>
                  <ellipse cx="72" cy="35" rx="11" ry="9" fill="url(#silverySage${index})" opacity="0.75"/>
                  
                  {/* Very light accents */}
                  <ellipse cx="50" cy="18" rx="10" ry="8" fill="#E8F0E3" opacity="0.8"/>
                  
                  {/* Flower stalks */}
                  <g opacity="0.9">
                    <line x1="36" y1="26" x2="34" y2="12" stroke="#B8A888" strokeWidth="1.4"/>
                    <ellipse cx="34" cy="10" rx="2" ry="4" fill="#C9B896"/>
                    
                    <line x1="42" y1="23" x2="41" y2="8" stroke="#B8A888" strokeWidth="1.4"/>
                    <ellipse cx="41" cy="6" rx="2" ry="4" fill="#D4C5A8"/>
                    
                    <line x1="47" y1="21" x2="47" y2="5" stroke="#BCA990" strokeWidth="1.5"/>
                    <ellipse cx="47" cy="3" rx="2.2" ry="4.5" fill="#D4C5A8"/>
                    
                    <line x1="50" y1="20" x2="50" y2="3" stroke="#BCA990" strokeWidth="1.6"/>
                    <ellipse cx="50" cy="1" rx="2.5" ry="5" fill="#D4C5A8"/>
                    
                    <line x1="53" y1="21" x2="53" y2="5" stroke="#BCA990" strokeWidth="1.5"/>
                    <ellipse cx="53" cy="3" rx="2.2" ry="4.5" fill="#D4C5A8"/>
                    
                    <line x1="58" y1="23" x2="59" y2="8" stroke="#B8A888" strokeWidth="1.4"/>
                    <ellipse cx="59" cy="6" rx="2" ry="4" fill="#D4C5A8"/>
                    
                    <line x1="64" y1="26" x2="66" y2="12" stroke="#B8A888" strokeWidth="1.4"/>
                    <ellipse cx="66" cy="10" rx="2" ry="4" fill="#C9B896"/>
                  </g>
                  
                  {/* Texture details */}
                  <g opacity="0.6">
                    {[...Array(25)].map((_, i) => (
                      <ellipse 
                        key={i}
                        cx={28 + (i % 5) * 9 + Math.random() * 4} 
                        cy={22 + Math.floor(i / 5) * 5 + Math.random() * 3}
                        rx={2.5 + Math.random()} 
                        ry={2 + Math.random() * 0.8} 
                        fill={["#A8BDA0", "#8FA888", "#B8C9A8", "#C8D8BE"][i % 4]}
                        transform={`rotate(${Math.random() * 360} ${28 + (i % 5) * 9} ${22 + Math.floor(i / 5) * 5})`}
                      />
                    ))}
                  </g>
                  
                  {/* Small clusters */}
                  <g opacity="0.5">
                    <ellipse cx="32" cy="38" rx="5" ry="4" fill="#9BAF8A" transform="rotate(20 32 38)"/>
                    <ellipse cx="45" cy="32" rx="6" ry="5" fill="#A8BDA0" transform="rotate(-10 45 32)"/>
                    <ellipse cx="55" cy="32" rx="6" ry="5" fill="#A8BDA0" transform="rotate(10 55 32)"/>
                    <ellipse cx="68" cy="38" rx="5" ry="4" fill="#9BAF8A" transform="rotate(-20 68 38)"/>
                  </g>
                </g>
              </svg>
            </div>
            </div>
          </div>
        ))}

        {/* Flying Turkey */}
        {flyingTurkey && (
          <div
            className="absolute transition-all duration-2000"
            style={{
              left: `${flyingTurkey.x}%`,
              top: `${flyingTurkey.y}%`,
              animation: 'flyAway 2s ease-out',
            }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80">
              <defs>
                <radialGradient id="turkeyBody" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#8B5A3C" />
                  <stop offset="100%" stopColor="#654321" />
                </radialGradient>
                <radialGradient id="turkeyHead" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#CD853F" />
                  <stop offset="100%" stopColor="#8B5A3C" />
                </radialGradient>
              </defs>
              
              {/* Tail feathers - fanned out */}
              <g transform="translate(40, 40)">
                {/* Back feathers */}
                <ellipse cx="-15" cy="-20" rx="8" ry="22" fill="#654321" transform="rotate(-40 -15 -20)"/>
                <ellipse cx="-10" cy="-22" rx="8" ry="24" fill="#8B4513" transform="rotate(-25 -10 -22)"/>
                <ellipse cx="-5" cy="-24" rx="8" ry="26" fill="#A0522D" transform="rotate(-10 -5 -24)"/>
                <ellipse cx="0" cy="-25" rx="9" ry="28" fill="#CD853F"/>
                <ellipse cx="5" cy="-24" rx="8" ry="26" fill="#A0522D" transform="rotate(10 5 -24)"/>
                <ellipse cx="10" cy="-22" rx="8" ry="24" fill="#8B4513" transform="rotate(25 10 -22)"/>
                <ellipse cx="15" cy="-20" rx="8" ry="22" fill="#654321" transform="rotate(40 15 -20)"/>
                
                {/* Feather details */}
                <circle cx="-15" cy="-28" r="3" fill="#4169E1" opacity="0.7"/>
                <circle cx="-10" cy="-30" r="3" fill="#4169E1" opacity="0.7"/>
                <circle cx="-5" cy="-32" r="3" fill="#4169E1" opacity="0.7"/>
                <circle cx="0" cy="-33" r="3.5" fill="#4169E1" opacity="0.7"/>
                <circle cx="5" cy="-32" r="3" fill="#4169E1" opacity="0.7"/>
                <circle cx="10" cy="-30" r="3" fill="#4169E1" opacity="0.7"/>
                <circle cx="15" cy="-28" r="3" fill="#4169E1" opacity="0.7"/>
                
                {/* Body */}
                <ellipse cx="0" cy="0" rx="18" ry="20" fill="url(#turkeyBody)"/>
                
                {/* Wings */}
                <ellipse cx="-12" cy="2" rx="10" ry="15" fill="#8B5A3C" transform="rotate(-20 -12 2)"/>
                <ellipse cx="12" cy="2" rx="10" ry="15" fill="#8B5A3C" transform="rotate(20 12 2)"/>
                
                {/* Breast - lighter */}
                <ellipse cx="0" cy="5" rx="12" ry="14" fill="#A0826D" opacity="0.8"/>
                
                {/* Neck */}
                <ellipse cx="8" cy="-10" rx="6" ry="8" fill="url(#turkeyHead)"/>
                
                {/* Head */}
                <ellipse cx="12" cy="-16" rx="7" ry="8" fill="url(#turkeyHead)"/>
                
                {/* Wattle (red thing under beak) */}
                <path d="M 12,-12 Q 10,-8 12,-6" stroke="#DC143C" strokeWidth="3" fill="none" strokeLinecap="round"/>
                
                {/* Snood (red thing over beak) */}
                <path d="M 16,-16 Q 20,-16 20,-12" stroke="#DC143C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                
                {/* Beak */}
                <path d="M 17,-15 L 22,-14 L 17,-13 Z" fill="#FFB347"/>
                
                {/* Eye */}
                <circle cx="14" cy="-16" r="2" fill="#000"/>
                <circle cx="14.5" cy="-16.5" r="0.8" fill="#FFF" opacity="0.8"/>
                
                {/* Legs */}
                <line x1="-6" y1="18" x2="-6" y2="28" stroke="#FFB347" strokeWidth="2.5"/>
                <line x1="6" y1="18" x2="6" y2="28" stroke="#FFB347" strokeWidth="2.5"/>
                
                {/* Feet */}
                <path d="M -6,28 L -10,32 M -6,28 L -6,32 M -6,28 L -2,32" stroke="#FFB347" strokeWidth="2" fill="none"/>
                <path d="M 6,28 L 2,32 M 6,28 L 6,32 M 6,28 L 10,32" stroke="#FFB347" strokeWidth="2" fill="none"/>
              </g>
            </svg>
          </div>
        )}
      </div>



      {/* Scattered rocks and details */}
      <div className="absolute" style={{ left: '10%', bottom: '28%' }}>
        <svg width="30" height="20" viewBox="0 0 30 20">
          <ellipse cx="15" cy="15" rx="14" ry="8" fill="#8B7355" opacity="0.6"/>
          <ellipse cx="15" cy="12" rx="12" ry="7" fill="#9B8365"/>
          <ellipse cx="15" cy="10" rx="10" ry="6" fill="#A59278"/>
        </svg>
      </div>
      <div className="absolute" style={{ left: '35%', bottom: '25%' }}>
        <svg width="25" height="18" viewBox="0 0 25 18">
          <ellipse cx="12" cy="14" rx="11" ry="6" fill="#8B7355" opacity="0.6"/>
          <ellipse cx="12" cy="11" rx="10" ry="5" fill="#9B8365"/>
        </svg>
      </div>
      <div className="absolute" style={{ left: '65%', bottom: '27%' }}>
        <svg width="28" height="19" viewBox="0 0 28 19">
          <ellipse cx="14" cy="15" rx="13" ry="7" fill="#8B7355" opacity="0.6"/>
          <ellipse cx="14" cy="12" rx="11" ry="6" fill="#A59278"/>
        </svg>
      </div>
      <div className="absolute" style={{ left: '90%', bottom: '26%' }}>
        <svg width="22" height="16" viewBox="0 0 22 16">
          <ellipse cx="11" cy="12" rx="10" ry="6" fill="#8B7355" opacity="0.6"/>
          <ellipse cx="11" cy="10" rx="9" ry="5" fill="#9B8365"/>
        </svg>
      </div>

      <style jsx>{`
        .dog-cursor {
          cursor: url("data:image/svg+xml,%3Csvg width='110' height='110' viewBox='0 0 110 110' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cellipse cx='78' cy='70' rx='25' ry='22' fill='%23FFFFFF' stroke='%23000000' stroke-width='3'/%3E%3Cellipse cx='69' cy='67' rx='12' ry='15' fill='%233E2723'/%3E%3Cellipse cx='83' cy='72' rx='11' ry='14' fill='%234A2C2A'/%3E%3Crect x='81' y='88' width='8' height='18' fill='%23FFFFFF' stroke='%23000000' stroke-width='3' rx='3'/%3E%3Cellipse cx='85' cy='106' rx='5' ry='3' fill='%23FFFFFF' stroke='%23000000' stroke-width='2'/%3E%3Cline x1='69' y1='88' x2='60' y2='98' stroke='%23FFFFFF' stroke-width='8' stroke-linecap='round'/%3E%3Cline x1='69' y1='88' x2='60' y2='98' stroke='%23000000' stroke-width='3' stroke-linecap='round'/%3E%3Cline x1='60' y1='98' x2='67' y2='108' stroke='%23FFFFFF' stroke-width='8' stroke-linecap='round'/%3E%3Cline x1='60' y1='98' x2='67' y2='108' stroke='%23000000' stroke-width='3' stroke-linecap='round'/%3E%3Cellipse cx='67' cy='108' rx='5' ry='3' fill='%23FFFFFF' stroke='%23000000' stroke-width='2'/%3E%3Ccircle cx='60' cy='98' r='4' fill='%23FFFFFF' stroke='%23000000' stroke-width='2'/%3E%3Cellipse cx='60' cy='60' rx='11' ry='10' fill='%23FFFFFF' stroke='%23000000' stroke-width='3'/%3E%3Cellipse cx='44' cy='55' rx='20' ry='24' fill='%23FFFFFF' stroke='%23000000' stroke-width='3.5'/%3E%3Cellipse cx='39' cy='50' rx='11' ry='14' fill='%233E2723'/%3E%3Cellipse cx='50' cy='39' rx='9' ry='15' fill='%234A2C2A' stroke='%23000000' stroke-width='3' transform='rotate(20 50 39)'/%3E%3Ccircle cx='39' cy='52' r='5' fill='%23000000'/%3E%3Ccircle cx='40' cy='51' r='2' fill='%23FFFFFF'/%3E%3Cellipse cx='22' cy='60' rx='6' ry='5.5' fill='%23000000' stroke='%23000000' stroke-width='2'/%3E%3Cpath d='M 22,66 Q 28,69 35,66' stroke='%23000000' stroke-width='3' fill='none'/%3E%3Cpath d='M 97,66 Q 106,60 106,50' stroke='%233E2723' stroke-width='8' fill='none' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E") 22 60, auto;
        }
        
        @keyframes flyAway {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-400px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}