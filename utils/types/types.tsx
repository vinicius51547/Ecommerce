export interface Category {
    id: number;
    category_name: string;
  }
  
  export interface Product {
    id: number;
    uuid: string;
    name: string;
    info: string;
    price: number;
    image_url: string;
    category_id: number;
  }
  