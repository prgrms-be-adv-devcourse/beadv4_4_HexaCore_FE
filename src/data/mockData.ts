export interface Product {
    id: string;
    brand: string;
    name: string;
    price: number;
    imageUrl: string;
    tags?: string[];
}

export const SHOP_PRODUCTS: Product[] = [
    { id: '1', brand: 'Nike', name: 'Nike Air Force 1 \'07 White', price: 139000, imageUrl: 'https://placehold.co/400x400/png?text=Air+Force+1' },
    { id: '2', brand: 'Adidas', name: 'Adidas Samba OG Cloud White', price: 150000, imageUrl: 'https://placehold.co/400x400/png?text=Samba' },
    { id: '3', brand: 'Supreme', name: 'Supreme Box Logo Hoodie', price: 500000, imageUrl: 'https://placehold.co/400x400/png?text=Supreme' },
    { id: '4', brand: 'New Balance', name: 'New Balance 530 Steel Grey', price: 129000, imageUrl: 'https://placehold.co/400x400/png?text=NB+530' },
    { id: '5', brand: 'Nike', name: 'Nike Dunk Low Retro Black White', price: 129000, imageUrl: 'https://placehold.co/400x400/png?text=Dunk+Low' },
    { id: '6', brand: 'Jordan', name: 'Jordan 1 Retro High OG', price: 239000, imageUrl: 'https://placehold.co/400x400/png?text=Jordan+1' },
    { id: '7', brand: 'Stussy', name: 'Stussy World Tour Tee', price: 68000, imageUrl: 'https://placehold.co/400x400/png?text=Stussy' },
    { id: '8', brand: 'Apple', name: 'AirPods Max Silver', price: 769000, imageUrl: 'https://placehold.co/400x400/png?text=AirPods' },
];
