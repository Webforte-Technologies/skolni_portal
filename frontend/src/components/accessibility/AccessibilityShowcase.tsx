import React, { useState } from 'react';
import { AccessibleButton } from './AccessibleButton';
import { AccessibleInput } from './AccessibleInput';
import { KeyboardNavigationWrapper, NavigableItem } from './KeyboardNavigationWrapper';
import { FocusManager } from './FocusManager';
import { ResponsiveAriaLive } from './ResponsiveAriaLive';
import { useAccessibilityContext } from './AccessibilityProvider';

const AccessibilityShowcase: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const { isMobile, isTablet, keyboardNavigation, announce } = useAccessibilityContext();

  const menuItems = [
    'Matematický asistent',
    'Český jazyk',
    'Přírodní vědy',
    'Historie',
    'Zeměpis',
  ];

  const handleButtonClick = () => {
    setAnnouncement('Tlačítko bylo aktivováno');
    announce('Ukázkové tlačítko bylo stisknuto', 'polite');
  };

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    announce('Dialog byl zavřen', 'polite');
  };

  const handleItemSelect = (index: number) => {
    setSelectedItem(index);
    setAnnouncement(`Vybrána položka: ${menuItems[index]}`);
    announce(`Vybrána položka: ${menuItems[index]}`, 'polite');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Ukázka přístupnostních funkcí
        </h1>

        {/* Device and accessibility status */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Stav přístupnosti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Zařízení:</strong> {isMobile ? 'Mobil' : isTablet ? 'Tablet' : 'Desktop'}
            </div>
            <div>
              <strong>Klávesová navigace:</strong> {keyboardNavigation ? 'Aktivní' : 'Neaktivní'}
            </div>
          </div>
        </div>

        {/* Accessible Buttons */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Přístupná tlačítka</h2>
          <div className="flex flex-wrap gap-4">
            <AccessibleButton
              variant="primary"
              size="md"
              onClick={handleButtonClick}
              responsiveAriaLabel={{
                mobile: 'Stisknout pro ukázku na mobilu',
                tablet: 'Stisknout pro ukázku na tabletu',
                desktop: 'Stisknout pro ukázku na desktopu',
              }}
            >
              Ukázkové tlačítko
            </AccessibleButton>

            <AccessibleButton
              variant="outline"
              size="md"
              onClick={handleModalOpen}
              responsiveAriaLabel={{
                mobile: 'Otevřít dialog na mobilu',
                tablet: 'Otevřít dialog na tabletu',
                desktop: 'Otevřít dialog na desktopu',
              }}
            >
              Otevřít dialog
            </AccessibleButton>

            <AccessibleButton
              variant="secondary"
              size="sm"
              disabled
            >
              Zakázané tlačítko
            </AccessibleButton>
          </div>
        </section>

        {/* Accessible Inputs */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Přístupné formulářové prvky</h2>
          <div className="space-y-4 max-w-md">
            <AccessibleInput
              label="Jméno"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Zadejte své jméno"
              required
              responsiveLabel={{
                mobile: 'Vaše jméno (mobil)',
                tablet: 'Vaše jméno (tablet)',
                desktop: 'Vaše jméno (desktop)',
              }}
            />

            <AccessibleInput
              label="Email"
              type="email"
              placeholder="vas@email.cz"
              helperText="Použijeme pro zasílání oznámení"
            />

            <AccessibleInput
              label="Heslo"
              type="password"
              error="Heslo musí mít alespoň 8 znaků"
            />
          </div>
        </section>

        {/* Keyboard Navigation */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Klávesová navigace</h2>
          <p className="text-sm text-gray-600 mb-4">
            {isMobile 
              ? 'Na mobilu použijte gesta pro navigaci mezi položkami'
              : 'Použijte šipky pro navigaci, Enter pro výběr, Home/End pro první/poslední položku'
            }
          </p>
          
          <KeyboardNavigationWrapper
            orientation="vertical"
            circular={true}
            onActivate={handleItemSelect}
            className="max-w-md border border-gray-200 rounded-lg p-2"
            ariaLabel="Seznam asistentů"
          >
            {menuItems.map((item, index) => (
              <NavigableItem
                key={index}
                onActivate={() => handleItemSelect(index)}
                className={selectedItem === index ? 'bg-blue-100' : ''}
              >
                <div className="flex items-center">
                  <span className="flex-1">{item}</span>
                  {selectedItem === index && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </NavigableItem>
            ))}
          </KeyboardNavigationWrapper>
        </section>

        {/* Live Announcements */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Živá oznámení</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Poslední oznámení:</p>
              <p className="font-medium">{announcement || 'Žádné oznámení'}</p>
            </div>
            
            <ResponsiveAriaLive
              message={announcement}
              priority="polite"
              clearAfter={5000}
            />
          </div>
        </section>
      </div>

      {/* Modal Example */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <FocusManager
            trapFocus={true}
            restoreFocus={true}
            autoFocus={true}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Ukázkový dialog</h3>
            <p className="text-gray-600 mb-6">
              Tento dialog demonstruje správné zacházení s fokusem a klávesovou navigací.
            </p>
            
            <div className="flex justify-end space-x-3">
              <AccessibleButton
                variant="outline"
                onClick={handleModalClose}
                responsiveAriaLabel={{
                  mobile: 'Zavřít dialog na mobilu',
                  tablet: 'Zavřít dialog na tabletu', 
                  desktop: 'Zavřít dialog na desktopu',
                }}
              >
                Zavřít
              </AccessibleButton>
              
              <AccessibleButton
                variant="primary"
                onClick={handleModalClose}
              >
                Potvrdit
              </AccessibleButton>
            </div>
          </FocusManager>
        </div>
      )}
    </div>
  );
};

export default AccessibilityShowcase;