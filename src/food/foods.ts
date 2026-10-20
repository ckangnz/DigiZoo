export type FoodId =
  | 'meat'
  | 'fish'
  | 'shrimp'
  | 'bugs'
  | 'carrot'
  | 'apple'
  | 'banana'
  | 'hay'
  | 'leaves'
  | 'seeds'
  | 'flowers'
  | 'honey'
  | 'cheese'
  | 'candy';

export const FOOD_IDS: FoodId[] = [
  'meat',
  'fish',
  'shrimp',
  'bugs',
  'carrot',
  'apple',
  'banana',
  'hay',
  'leaves',
  'seeds',
  'flowers',
  'honey',
  'cheese',
  'candy',
];

export const FOOD_NAMES: Record<FoodId, string> = {
  meat: 'Meat',
  fish: 'Fish',
  shrimp: 'Shrimp',
  bugs: 'Bugs',
  carrot: 'Carrot',
  apple: 'Apple',
  banana: 'Banana',
  hay: 'Hay',
  leaves: 'Leaves',
  seeds: 'Seeds',
  flowers: 'Flowers',
  honey: 'Honey',
  cheese: 'Cheese',
  candy: 'Candy',
};
