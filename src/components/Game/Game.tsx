import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Input, 
  Button, 
  Heading, 
  InputGroup, 
  InputLeftElement,
  Text,
  Image,
  List,
  ListItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useOutsideClick
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon, RepeatClockIcon } from '@chakra-ui/icons';
import { characters } from '../../data/GameData';

function Game() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<{  id: number; name: string; image: string }>>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [dailyCharacter, setDailyCharacter] = useState<any>(null);
  const [guesses, setGuesses] = useState<Array<any>>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const maxGuesses = 10;
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const listRef = React.useRef<HTMLUListElement>(null);

  useOutsideClick({
    ref: popoverRef,
    handler: () => setIsPopoverOpen(false),
  });

  useEffect(() => {
    const checkPreviousGuesses = () => {
      // Charger les essais précédents s'ils existent et sont de la même journée
      const savedGuesses = localStorage.getItem('dragonballdle-guesses');
      const savedDate = localStorage.getItem('dragonballdle-date');
      const currentDayId = getDayId();
      
      if (savedGuesses && savedDate === currentDayId) {
        const parsedGuesses = JSON.parse(savedGuesses);
        setGuesses(parsedGuesses);
        
        // Vérifier l'état du jeu
        if (parsedGuesses.some((guess: { result: { name: string } }) => guess.result.name === 'correct')) {
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
  
  // useEffect différent qui gère l'autocomplétion
  useEffect(() => {
    if (searchValue.trim().length >= 1) {
      // Récupérer tous les noms de personnages déjà essayés
      const alreadyGuessedCharacterNames = guesses.map(g => g.character.name.toLowerCase());
      
      const filteredSuggestions = characters
        .filter(character => 
          character.name.toLowerCase().includes(searchValue.toLowerCase()) &&
          !alreadyGuessedCharacterNames.includes(character.name.toLowerCase())
        )
        .map(character => ({ 
          id: character.id, 
          name: character.name,
          image: character.image
        }));
      
      setSuggestions(filteredSuggestions);
      setIsPopoverOpen(filteredSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setIsPopoverOpen(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [searchValue, guesses]);

  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && listRef.current) {
      // Trouver directement le bouton au lieu de chercher le li
      const buttons = listRef.current.querySelectorAll('button');
      const selectedButton = buttons[selectedSuggestionIndex];
      
      if (selectedButton) {
        // Utiliser un timeout pour s'assurer que tout est rendu
        setTimeout(() => {
          selectedButton.scrollIntoView({
            behavior: 'auto', // Changé de 'smooth' à 'auto' pour un défilement immédiat
            block: 'nearest',
            inline: 'nearest'
          });
        }, 0);
      }
    }
  }, [selectedSuggestionIndex]);

  const getDayId = () => {
    const today = `${new Date().getUTCFullYear()}${String(new Date().getUTCMonth() + 1).padStart(2, '0')}${String(new Date().getUTCDate()).padStart(2, '0')}`;
    return today;
  }

  const hashDayId = (str: string) => {
    let hash = 0;
    for (let i=0; i<str.length; i++){
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32 bits entier
    }
    return Math.abs(hash);
  }

  const compareCharacters = (guessed: any, target: any) => {
    return {
      name: guessed.name.toLowerCase() === target.name.toLowerCase() ? 'correct' : 'incorrect',
      species: compareSpecies(guessed.species, target.species),
      height: compareHeight(guessed.height, target.height),
      age: compareAge(guessed.age, target.age),
      firstArc: compareFirstArc(guessed.firstArc, target.firstArc),
      animeAppearances: compareAnimeAppearances(guessed.animeAppearances, target.animeAppearances)
    };
  };

  const compareSpecies = (guessedSpecies: string, targetSpecies: string) => {
    // Liste des espèces apparentées
    const relatedSpecies: Record<string, string[]> = {
      'Saiyan': ['Demi-Saiyan', 'Quart-Saiyan'],
      'Demi-Saiyan': ['Saiyan', 'Quart-Saiyan'],
      'Quart-Saiyan': ['Saiyan', 'Demi-Saiyan'],
      'Bio-Androïde': ['Androïde', 'Cyborg'],
      'Androïde': ['Bio-Androïde', 'Cyborg'],
      'Cyborg': ['Androïde', 'Bio-Androïde']
    };
  
    if (guessedSpecies === targetSpecies) {
      return 'correct';
    } else if (relatedSpecies[guessedSpecies] && relatedSpecies[guessedSpecies].includes(targetSpecies)) {
      return 'close';
    }
    return 'incorrect';
  };

  const compareHeight = (guessedHeight: string, targetHeight: string) => {
    if (guessedHeight === 'Inconnu' || targetHeight === 'Inconnu') {
      return guessedHeight === targetHeight ? 'correct' : 'incorrect';
    }
    
    // Extraire les valeurs numériques des hauteurs
    const guessedValue = parseInt(guessedHeight.replace(/[^0-9]/g, ''));
    const targetValue = parseInt(targetHeight.replace(/[^0-9]/g, ''));
    
    if (guessedValue === targetValue) {
      return 'correct';
    } else if (guessedValue < targetValue) {
      return 'higher'; // La valeur cible est plus élevée
    } else {
      return 'lower';  // La valeur cible est moins élevée
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Si la liste de suggestions est ouverte, gérer la navigation dans les suggestions
    if (isPopoverOpen && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
          
          case 'Enter':
            e.preventDefault(); // Empêcher le comportement par défaut
            if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
              // Sélectionner la suggestion et soumettre immédiatement
              selectSuggestion(suggestions[selectedSuggestionIndex].name, true);
            } else {
              // Soumettre directement le formulaire
              handleSubmit(e);
            }
            break;
          
        case 'Escape':
          e.preventDefault();
          setIsPopoverOpen(false);
          setSelectedSuggestionIndex(-1);
          break;
          
        default:
          break;
      }
    } 
    // Si la liste de suggestions n'est pas ouverte mais qu'il y a du texte dans le champ
    else if (searchValue.trim() && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const compareAge = (guessedAge: string, targetAge: string) => {
    if (guessedAge === 'Inconnu' || targetAge === 'Inconnu') {
      return guessedAge === targetAge ? 'correct' : 'incorrect';
    }
  
    const guessedValue = parseInt(guessedAge, 10);
    const targetValue = parseInt(targetAge, 10);
  
    if (isNaN(guessedValue) || isNaN(targetValue)) {
      return 'incorrect';
    }
  
    if (Math.abs(guessedValue - targetValue) <= 3) {
      return 'correct';
    } else if (Math.abs(guessedValue - targetValue) <= 10) {
      return 'close';
    }
    return guessedValue < targetValue ? 'lower' : 'higher';
  };

const chronologicalArcs = [
  // Dragon Ball
  "Saga Pilaf",
  "Saga 21e Tenkaichi Budokai",
  "Saga Red Ribbon",
  "Saga Piccolo Daimaô",
  "Saga 23e Tenkaichi Budokai",
  
  // Dragon Ball Z
  "Saga Saiyan",
  "Saga Namek",
  "Saga Freezer",
  "Saga Garlick Jr.",
  "Saga Androïdes",
  "Saga Cell",
  "Saga Majin Boo",
  
  // Dragon Ball GT
  "Saga Baby",
  "Saga Super C-17",
  "Saga Dragons Maléfiques",
  
  // Dragon Ball Super
  "Saga Battle of Gods",
  "Saga Resurrection F",
  "Saga Tournoi de Champa",
  "Saga Black Goku",
  "Saga Tournoi du Pouvoir"
];

// Fonction qui compare la position chronologique de deux arcs
const compareArcOrder = (guessedArc: string, targetArc: string): string => {
  const guessedIndex = chronologicalArcs.indexOf(guessedArc);
  const targetIndex = chronologicalArcs.indexOf(targetArc);
  
  if (guessedIndex === -1 || targetIndex === -1) return '';
  
  if (guessedIndex < targetIndex) {
    return '↑'; // L'arc cible est plus récent
  } else {
    return '↓'; // L'arc cible est plus ancien
  }
};

  const compareFirstArc = (guessedArc: string, targetArc: string) => {
    // Même saga = vert
    if (guessedArc === targetArc) {
      return 'correct';
    }

    return 'incorrect';
  };

  const compareAnimeAppearances = (guessedAppearances: string[], targetAppearances: string[]) => {
    // Vérifier si les tableaux existent
    if (!guessedAppearances || !targetAppearances) {
      return 'incorrect';
    }
  
    // Si toutes les apparitions sont identiques
    if (guessedAppearances.length === targetAppearances.length && 
        guessedAppearances.every(show => targetAppearances.includes(show))) {
      return 'correct';
    }
  
    // S'il y a au moins une apparition en commun
    if (guessedAppearances.some(show => targetAppearances.includes(show))) {
      return 'close';
    }
  
    return 'incorrect';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
        
    if (!searchValue.trim() || !dailyCharacter) {
      console.log("Soumission annulée: champ vide ou personnage quotidien non défini");
      return;
    }
    
    // Trouver le personnage correspondant dans la liste
    const guessedCharacter = characters.find(
      character => character.name.toLowerCase() === searchValue.toLowerCase()
    );
    
    if (!guessedCharacter) {
      // Personnage non trouvé
      return;
    }
    
    // Empêcher de soumettre le même personnage deux fois
    if (guesses.some(guess => guess.character.name === guessedCharacter.name)) {
      return;
    }
  
    // Comparer le personnage deviné avec le personnage cible
    const comparisonResult = compareCharacters(guessedCharacter, dailyCharacter);
    
    // Créer un nouvel essai
    const newGuess = {
      character: guessedCharacter,
      result: comparisonResult
    };
    
    // Ajouter l'essai à la liste des essais
    const updatedGuesses = [newGuess,...guesses];
    setGuesses(updatedGuesses);
    
    // Sauvegarder les essais dans localStorage
    localStorage.setItem('dragonballdle-guesses', JSON.stringify(updatedGuesses));
    localStorage.setItem('dragonballdle-date', getDayId());
    
    // Vérifier si le joueur a gagné
    if (comparisonResult.name === 'correct') {
      setGameStatus('won');
      updateStats(true, updatedGuesses.length);
    } 
    // Vérifier si le joueur a perdu (nombre maximum d'essais atteint)
    else if (updatedGuesses.length >= maxGuesses) {
      setGameStatus('lost');
      updateStats(false, maxGuesses);
    }
    
    // Réinitialiser le champ de recherche
    setSearchValue('');
    setIsPopoverOpen(false);
  };

  // Mettre à jour les statistiques du joueur
  const updateStats = (won: boolean, attempts: number) => {
    // Récupérer les statistiques existantes du localStorage
    const statsJson = localStorage.getItem('dragonballdle-stats');
    
    let stats = statsJson ? JSON.parse(statsJson) : {
      played: 0,
      won: 0,
      streak: 0,
      maxStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0]
    };
    
    // Mettre à jour les statistiques
    stats.played += 1;
    
    if (won) {
      stats.won += 1;
      stats.streak += 1;
      stats.distribution[attempts - 1] += 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
    } else {
      stats.streak = 0;
    }
    
    // Sauvegarder les statistiques mises à jour
    localStorage.setItem('dragonballdle-stats', JSON.stringify(stats));
  };

  const clearSearch = () => {
    setSearchValue('');
    setSuggestions([]);
    setIsPopoverOpen(false);
  };

  const selectSuggestion = (name: string, shouldSubmit = false) => {
    setSearchValue(name);
    setIsPopoverOpen(false);
    
    if (shouldSubmit) {
      setTimeout(() => {
        const event = new Event('submit', { cancelable: true, bubbles: true });
        const form = document.querySelector('form');
        if (form) form.dispatchEvent(event);
      }, 10);
    } else if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const dailyRandomChar = () => {
    const max = characters.length;
    const dayId = getDayId();
    const hash = hashDayId(dayId);
    const index = hash%max;
    return characters[index];
  };

  const getDailyChar = () => {
    const storedChar = localStorage.getItem('dailyCharacter');
    const storedDayId = localStorage.getItem('characterDayId');
    const currentDayId = getDayId();
  
    if (storedChar && storedDayId === currentDayId) {
      return JSON.parse(storedChar);
    }
  
    // Génère un nouveau personnage si pas de personnage stocké ou si le jour a changé
    const newChar = dailyRandomChar();
    localStorage.setItem('dailyCharacter', JSON.stringify(newChar));
    localStorage.setItem('characterTime', new Date().getTime().toString());
    localStorage.setItem('characterDayId', currentDayId);
    
    return newChar;
  };

  return (
    <Box
      className="game-container"
      width="100%"
      minHeight="calc(100vh - 80px)"
      padding="2rem"
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative"
      overflow="hidden"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url('/images/background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          zIndex: 0,
          width: '100%',
          height: '100%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 1,
          width: '100%',
          height: '100%',
        }
      }}
    >
      <Box
        className="game-content"
        position="relative"
        zIndex={2}
        width="100%"
        maxWidth="1200px"
        height="100%"
        color="white"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Heading 
          as="h2" 
          size="2xl" 
          fontFamily="Saiyan-Sans" 
          fontSize="5rem" 
          mb="2rem" 
          textShadow="0 0 10px rgba(255, 200, 0, 0.5)" 
          color="#ffcc00"
        >
          Trouve le personnage de Dragon Ball
        </Heading>
        
        {gameStatus === 'playing' && (
          <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="600px" mb="2rem">
            <Flex gap={3}>
              <Box position="relative" flex="1">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="whiteAlpha.700" />
                  </InputLeftElement>
                  
                  <Input
                    ref={inputRef}
                    placeholder="Qui est ce personnage ?"
                    value={searchValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (suggestions.length > 0) {
                        setIsPopoverOpen(true);
                        setSelectedSuggestionIndex(-1);
                      }
                    }}
                    bg="whiteAlpha.100"
                    border="2px solid"
                    borderColor="whiteAlpha.200"
                    _focus={{
                      borderColor: "dragonball.300",
                      boxShadow: "0 0 0 1px #ffcc00"
                    }}
                    _placeholder={{ color: "whiteAlpha.500" }}
                    pr={searchValue ? "40px" : "20px"}
                  />
                  
                  {searchValue && (
                    <Button
                      position="absolute"
                      right="8px"
                      top="50%"
                      transform="translateY(-50%)"
                      zIndex={2}
                      size="sm"
                      p={0}
                      minW="auto"
                      h="auto"
                      variant="ghost"
                      onClick={clearSearch}
                      aria-label="Effacer la recherche"
                    >
                      <CloseIcon color="whiteAlpha.700" boxSize="10px" />
                    </Button>
                  )}
                </InputGroup>
                
                <Popover
                  isOpen={isPopoverOpen}
                  autoFocus={false}
                  closeOnBlur={false}
                  placement="bottom-start"
                  gutter={5}
                  matchWidth
                  closeOnEsc={false} 
                >
                  <PopoverTrigger>
                    <Box />
                  </PopoverTrigger>
                  <PopoverContent
                    ref={popoverRef}
                    bg="rgba(30, 30, 30, 0.9)"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    borderRadius="8px"
                    boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
                    maxH="300px"
                    overflowY="auto"
                    sx={{
                      '&::-webkit-scrollbar': {
                        width: '8px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255, 165, 0, 0.3)',
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 165, 0, 0.5)',
                        },
                      },
                    }}
                  >
                    <PopoverBody p={2}>
                    <List spacing={1} ref={listRef}>
                      {suggestions.map((suggestion, index) => (
                        <ListItem key={suggestion.id}>
                          <Button
                            variant="ghost"
                            justifyContent="flex-start"
                            width="100%"
                            py={2}
                            px={3}
                            borderRadius="6px"
                            onClick={() => selectSuggestion(suggestion.name)}
                            bg={selectedSuggestionIndex === index ? 'rgba(255, 165, 0, 0.3)' : 'transparent'}
                            _hover={{
                              bg: 'rgba(255, 165, 0, 0.2)'
                            }}
                            _focus={{
                              bg: 'rgba(255, 165, 0, 0.3)',
                              boxShadow: 'none'
                            }}
                          >
                            <Flex alignItems="center" width="100%">
                              <Box
                                borderRadius="full"
                                overflow="hidden"
                                boxSize="30px"
                                bg="whiteAlpha.100"
                                mr={2}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexShrink={0}
                              >
                                <Image
                                  src={suggestion.image}
                                  alt={suggestion.name}
                                  width="100%"
                                  height="100%"
                                  objectFit="cover"
                                  fallbackSrc="/images/star-ball-1.png"
                                />
                              </Box>
                              <Text
                                color="white"
                                fontSize="0.95rem"
                                isTruncated
                              >
                                {suggestion.name}
                              </Text>
                            </Flex>
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Box>
              
              <Button
                type="submit"
                variant="dragonball"
                px={6}
                height="auto"
                fontSize="2rem"
              >
                Deviner
              </Button>
            </Flex>
          </Box>
        )}

                  {/* Affichage du résultat du jeu */}
                  {gameStatus === 'won' && (
            <Box 
              mt={4} 
              p={6} 
              bg="rgba(0, 100, 0, 0.6)" 
              borderRadius="md" 
              textAlign="center"
              border="1px solid rgba(100, 255, 100, 0.3)"
            >
              <Heading color="green.300" mb={2}>
                VICTOIRE !
              </Heading>
              <Text 
              fontSize="xl"
              fontWeight={"bold"}
              pb={5}
              >
                Tu as trouvé {dailyCharacter.name} en {guesses.length} essai{guesses.length > 1 ? 's' : ''} !
              </Text>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setGuesses([]);
                  localStorage.removeItem('dragonballdle-guesses');
                  setGameStatus('playing');
                }}
                alignSelf="flex-start"
                gap={1}
                color={"orange.300"}
                
                _hover={{ bg: 'orange.600', color: 'white' }}
              >
                <RepeatClockIcon>
                </RepeatClockIcon>
                Rejouer
              </Button>
            </Box>
          )}
          
          {gameStatus === 'lost' && (
            <Box 
              mt={4} 
              p={6} 
              bg="rgba(100, 0, 0, 0.6)" 
              borderRadius="md" 
              textAlign="center"
              border="1px solid rgba(255, 100, 100, 0.3)"
            >
              <Heading color="red.300" mb={2}>
                DÉFAITE !
              </Heading>
              <Text fontSize="xl" mb={3}>
                Le personnage du jour était {dailyCharacter.name}.
              </Text>
              <Image 
                src={dailyCharacter.image}
                alt={dailyCharacter.name}
                boxSize="100px"
                objectFit="contain"
                mx="auto"
              />
            </Box>
          )}


        <Box className="previous-guesses" width="100%" maxWidth="2000px" mt="2rem">
          {/* Affichage des essais précédents */}
          {guesses.length > 0 && (
            <Box 
              bg="rgba(0, 0, 0, 0.3)" 
              p={4} 
              borderRadius="md" 
              border="1px solid rgba(255, 255, 255, 0.1)"
            >
              <Heading as="h3" size="md" mb={4} color="orange.300">
                Essais ({guesses.length}/{maxGuesses})
              </Heading>
              
              <Box overflowX="auto">
                <Box as="table" width="100%" sx={{ borderCollapse: "separate", borderSpacing: "1rem" }}>
                  <Box as="thead">
                    <Box as="tr">
                      <Box as="th" p={2} fontWeight="bold">Image</Box>
                      <Box as="th" p={2} fontWeight="bold">Nom</Box>
                      <Box as="th" p={2} fontWeight="bold">Espèce</Box>
                      <Box as="th" p={2} fontWeight="bold">Taille</Box>
                      <Box as="th" p={2} fontWeight="bold">Âge</Box>
                      <Box as="th" p={2} fontWeight="bold">Première apparition</Box>
                      <Box as="th" p={2} fontWeight="bold">Séries</Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {guesses.map((guess, index) => (
                      <Box as="tr" key={index}>

                      <Box 
                          as="td" 
                          p={2}
                          textAlign="center"
                        >
                          <Image
                            src={guess.character.image}
                            alt={guess.character.name}
                            boxSize="60px"
                            borderRadius="full"
                            objectFit="cover"
                            mx="auto"
                          />
                        </Box>

                        <Box 
                        as="td" 
                        p={2}
                        m={10}
                        bgColor={guess.result.name === 'correct' ? 'green.500' : 'red.500'}
                        borderRadius="md"
                        opacity={0.7}
                        textAlign="center"
                      >
                        {guess.character.name}
                      </Box>

                      <Box 
                      as="td" 
                      p={2}
                      bgColor={
                        guess.result.species === 'correct' ? 'green.500' : 
                        guess.result.species === 'close' ? 'yellow.500' : 
                        'red.500'
                      }
                      opacity={0.7}
                      borderRadius="md"
                      textAlign="center"
                    >
                      {guess.character.species}
                    </Box>

                    <Box 
                      as="td" 
                      p={2}
                      bgColor={guess.result.height === 'correct' ? 'green.500' : 'red.500'}
                      opacity={0.7}
                      borderRadius="md"
                      textAlign="center"
                    >
                      {guess.character.height}
                      {(guess.result.height === 'higher' || guess.result.height === 'lower') && (
                        <Text as="span" ml={1}>
                          {guess.result.height === 'higher' ? '↑' : '↓'}
                        </Text>
                      )}
                    </Box>

                    <Box 
                      as="td" 
                      p={2}
                      bgColor={
                        guess.result.age === 'correct' ? 'green.500' :
                        guess.result.age === 'close' ? 'yellow.500' : 
                        'red.500'  // Toujours rouge, même pour 'lower' ou 'higher'
                      }
                      opacity={0.7}
                      borderRadius="md"
                      textAlign="center"
                    >
                      {guess.character.age}
                      {(guess.result.age === 'lower' || guess.result.age === 'higher') && (
                        <Text as="span" ml={1}>
                          {guess.result.age === 'higher' ? '↓' : '↑'}
                        </Text>
                      )}
                    </Box>

                    <Box 
                      as="td" 
                      p={2}
                      bgColor={
                        guess.result.firstArc === 'correct' ? 'green.500' : 'red.500'
                      }
                      opacity={0.7}
                      borderRadius="md"
                      textAlign="center"
                    >
                      {guess.character.firstArc}
                      {guess.result.firstArc !== 'correct' && (
                        <Text as="span" ml={1} fontWeight="bold">
                          {compareArcOrder(guess.character.firstArc, dailyCharacter.firstArc)}
                        </Text>
                      )}
                    </Box>

                        <Box 
                          as="td" 
                          p={2}
                          bgColor={
                            guess.result.animeAppearances === 'correct' ? 'green.500' :
                            guess.result.animeAppearances === 'close' ? 'yellow.500' : 
                            'red.500'
                          }
                          opacity={0.7}
                          borderRadius="md"
                          textAlign="center"
                        >
                          {/* Remplacer l'affichage du nombre par la liste des séries */}
                          <Flex direction="column" alignItems="center" gap={1}>
                            {guess.character.animeAppearances.map((anime: string, i: number) => (
                              <Text key={i} fontSize="xs" lineHeight="1.2">
                                {anime.replace('Dragon Ball', 'DB')}
                              </Text>
                            ))}
                          </Flex>
                        </Box>                  

                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          
          {/* Affichage du personnage du jour et bouton de reset (pour le débogage) */}
          {dailyCharacter && (
            <Flex 
              direction="column" 
              bg="rgba(0, 0, 0, 0.3)" 
              p={4} 
              borderRadius="md" 
              border="1px solid rgba(255, 255, 255, 0.1)"
              mt={4}
              gap={3}
            >
              <Text color="white" fontSize="sm" opacity={0.7} mb={2}>
                Personnage du jour (Debug): {dailyCharacter.name}
              </Text>
            
            </Flex>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Game;