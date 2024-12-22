// frontend/src/types/pokemon.ts

export interface Pokemon {
    name: string;
    number: number;
    type_one: string;
    type_two: string;
    description: string;
    selected: boolean;
    total: number,
    hit_points: number,
    attack: number,
    defense: number,
    special_attack: number,
    special_defense: number,
    speed: number,
    generation: number,
    legendary: boolean,
    imageUrl: string,
    isToggling?: boolean;
  }

  export enum Order {
    Asc = "asc",
    Desc = "desc",
  }