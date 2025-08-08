import React from 'react';

interface SlashCommandsMenuProps {
  query: string;
  onSelect: (text: string) => void;
}

const COMMANDS = [
  {
    key: 'krok-za-krokem',
    label: 'Vysvětlení krok za krokem',
    text: 'Vysvětli prosím krok za krokem:'
  },
  {
    key: 'vysvetli-jako-15',
    label: 'Vysvětli jako 15letému studentovi',
    text: 'Vysvětli prosím jako by mi bylo 15 let:'
  },
  {
    key: 'kvadraticke-rovnice',
    label: 'Příklad na kvadratické rovnice (učitel)',
    text: 'Udělej mi příklad na kvadratické rovnice pro střední školu a přidej řešení.'
  },
  {
    key: 'derivace',
    label: '2 příklady na derivace (učitel)',
    text: 'Připrav dva příklady na derivace pro cvičení v hodině a uveď postup řešení.'
  },
  {
    key: 'slovni-uloha',
    label: 'Slovní úloha – procenta (učitel)',
    text: 'Vymysli slovní úlohu na procenta pro střední školu a přidej řešení.'
  },
  {
    key: 'cviceni',
    label: 'Vygeneruj 10 úloh k procvičení',
    text: 'Vygeneruj 10 krátkých úloh k procvičení na téma: '
  },
];

const SlashCommandsMenu: React.FC<SlashCommandsMenuProps> = ({ query, onSelect }) => {
  const q = query.toLowerCase();
  const filtered = COMMANDS.filter(c => c.key.includes(q) || c.label.toLowerCase().includes(q));
  return (
    <div className="absolute z-20 -top-2 translate-y-[-100%] right-2 left-auto w-[min(640px,90%)] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-floating max-h-60 overflow-auto">
      {filtered.length === 0 ? (
        <div className="px-3 py-2 text-sm text-neutral-500">Žádné příkazy</div>
      ) : (
        filtered.map(cmd => (
          <button
            key={cmd.key}
            className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
            onClick={() => onSelect(cmd.text)}
          >
            <span className="font-medium text-neutral-900 dark:text-neutral-100">/{cmd.key}</span>
            <span className="ml-2 text-neutral-500">{cmd.label}</span>
          </button>
        ))
      )}
    </div>
  );
};

export default SlashCommandsMenu;


