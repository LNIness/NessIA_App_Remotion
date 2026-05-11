// Registre central de toutes les transitions disponibles
// Pour ajouter une transition : créer son fichier, l'importer ici et l'ajouter à MyTransitions
import { whiteFade } from './fade';
import { swipeLeft, swipeRight, swipeUp, swipeDown } from './slide';

export const MyTransitions = {
  whiteFade,
  swipeLeft,
  swipeRight,
  swipeUp,
  swipeDown,
};

// Type automatiquement dérivé des clés de MyTransitions
// Utilisé pour valider le champ "type" dans le contrat JSON
export type TransitionType = keyof typeof MyTransitions;