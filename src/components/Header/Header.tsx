import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { QuestionMarkCircledIcon, Cross2Icon } from '@radix-ui/react-icons';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo-container">
        <img 
          src="/images/star-ball-1.png" 
          alt="Dragon Ball" 
          className="dragon-ball-icon" 
        />
        <h1 className="title">DragonBalldle</h1>
      </div>
      
      <NavigationMenu.Root className="navigation">
        <NavigationMenu.List className="nav-list">
          <NavigationMenu.Item>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="help-button" aria-label="Comment jouer">
                  <QuestionMarkCircledIcon />
                  <span>Comment jouer</span>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content">
                  <Dialog.Title className="dialog-title">Comment jouer à DragonBalldle</Dialog.Title>
                  <Dialog.Description className="dialog-description">
                    <p>Devine le personnage de Dragon Ball en X essais maximum.</p>
                    <p>Après chaque essai, les indices de couleur t'indiqueront si tu te rapproches.</p>
                    <p>• Vert : L'attribut est correct</p>
                    <p>• Jaune : L'attribut est proche</p>
                    <p>• Rouge : L'attribut est incorrect</p>
                  </Dialog.Description>
                  <Dialog.Close asChild>
                    <button className="dialog-close-button" aria-label="Fermer">
                      <Cross2Icon />
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </NavigationMenu.Item>
          
          <NavigationMenu.Item>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="stats-button" aria-label="Statistiques">
                  <span>Statistiques</span>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="dialog-overlay" />
                <Dialog.Content className="dialog-content">
                  <Dialog.Title className="dialog-title">Statistiques</Dialog.Title>
                  <Dialog.Description className="dialog-description">
                    <p>Parties jouées: 0</p>
                    <p>Parties gagnées: 0</p>
                    <p>% de victoires: 0%</p>
                  </Dialog.Description>
                  <Dialog.Close asChild>
                    <button className="dialog-close-button" aria-label="Fermer">
                      <Cross2Icon />
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </header>
  );
}

export default Header;