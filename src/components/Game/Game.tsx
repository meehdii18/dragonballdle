import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Input, 
  Button, 
  Heading, 
  InputGroup, 
  InputLeftElement,
  InputRightElement,
  Text,
  Image,
  List,
  ListItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useOutsideClick,
  VStack,
  HStack,
  Badge,
  SlideFade,
  SimpleGrid,
  Code
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon, RepeatClockIcon, CheckCircleIcon, WarningIcon, SettingsIcon, ViewIcon } from '@chakra-ui/icons';
import { characters } from '../../data/GameData';

// --- Types ---
interface Character {
  id: number;
  name: string;
  image: string;
  species: string;
  height: string;
  firstArc: string;
  animeAppearances: string[];
  role: string;
}

interface GuessResult {
  name: 'correct' | 'incorrect';
  species: 'correct' | 'close' | 'incorrect';
  height: 'correct' | 'higher' | 'lower' | 'incorrect';
  firstArc: 'correct' | 'incorrect';
  animeAppearances: 'correct' | 'close' | 'incorrect';
  role: 'correct' | 'incorrect';
}

interface Guess {
  character: Character;
  result: GuessResult;
}

function Game() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<{  id: number; name: string; image: string }>>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [dailyCharacter, setDailyCharacter] = useState<Character | null>(null);
  const [guesses, setGuesses] = useState<Array<Guess>>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const maxGuesses = 10;
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const hintThreshold = 5;

  useOutsideClick({
    ref: popoverRef,
    handler: () => setIsPopoverOpen(false),
  });

  // --- Logic Helpers (Chronology) ---
  const chronologicalArcs = [
    "Saga Pilaf", "Saga 21e Tenkaichi Budokai", "Saga Red Ribbon", "Saga Piccolo Daimaô", "Saga 23e Tenkaichi Budokai",
    "Saga Saiyan", "Saga Namek", "Saga Freezer", "Saga Garlick Jr.", "Saga Androïdes", "Saga Cell", "Saga Majin Boo",
    "Saga Baby", "Saga Super C-17", "Saga Dragons Maléfiques",
    "Saga Battle of Gods", "Saga Resurrection F", "Saga Tournoi de Champa", "Saga Black Goku", "Saga Tournoi du Pouvoir",
    "Film"
  ];

  const getDayId = () => {
    const today = `${new Date().getUTCFullYear()}${String(new Date().getUTCMonth() + 1).padStart(2, '0')}${String(new Date().getUTCDate()).padStart(2, '0')}`;
    return today;
  }

  const hashDayId = (str: string) => {
    let hash = 0;
    for (let i=0; i<str.length; i++){
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // --- Comparison Logic ---
  const compareCharacters = (guessed: Character, target: Character): GuessResult => {
    return {
      name: guessed.name.toLowerCase() === target.name.toLowerCase() ? 'correct' : 'incorrect',
      species: compareSpecies(guessed.species, target.species),
      height: compareHeight(guessed.height, target.height),
      firstArc: compareFirstArc(guessed.firstArc, target.firstArc),
      animeAppearances: compareAnimeAppearances(guessed.animeAppearances, target.animeAppearances),
      role: guessed.role === target.role ? 'correct' : 'incorrect'
    };
  };

  const compareSpecies = (guessedSpecies: string, targetSpecies: string) => {
    const relatedSpecies: Record<string, string[]> = {
      'Saiyan': ['Demi-Saiyan', 'Quart-Saiyan'],
      'Demi-Saiyan': ['Saiyan', 'Quart-Saiyan'],
      'Quart-Saiyan': ['Saiyan', 'Demi-Saiyan'],
      'Bio-Androïde': ['Androïde', 'Cyborg'],
      'Androïde': ['Bio-Androïde', 'Cyborg'],
      'Cyborg': ['Androïde', 'Bio-Androïde']
    };
    if (guessedSpecies === targetSpecies) return 'correct';
    if (relatedSpecies[guessedSpecies]?.includes(targetSpecies)) return 'close';
    return 'incorrect';
  };

  const compareHeight = (guessedHeight: string, targetHeight: string) => {
    if (guessedHeight === 'Inconnu' || targetHeight === 'Inconnu') return guessedHeight === targetHeight ? 'correct' : 'incorrect';
    const guessedValue = parseInt(guessedHeight.replace(/[^0-9]/g, ''));
    const targetValue = parseInt(targetHeight.replace(/[^0-9]/g, ''));
    if (guessedValue === targetValue) return 'correct';
    return guessedValue < targetValue ? 'higher' : 'lower';
  };

  const compareArcOrder = (guessedArc: string, targetArc: string): string => {
    const guessedIndex = chronologicalArcs.indexOf(guessedArc);
    const targetIndex = chronologicalArcs.indexOf(targetArc);
    if (guessedIndex === -1 || targetIndex === -1) return '';
    return guessedIndex < targetIndex ? '↑' : '↓';
  };

  const compareFirstArc = (guessedArc: string, targetArc: string) => guessedArc === targetArc ? 'correct' : 'incorrect';

  const compareAnimeAppearances = (guessedAppearances: string[], targetAppearances: string[]) => {
    if (!guessedAppearances || !targetAppearances) return 'incorrect';
    if (guessedAppearances.length === targetAppearances.length && guessedAppearances.every(show => targetAppearances.includes(show))) return 'correct';
    if (guessedAppearances.some(show => targetAppearances.includes(show))) return 'close';
    return 'incorrect';
  };

  // --- Game Management ---
  const dailyRandomChar = () => {
    const max = characters.length;
    const dayId = getDayId();
    const hash = hashDayId(dayId);
    return characters[hash % max];
  };

  const getDailyChar = () => {
    const storedChar = localStorage.getItem('dailyCharacter');
    const storedDayId = localStorage.getItem('characterDayId');
    const currentDayId = getDayId();
  
    if (storedChar && storedDayId === currentDayId) {
      return JSON.parse(storedChar);
    }
  
    const newChar = dailyRandomChar();
    localStorage.setItem('dailyCharacter', JSON.stringify(newChar));
    localStorage.setItem('characterTime', new Date().getTime().toString());
    localStorage.setItem('characterDayId', currentDayId);
    return newChar;
  };

  const updateStats = (won: boolean, attempts: number) => {
    const statsJson = localStorage.getItem('dragonballdle-stats');
    let stats = statsJson ? JSON.parse(statsJson) : { played: 0, won: 0, streak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0] };
    stats.played += 1;
    if (won) {
      stats.won += 1;
      stats.streak += 1;
      if (stats.distribution[attempts - 1] !== undefined) stats.distribution[attempts - 1] += 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
    } else {
      stats.streak = 0;
    }
    localStorage.setItem('dragonballdle-stats', JSON.stringify(stats));
  };

  // --- Effects ---
  useEffect(() => {
    const checkPreviousGuesses = () => {
      const savedGuesses = localStorage.getItem('dragonballdle-guesses');
      const savedDate = localStorage.getItem('dragonballdle-date');
      const currentDayId = getDayId();
      
      if (savedGuesses && savedDate === currentDayId) {
        const parsedGuesses = JSON.parse(savedGuesses);
        setGuesses(parsedGuesses);
        if (parsedGuesses.some((guess: Guess) => guess.result.name === 'correct')) {
          setGameStatus('won');
        } else if (parsedGuesses.length >= maxGuesses) {
          setGameStatus('lost');
        }
      } else if (savedDate !== currentDayId) {
        localStorage.removeItem('dragonballdle-guesses');
      }
    };
  
    const char = getDailyChar();
    setDailyCharacter(char);
    checkPreviousGuesses();
  }, [maxGuesses]);

  useEffect(() => {
    if (searchValue.trim().length >= 1) {
      const alreadyGuessedCharacterNames = guesses.map(g => g.character.name.toLowerCase());
      const filteredSuggestions = characters
        .filter(character => 
          character.name.toLowerCase().includes(searchValue.toLowerCase()) &&
          !alreadyGuessedCharacterNames.includes(character.name.toLowerCase())
        )
        .map(c => ({ id: c.id, name: c.name, image: c.image }));
      
      setSuggestions(filteredSuggestions);
      setIsPopoverOpen(filteredSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setIsPopoverOpen(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [searchValue, guesses]);

  // FIX: Amélioration du défilement automatique
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && listRef.current) {
      const buttons = listRef.current.querySelectorAll('button');
      const selectedButton = buttons[selectedSuggestionIndex];
      if (selectedButton) {
        setTimeout(() => {
          selectedButton.scrollIntoView({ 
            behavior: 'auto', 
            block: 'center', // Changé de 'nearest' à 'center' pour une meilleure visibilité
            inline: 'nearest'
          });
        }, 0);
      }
    }
  }, [selectedSuggestionIndex]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value);

  const clearSearch = () => {
    setSearchValue('');
    setSuggestions([]);
    setIsPopoverOpen(false);
    inputRef.current?.focus();
  };

  const selectSuggestion = (name: string, shouldSubmit = false) => {
    setSearchValue(name);
    setIsPopoverOpen(false);
    if (shouldSubmit) {
      setTimeout(() => {
        const event = new Event('submit', { cancelable: true, bubbles: true });
        document.querySelector('form')?.dispatchEvent(event);
      }, 10);
    } else {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isPopoverOpen && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
            selectSuggestion(suggestions[selectedSuggestionIndex].name, true);
          } else {
            handleSubmit(e);
          }
          break;
        case 'Escape':
          setIsPopoverOpen(false);
          break;
      }
    } else if (searchValue.trim() && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim() || !dailyCharacter) return;
    
    const guessedCharacter = characters.find(c => c.name.toLowerCase() === searchValue.toLowerCase());
    if (!guessedCharacter) return;
    if (guesses.some(guess => guess.character.name === guessedCharacter.name)) return;
  
    const comparisonResult = compareCharacters(guessedCharacter, dailyCharacter);
    const newGuess: Guess = { character: guessedCharacter, result: comparisonResult };
    const updatedGuesses = [newGuess, ...guesses];
    
    setGuesses(updatedGuesses);
    localStorage.setItem('dragonballdle-guesses', JSON.stringify(updatedGuesses));
    localStorage.setItem('dragonballdle-date', getDayId());
    
    if (comparisonResult.name === 'correct') {
      setGameStatus('won');
      updateStats(true, updatedGuesses.length);
    } else if (updatedGuesses.length >= maxGuesses) {
      setGameStatus('lost');
      updateStats(false, maxGuesses);
    }
    
    setSearchValue('');
    setIsPopoverOpen(false);
  };

  const resetDebug = () => {
    setGuesses([]);
    setGameStatus('playing');
    localStorage.removeItem('dragonballdle-guesses');
    localStorage.removeItem('dragonballdle-date');
    localStorage.removeItem('dailyCharacter');
    localStorage.removeItem('characterDayId');
    localStorage.removeItem('characterTime');
    const newChar = getDailyChar();
    setDailyCharacter(newChar);
  }

  // --- Style Helpers ---
  const getCellColor = (status: string) => {
    switch (status) {
      case 'correct': return 'green.500';
      case 'close': return 'orange.400';
      case 'higher': 
      case 'lower': return 'red.500';
      default: return 'red.500';
    }
  };

  const getCellGlow = (status: string) => {
    if (status === 'correct') return '0 0 15px #48BB78';
    if (status === 'close') return '0 0 10px #ED8936';
    return 'none';
  };

  return (
    <Box
      className="game-container"
      width="100%"
      minHeight="calc(100vh - 80px)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative"
      bg="gray.900"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url('/images/background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: 0,
      }}
      _after={{
        content: '""',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        bgGradient: "linear(to-b, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 100%)",
        backdropFilter: "blur(3px)",
        zIndex: 1,
      }}
    >
      <Box className="game-content" position="relative" zIndex={2} width="100%" maxWidth="1200px" p={{ base: 4, md: 8 }} display="flex" flexDirection="column" alignItems="center">
        
        {/* HEADER */}
        <VStack spacing={2} mb="3rem" textAlign="center">
          <Heading 
            as="h1" 
            fontFamily="Saiyan-Sans, sans-serif" 
            fontSize={{ base: "3rem", md: "5rem" }}
            bgGradient="linear(to-r, yellow.400, orange.500)"
            bgClip="text"
            textShadow="0 0 20px rgba(255, 165, 0, 0.5)"
            lineHeight="1"
          >
            DRAGONBALLDLE
          </Heading>
          <Text color="gray.300" fontSize="lg" letterSpacing="wider">
            Devinez le personnage du jour
          </Text>
        </VStack>
        
      {/* GAME STATUS: PLAYING */}
        {gameStatus === 'playing' && (
          <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="600px" mb="2rem" position="relative">
            <VStack spacing={4} width="100%">
              
              <Popover 
                isOpen={isPopoverOpen} 
                autoFocus={false} 
                placement="bottom" 
                matchWidth 
                initialFocusRef={inputRef}
              >
                <PopoverTrigger>
                  <Box width="100%">
                    <InputGroup size="lg" zIndex={10}>
                      <InputLeftElement pointerEvents="none">
                        <SearchIcon color="orange.400" />
                      </InputLeftElement>
                      
                      <Input
                        ref={inputRef}
                        placeholder="Rechercher un personnage (ex: Goku)"
                        value={searchValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => { if (suggestions.length > 0) { setIsPopoverOpen(true); setSelectedSuggestionIndex(-1); } }}
                        bg="whiteAlpha.100"
                        border="2px solid"
                        borderColor="whiteAlpha.300"
                        color="white"
                        backdropFilter="blur(10px)"
                        borderRadius="full"
                        _focus={{
                          borderColor: "orange.400",
                          boxShadow: "0 0 15px rgba(237, 137, 54, 0.4)",
                          bg: "rgba(0,0,0,0.6)"
                        }}
                        _placeholder={{ color: "whiteAlpha.600" }}
                        autoComplete="off"
                      />

                      {searchValue && (
                        <InputRightElement>
                          <Button size="sm" variant="ghost" onClick={clearSearch} borderRadius="full" _hover={{ bg: 'whiteAlpha.200' }}>
                            <CloseIcon color="whiteAlpha.700" boxSize="10px" />
                          </Button>
                        </InputRightElement>
                      )}
                    </InputGroup>
                  </Box>
                </PopoverTrigger>

                <PopoverContent 
                  bg="gray.800" 
                  borderColor="orange.500" 
                  borderWidth="1px"
                  boxShadow="0 0 20px rgba(0,0,0,0.8)"
                  width="100%"
                  maxH="300px" 
                  overflowY="auto"
                  ref={popoverRef}
                  _focus={{ outline: "none" }}
                >
                  <PopoverBody p={0}>
                    <List ref={listRef}>
                      {suggestions.map((suggestion, index) => (
                        <ListItem key={suggestion.id}>
                          <Button
                            variant="ghost"
                            width="100%"
                            justifyContent="flex-start"
                            py={6}
                            rounded="none"
                            onClick={() => selectSuggestion(suggestion.name)}
                            onMouseEnter={() => setSelectedSuggestionIndex(index)}
                            bg={selectedSuggestionIndex === index ? 'rgba(237, 137, 54, 0.3)' : 'transparent'}
                            _hover={{ bg: 'rgba(237, 137, 54, 0.2)' }}
                            borderBottom="1px solid"
                            borderBottomColor="whiteAlpha.100"
                          >
                            <HStack spacing={3}>
                              <Image 
                                src={suggestion.image} 
                                boxSize="40px" 
                                borderRadius="full" 
                                objectFit="cover" 
                                border="2px solid" 
                                borderColor="orange.400"
                                fallbackSrc="https://via.placeholder.com/40"
                              />
                              <Text color="white" fontWeight="bold">{suggestion.name}</Text>
                            </HStack>
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              <Button 
                type="submit" 
                colorScheme="orange" 
                size="lg" 
                width="full" 
                fontSize="xl" 
                fontWeight="bold"
                borderRadius="full"
                boxShadow="0 4px 14px 0 rgba(237, 137, 54, 0.39)"
                _hover={{ transform: 'translateY(-2px)', boxShadow: "0 6px 20px rgba(237, 137, 54, 0.6)" }}
                transition="all 0.2s"
                isDisabled={!searchValue}
              >
                VALIDER
              </Button>
            </VStack>
          </Box>
        )}

        {/* INDICES */}
        {gameStatus === 'playing' && guesses.length >= hintThreshold && dailyCharacter && (
          <SlideFade in={true} offsetY="20px" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <VStack 
              spacing={3} 
              p={4} 
              bg="rgba(0, 0, 0, 0.6)" 
              borderRadius="xl" 
              border="1px solid" 
              borderColor="orange.500"
              boxShadow="0 0 15px rgba(237, 137, 54, 0.3)"
              mb="2rem"
              maxW="400px"
              width="90%"
              backdropFilter="blur(5px)"
            >
              <HStack color="orange.300" spacing={2}>
                <ViewIcon w={5} h={5} />
                <Text fontWeight="bold" letterSpacing="wide" fontSize="lg">INDICE DÉBLOQUÉ</Text>
              </HStack>
              <Text fontSize="sm" color="gray.300" textAlign="center">
                Voici à quoi ressemble le personnage :
              </Text>
              <Box 
                borderRadius="lg" 
                overflow="hidden" 
                border="2px solid" 
                borderColor="orange.400"
                boxShadow="0 0 20px rgba(0,0,0,0.5)"
                bg="gray.800"
              >
                <Image 
                  src={dailyCharacter.image} 
                  alt="Indice" 
                  boxSize="120px"
                  objectFit="cover" 
                  filter="blur(12px)" 
                  transform="scale(1.1)"
                />
              </Box>
            </VStack>
          </SlideFade>
        )}

        {/* STATUS: VICTOIRE/DEFAITE*/}
        <SlideFade in={gameStatus !== 'playing'} offsetY="20px">
          {gameStatus === 'won' && dailyCharacter && (
            <VStack 
              spacing={4} 
              p={8} 
              bgGradient="linear(to-br, green.900, black)" 
              border="2px solid" 
              borderColor="green.400" 
              borderRadius="xl" 
              boxShadow="0 0 30px rgba(72, 187, 120, 0.4)"
              mb={8}
            >
              <CheckCircleIcon w={12} h={12} color="green.400" />
              <Heading color="green.300" fontSize="3xl" textAlign="center">VICTOIRE !</Heading>
              <Text color="white" fontSize="xl">
                C'était bien <Text as="span" fontWeight="bold" color="orange.300">{dailyCharacter.name}</Text>
              </Text>
              <Badge colorScheme="green" fontSize="lg" p={2} borderRadius="md">
                Trouvé en {guesses.length} essai{guesses.length > 1 ? 's' : ''}
              </Badge>
              <Button leftIcon={<RepeatClockIcon />} onClick={() => { setGuesses([]); localStorage.removeItem('dragonballdle-guesses'); setGameStatus('playing'); }} colorScheme="orange" variant="outline" _hover={{ bg: "orange.500", color: "white" }}>
                Rejouer
              </Button>
            </VStack>
          )}

          {gameStatus === 'lost' && dailyCharacter && (
            <VStack 
              spacing={4} 
              p={8} 
              bgGradient="linear(to-br, red.900, black)" 
              border="2px solid" 
              borderColor="red.500" 
              borderRadius="xl" 
              boxShadow="0 0 30px rgba(245, 101, 101, 0.4)"
              mb={8}
            >
              <WarningIcon w={12} h={12} color="red.500" />
              <Heading color="red.500" fontSize="3xl" textAlign="center">DÉFAITE...</Heading>
              <Text color="white" fontSize="lg">Le personnage était :</Text>
              <VStack>
                <Image src={dailyCharacter.image} boxSize="120px" objectFit="contain" border="2px solid white" borderRadius="md" />
                <Text fontSize="2xl" fontWeight="bold" color="orange.300">{dailyCharacter.name}</Text>
              </VStack>
              <Button leftIcon={<RepeatClockIcon />} onClick={() => { setGuesses([]); localStorage.removeItem('dragonballdle-guesses'); setGameStatus('playing'); }} colorScheme="whiteAlpha" variant="outline">
                Réessayer
              </Button>
            </VStack>
          )}
        </SlideFade>

        {/* RESULTS TABLE */}
        {guesses.length > 0 && (
          <Box width="100%" animation="fadeIn 0.5s">
            <Flex justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md" color="white" textTransform="uppercase" letterSpacing="2px" borderBottom="2px solid" borderColor="orange.500" pb={1}>
                Historique ({guesses.length}/{maxGuesses})
              </Heading>
            </Flex>

            {/* Scrollable Container for Table */}
            <Box overflowX="auto" pb={4} sx={{
                '&::-webkit-scrollbar': { height: '8px' },
                '&::-webkit-scrollbar-track': { bg: 'rgba(255,255,255,0.05)' },
                '&::-webkit-scrollbar-thumb': { bg: 'orange.500', borderRadius: '4px' },
              }}>
              <Box minW="800px">
                {/* Custom Table Header */}
                <SimpleGrid columns={7} spacing={2} mb={3} px={2}>
                  <Text color="gray.400" fontWeight="bold" textAlign="center" fontSize="sm">PERSONNAGE</Text>
                  <Text color="gray.400" fontWeight="bold" textAlign="center" fontSize="sm">NOM</Text>
                  <Text color="gray.400" fontWeight="bold" textAlign="center" fontSize="sm">ESPÈCE</Text>
                  <Text color="gray.400" fontWeight="bold" textAlign="center" fontSize="sm">TAILLE</Text>
                  <Text color="gray.400" fontWeight="bold" textAlign="center" fontSize="sm">RÔLE</Text>
                  <Text color="gray.400" fontWeight="bold" textAlign="center" fontSize="sm">1ÈRE APPARITION</Text>
                  <Text color="gray.400" fontWeight="bold" textAlign="center" fontSize="sm">SÉRIES</Text>
                </SimpleGrid>

                {/* Guesses Rows */}
                <VStack spacing={3} align="stretch">
                  {guesses.map((guess, index) => (
                    <SlideFade key={index} in={true} offsetY="-20px">
                      <SimpleGrid 
                        columns={7} 
                        spacing={2} 
                        bg="whiteAlpha.100" 
                        p={2} 
                        borderRadius="lg" 
                        alignItems="center"
                        border="1px solid"
                        borderColor="whiteAlpha.100"
                        _hover={{ bg: "whiteAlpha.200", borderColor: "whiteAlpha.300" }}
                        transition="all 0.2s"
                      >
                        {/* Image */}
                        <Flex justify="center">
                          <Image
                            src={guess.character.image}
                            alt={guess.character.name}
                            boxSize="60px"
                            borderRadius="md"
                            objectFit="cover"
                            border="2px solid"
                            borderColor="whiteAlpha.400"
                          />
                        </Flex>

                        {/* Nom */}
                        <Flex 
                          bg={getCellColor(guess.result.name)} 
                          h="100%" align="center" justify="center" borderRadius="md" 
                          boxShadow={getCellGlow(guess.result.name)}
                          p={1}
                        >
                          <Text fontWeight="bold" fontSize="sm" color="white" textAlign="center">{guess.character.name}</Text>
                        </Flex>

                        {/* Espèce */}
                        <Flex 
                          bg={getCellColor(guess.result.species)} 
                          h="100%" align="center" justify="center" borderRadius="md"
                          boxShadow={getCellGlow(guess.result.species)}
                          p={1}
                        >
                          <Text fontWeight="bold" fontSize="sm" color="white" textAlign="center">{guess.character.species}</Text>
                        </Flex>

                        {/* Taille */}
                        <Flex 
                          bg={getCellColor(guess.result.height)} 
                          h="100%" align="center" justify="center" borderRadius="md" direction="column"
                          boxShadow={getCellGlow(guess.result.height)}
                          p={1}
                          position="relative"
                        >
                          <Text fontWeight="bold" fontSize="sm" color="white">{guess.character.height}</Text>
                          {(guess.result.height === 'higher' || guess.result.height === 'lower') && (
                            <Box position="absolute" bottom="2px" right="4px">
                               <Text fontSize="lg" fontWeight="black" color="whiteAlpha.800" textShadow="0 0 2px black">
                                 {guess.result.height === 'higher' ? '↑' : '↓'}
                               </Text>
                            </Box>
                          )}
                        </Flex>

                        {/* Rôle */}
                        <Flex 
                          bg={getCellColor(guess.result.role)} 
                          h="100%" align="center" justify="center" borderRadius="md"
                          boxShadow={getCellGlow(guess.result.role)}
                          p={1}
                        >
                           <Text fontWeight="bold" fontSize="sm" color="white" textAlign="center">{guess.character.role}</Text>
                        </Flex>

                        {/* Arc */}
                        <Flex 
                          bg={getCellColor(guess.result.firstArc)} 
                          h="100%" align="center" justify="center" borderRadius="md" direction="column"
                          boxShadow={getCellGlow(guess.result.firstArc)}
                          p={1}
                          position="relative"
                        >
                          <Text fontWeight="bold" fontSize="xs" color="white" textAlign="center" lineHeight="1.2">{guess.character.firstArc}</Text>
                          {guess.result.firstArc !== 'correct' && (
                             <Box position="absolute" bottom="0" right="2px">
                               <Text fontSize="lg" fontWeight="black" color="whiteAlpha.800" textShadow="0 0 2px black">
                                 {compareArcOrder(guess.character.firstArc, dailyCharacter!.firstArc)}
                               </Text>
                             </Box>
                          )}
                        </Flex>

                        {/* Séries */}
                        <Flex 
                          bg={getCellColor(guess.result.animeAppearances)} 
                          h="100%" align="center" justify="center" borderRadius="md"
                          boxShadow={getCellGlow(guess.result.animeAppearances)}
                          p={1}
                        >
                          <VStack spacing={0}>
                            {guess.character.animeAppearances.map((anime, i) => (
                              <Badge key={i} bg="transparent" color="white" fontSize="9px" px={0} textTransform="none">
                                {anime.replace('Dragon Ball', 'DB')}
                              </Badge>
                            ))}
                          </VStack>
                        </Flex>

                      </SimpleGrid>
                    </SlideFade>
                  ))}
                </VStack>
              </Box>
            </Box>
          </Box>
        )}

        {/* Debug Info (Visible as requested) */}
        {dailyCharacter && (
            <Flex 
              direction="column" 
              bg="rgba(0, 0, 0, 0.4)" 
              p={4} 
              borderRadius="lg" 
              border="1px dashed" 
              borderColor="whiteAlpha.300"
              mt={8}
              mb={4}
              gap={3}
              alignItems="center"
              width="full"
              maxWidth="400px"
              backdropFilter="blur(5px)"
            >
              <HStack color="orange.300">
                <SettingsIcon />
                <Text fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Debug</Text>
              </HStack>
              
              <Text color="gray.300" fontSize="sm">
                Personnage du jour : <Code colorScheme="orange">{dailyCharacter.name}</Code>
              </Text>

              <Button
                size="sm"
                variant="outline"
                colorScheme='red'
                leftIcon={<RepeatClockIcon/>}
                onClick={resetDebug}
                width="full"
                _hover={{ bg: "red.500", color: "white", borderColor: "red.500" }}
              >
                Reset Partie & Nouveau Perso
              </Button>
            </Flex>
        )}

      </Box>
    </Box>
  );
}

export default Game;