export interface CardType {
  id: string;
  value: number; // -2 to 12
  isVisible: boolean;
  isRevealed: boolean; // for the open card in the middle
  position: number; // 0-11 for grid position
  isRemoved?: boolean; // for cards removed due to three of a kind
}

export interface Player {
  id: string;
  name: string;
  cards: CardType[];
  isCurrentPlayer: boolean;
  score: number;
  totalScore: number;
  hasFinished: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: CardType[];
  openCard: CardType | null;
  gamePhase: 'initial' | 'playing' | 'round_finished' | 'game_finished';
  round: number;
  gameEndedBy: string | null;
  lastTurn: boolean;
  revealedCard: CardType | null;
  actionPhase: 'choose' | 'swap' | 'reveal' | 'choose_revealed';
  selectedCardIndex: number | null;
}

export interface GameAction {
  type: 'START_GAME' | 'REVEAL_CARDS' | 'PICK_OPEN_CARD' | 'PICK_REVEALED_CARD' | 'REJECT_REVEALED_CARD' | 'SWAP_CARD' | 'REVEAL_OWN_CARD' | 'REVEAL_FROM_DECK' | 'END_TURN' | 'END_ROUND' | 'START_NEW_ROUND' | 'END_GAME';
  payload?: any;
} 