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
  useOutsideClick,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon, RepeatIcon } from '@chakra-ui/icons';
import { characters } from '../../data/GameData';

function Game() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<{ id: number; name: string; image: string }>>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [dailyCharacter, setDailyCharacter] = useState<any>(null);
  const { isOpen: isResetModalOpen, onOpen: onResetModalOpen, onClose: onResetModalClose } = useDisclosure();

  
  useOutsideClick({
    ref: popoverRef,
    handler: () => setIsPopoverOpen(false),
  });

  useEffect(() => {
    const char = getDailyChar();
    setDailyCharacter(char);

    if (searchValue.trim().length >= 1) {
      const firstLetter = searchValue.trim().charAt(0).toLowerCase();
      const filteredSuggestions = characters
        .filter(character => 
          character.name.toLowerCase().charAt(0) === firstLetter)
        .map(character => ({ 
          id: character.id, 
          name: character.name,
          image: character.image
        }));
      
      setSuggestions(filteredSuggestions);
      setIsPopoverOpen(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setIsPopoverOpen(false);
    }
  }, [searchValue]);

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

  const resetDailyCharacter = () => {
    const newChar = dailyRandomChar();
    localStorage.setItem('dailyCharacter', JSON.stringify(newChar));
    localStorage.setItem('characterTime', new Date().getTime().toString());
    localStorage.setItem('characterDayId', getDayId());
    
    setDailyCharacter(newChar);
    onResetModalClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Recherche de personnage:", searchValue);
    if (dailyCharacter && searchValue.toLowerCase() === dailyCharacter.name.toLowerCase()) {
      console.log("VICTOIRE");
      // Vous pouvez ajouter ici votre logique pour afficher un message de victoire
    }
    setIsPopoverOpen(false);
  };

  const clearSearch = () => {
    setSearchValue('');
    setSuggestions([]);
    setIsPopoverOpen(false);
  };

  const selectSuggestion = (name: string) => {
    setSearchValue(name);
    setIsPopoverOpen(false);
    if (inputRef.current) {
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
    const storedTime = localStorage.getItem('characterTime');
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
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setIsPopoverOpen(true);
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
                  maxH="200px"
                  overflowY="auto"
                >
                  <PopoverBody p={2}>
                    <List spacing={1}>
                      {suggestions.map((suggestion) => (
                        <ListItem key={suggestion.id}>
                          <Button
                            variant="ghost"
                            justifyContent="flex-start"
                            width="100%"
                            py={2}
                            px={3}
                            borderRadius="6px"
                            onClick={() => selectSuggestion(suggestion.name)}
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


        <Box className="previous-guesses" width="100%" maxWidth="600px" mt="2rem">
          {/* Affichage du personnage du jour et bouton de reset (pour le débogage) */}
          {dailyCharacter && (
            <Flex 
              direction="column" 
              bg="rgba(0, 0, 0, 0.3)" 
              p={4} 
              borderRadius="md" 
              border="1px solid rgba(255, 255, 255, 0.1)"
            >
              <Text color="white" fontSize="sm" opacity={0.7} mb={2}>
                Personnage du jour (à masquer en production): {dailyCharacter.name}
              </Text>
              
              <Button 
                leftIcon={<RepeatIcon />} 
                size="sm" 
                colorScheme="red" 
                variant="outline"
                onClick={onResetModalOpen}
                alignSelf="flex-start"
              >
                Changer le personnage du jour
              </Button>
            </Flex>
          )}
          {/* Ici tu pourras afficher les essais précédents */}
        </Box>
      </Box>
      
            {/* Modal de confirmation pour le reset */}
      <Modal isOpen={isResetModalOpen} onClose={onResetModalClose}>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader color="orange.300">Réinitialiser le personnage</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Êtes-vous sûr de vouloir changer le personnage du jour ?
            </Text>
            <Text mt={2} fontSize="sm" color="red.300">
              Attention : Cette action réinitialisera également toutes les tentatives en cours.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onResetModalClose}>
              Annuler
            </Button>
            <Button 
              colorScheme="red" 
              onClick={resetDailyCharacter}
            >
              Réinitialiser
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Game;