import React, { useState, useEffect } from 'react';
import * as Form from '@radix-ui/react-form';
import * as Popover from '@radix-ui/react-popover';
import { MagnifyingGlassIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import { characters } from '../../data/GameData';
import './Game.css';

function Game() {
  const [searchValue, setSearchValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Array<{ id: number; name: string; image: string }>>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Recherche de personnage:", searchValue);
    // Logique pour vérifier si c'est le bon personnage
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
  };

  return (
    <div className="game-container">
      <div className="game-content">
        <h2 className="game-title">Trouve le personnage de Dragon Ball</h2>        
        
        <Form.Root className="search-form" onSubmit={handleSubmit}>
          <div className="search-container">
            <Form.Field className="search-field" name="search">
              <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <Popover.Anchor asChild>
                  <div className="search-input-wrapper">
                    <MagnifyingGlassIcon className="search-icon" />
                    <Form.Control asChild>
                      <input
                        className="search-input"
                        type="text" 
                        placeholder="Qui est ce personnage ?" 
                        value={searchValue}
                        onChange={handleInputChange}
                        onFocus={() => {
                          if (suggestions.length > 0) {
                            setIsPopoverOpen(true);
                          }
                        }}
                      />
                    </Form.Control>
                    {searchValue && (
                      <button 
                        type="button" 
                        className="clear-button" 
                        onClick={clearSearch}
                        aria-label="Effacer la recherche"
                      >
                        <CrossCircledIcon />
                      </button>
                    )}
                  </div>
                </Popover.Anchor>
                
                <Popover.Portal>
                  <Popover.Content className="suggestions-popover" sideOffset={5}>
                    <div className="suggestions-list">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          className="suggestion-item"
                          onClick={() => selectSuggestion(suggestion.name)}
                          type="button"
                        >
                          <div className="suggestion-content">
                            <div className="suggestion-image-container">
                              <img 
                                src={suggestion.image} 
                                alt={suggestion.name} 
                                className="suggestion-image"
                                onError={(e) => {
                                  // Image de secours en cas d'erreur
                                  (e.target as HTMLImageElement).src = "/star-ball-1.png";
                                }}
                              />
                            </div>
                            <span className="suggestion-name">{suggestion.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <Popover.Arrow className="popover-arrow" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </Form.Field>
            
            <Form.Submit asChild>
              <button className="search-button" type="submit">
                Deviner
              </button>
            </Form.Submit>
          </div>
        </Form.Root>

        <div className="previous-guesses">
          {/* Ici tu pourras afficher les essais précédents */}
        </div>
      </div>
    </div>
  );
}

export default Game;