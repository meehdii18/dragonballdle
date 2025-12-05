// import React from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Button, 
  Image, 
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Icon
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { CheckCircleIcon, WarningIcon, ArrowUpIcon, ArrowDownIcon, SmallCloseIcon } from '@chakra-ui/icons';

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

function Header() {
  const { isOpen: isHelpOpen, onOpen: onHelpOpen, onClose: onHelpClose } = useDisclosure();

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bgGradient="linear(to-r, orange.500, orange.600)"
      color="white"
      py={2}
      px={{ base: 4, md: 8 }}
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.4)"
      borderBottomWidth="4px"
      borderBottomColor="orange.800"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
    >
      <Flex alignItems="center" gap={3}>
        <Image
          src="/images/star-ball-1.png"
          alt="Dragon Ball"
          boxSize={{ base: "30px", md: "45px" }}
          animation={`${float} 3s ease-in-out infinite`}
          filter="drop-shadow(0 0 5px rgba(255, 255, 0, 0.6))"
          _hover={{
            animation: `${spin} 0.5s ease-in-out`
          }}
        />
        <Heading 
          as="h1" 
          fontFamily="Saiyan-Sans"
          fontSize={{ base: "2rem", md: "3.5rem" }}
          lineHeight="1"
          m={0}
          mt={2} // Petit ajustement pour centrer la police Saiyan visuellement
          color="white"
          textShadow="3px 3px 0px #9C4221"
          letterSpacing="2px"
        >
          DragonBalldle
        </Heading>
      </Flex>

      <Flex gap={4}>
        <Button 
          onClick={onHelpOpen}
          variant="ghost"
          _hover={{ bg: 'whiteAlpha.300', transform: 'scale(1.05)' }} 
          _active={{ bg: 'whiteAlpha.400' }}
          aria-label="Comment jouer"
          color="white"
          fontFamily="Saiyan-Sans"
          fontSize={{ base: "1.5rem", md: "2rem" }}
          letterSpacing="1px"
          transition="all 0.2s"
        >
          Comment jouer
        </Button>

        {/* Modal pour les règles du jeu - Style Tech/Scouter */}
        <Modal isOpen={isHelpOpen} onClose={onHelpClose} isCentered size="lg" motionPreset="slideInBottom">
          <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.700" />
          <ModalContent 
            bg="gray.900" 
            border="2px solid" 
            borderColor="orange.500"
            boxShadow="0 0 25px rgba(237, 137, 54, 0.5)"
            borderRadius="xl"
            overflow="hidden"
          >
            <ModalHeader 
              fontFamily="Saiyan-Sans" 
              fontSize="3xl" 
              color="orange.400" 
              bg="whiteAlpha.100"
              borderBottom="1px solid"
              borderColor="whiteAlpha.200"
              textAlign="center"
              letterSpacing="2px"
            >
              Règles du Jeu
            </ModalHeader>
            <ModalCloseButton color="white" mt={2} />
            
            <ModalBody py={6} color="gray.100">
              <VStack spacing={6} align="stretch">
                
                <Text textAlign="center" fontSize="lg">
                  Devine le personnage de Dragon Ball du jour !<br/>
                  Tu as <Box as="span" color="orange.400" fontWeight="bold">10 essais</Box> pour le trouver. <br/>
                  Les personnages proviennent de DB, DBZ, DBGT, DBS ainsi que les films liés.
                </Text>

                <Divider borderColor="whiteAlpha.300" />

                <Box>
                  <Heading size="sm" color="orange.300" mb={3} textTransform="uppercase">Codes Couleur</Heading>
                  <VStack spacing={3} align="start">
                    <HStack>
                      <Badge colorScheme="green" p={2} borderRadius="md" variant="solid" minW="80px" textAlign="center">
                        <Icon as={CheckCircleIcon} mr={1}/> VERT
                      </Badge>
                      <Text fontSize="sm">L'attribut est <b>exactement</b> le même.</Text>
                    </HStack>

                    <HStack>
                      <Badge colorScheme="orange" p={2} borderRadius="md" variant="solid" minW="80px" textAlign="center">
                        <Icon as={WarningIcon} mr={1}/> ORANGE
                      </Badge>
                      <Text fontSize="sm">
                        <b>Partiel :</b> Espèce liée (ex: Saiyan / Demi-Saiyan) ou série partagée.
                      </Text>
                    </HStack>

                    <HStack>
                      <Badge colorScheme="red" p={2} borderRadius="md" variant="solid" minW="80px" textAlign="center">
                        <Icon as={SmallCloseIcon} mr={1}/> ROUGE
                      </Badge>
                      <Text fontSize="sm">L'attribut ne correspond pas du tout.</Text>
                    </HStack>
                  </VStack>
                </Box>

                <Box>
                  <Heading size="sm" color="blue.300" mb={3} textTransform="uppercase">Indices Fléchés</Heading>
                  <Text fontSize="sm" mb={2} color="whiteAlpha.800">
                    Pour la <b>Taille</b> et la <b>Première Apparition</b> :
                  </Text>
                  <HStack spacing={4} bg="whiteAlpha.100" p={3} borderRadius="md">
                    <HStack>
                      <Icon as={ArrowUpIcon} color="red.400" w={6} h={6} />
                      <Text fontSize="xs">Le personnage est <b>plus grand</b> ou apparait <b>plus tard</b>.</Text>
                    </HStack>
                    <HStack>
                      <Icon as={ArrowDownIcon} color="cyan.400" w={6} h={6} />
                      <Text fontSize="xs">Le personnage est <b>plus petit</b> ou apparait <b>plus tôt</b>.</Text>
                    </HStack>
                  </HStack>
                </Box>

              </VStack>
            </ModalBody>

            <ModalFooter bg="whiteAlpha.100" justifyContent="center">
              <Button colorScheme="orange" onClick={onHelpClose} width="100%">
                C'EST PARTI !
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </Flex>
    </Box>
  );
}

export default Header;