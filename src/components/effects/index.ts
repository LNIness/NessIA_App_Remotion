// Point d'entrée des effets visuels
// Pour ajouter un nouvel effet : créer son fichier, importer son type ici et l'ajouter à l'union Effect
import { ZoomEffect } from './zoom';

export type { ZoomEffect } from './zoom';

// Union des effets disponibles — à étendre au fur et à mesure
export type Effect = ZoomEffect;