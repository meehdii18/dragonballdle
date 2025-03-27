import React from 'react';
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
  Text,
} from '@chakra-ui/react';
import { QuestionIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react';

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
  const { isOpen: isStatsOpen, onOpen: onStatsOpen, onClose: onStatsClose } = useDisclosure();

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
      py={4}
      px={8}
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.2)"
      borderBottomWidth="3px"
      borderBottomColor="orange.700"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
    >
      <Flex alignItems="center" gap={3}>
        <Image
          src="/images/star-ball-1.png"
          alt="Dragon Ball"
          boxSize="40px"
          animation={`${float} 3s ease-in-out infinite`}
          _hover={{
            animation: `${spin} 1s ease-in-out`
          }}
        />
        <Heading 
          as="h1" 
          size="xl" 
          fontFamily="Saiyan-Sans"
          fontSize="3rem"
          m={0}
          color="dragonball.300"
          textShadow="2px 2px 4px rgba(0, 0, 0, 0.3)"
          letterSpacing="1px"
        >
          DragonBalldle
        </Heading>
      </Flex>

      <Flex gap={4}>
        <Button 
          leftIcon={<QuestionIcon />}
          onClick={onHelpOpen}
          variant="ghost"
          _hover={{ bg: 'whiteAlpha.300' }} 
          aria-label="Comment jouer"
        >
          Comment jouer
        </Button>

        <Button 
          onClick={onStatsOpen}
          variant="ghost"
          _hover={{ bg: 'whiteAlpha.300' }}
          aria-label="Statistiques"
        >
          Statistiques
        </Button>

        {/* Modal pour les règles du jeu */}
        <Modal isOpen={isHelpOpen} onClose={onHelpClose} isCentered>
          <ModalOverlay backdropFilter="blur(8px)" />
          <ModalContent>
            <ModalHeader color="orange.700">Comment jouer à DragonBalldle</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Text>Devine le personnage de Dragon Ball en X essais maximum.</Text>
              <Text>Après chaque essai, les indices de couleur t'indiqueront si tu te rapproches.</Text>
              <Text>• <Box as="span" color="green.500">Vert</Box> : L'attribut est correct</Text>
              <Text>• <Box as="span" color="yellow.500">Jaune</Box> : L'attribut est proche</Text>
              <Text>• <Box as="span" color="red.500">Rouge</Box> : L'attribut est incorrect</Text>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal pour les statistiques */}
        <Modal isOpen={isStatsOpen} onClose={onStatsClose} isCentered>
          <ModalOverlay backdropFilter="blur(8px)" />
          <ModalContent>
            <ModalHeader color="orange.700">Statistiques</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Text>Parties jouées: 0</Text>
              <Text>Parties gagnées: 0</Text>
              <Text>% de victoires: 0%</Text>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>
    </Box>
  );
}

export default Header;