export interface LegoSet {
  id: string;
  name: string;
  theme: 'Star Wars' | 'Technic' | 'Marvel' | 'Ninjago' | 'Icons' | 'Hot Sellers';
  price: number;
  pieces: number;
  rating: number;
  image: string;
  description: string;
  age: string;
  releaseYear: number;
  features: string[];
  specifications: {
    dimensions: string;
    itemNumber: string;
    insiderPoints: number;
  };
  reviews: {
    author: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export interface CartItem {
  set: LegoSet;
  quantity: number;
}
