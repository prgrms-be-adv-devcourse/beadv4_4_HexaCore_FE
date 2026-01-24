export interface Product {
    id: string;
    brand: string;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
    sizeIds?: { [size: string]: number };
    code: string;
    releasePrice: number;
    releaseDate: string;
    images?: string[];
}

export const SHOP_PRODUCTS: Product[] = [
    {
        id: '100',
        brand: 'Nike',
        name: 'Jordan 1 Retro High OG Chicago',
        category: 'Sneakers',
        price: 209000,
        code: 'JD-101-CHI',
        releasePrice: 209000,
        releaseDate: '2022/11/11',
        sizeIds: {
            '230': 100, '240': 101, '250': 102, '260': 103, '270': 104, '280': 105, '290': 106
        },
        imageUrl: 'https://dummyimage.com/600x400/000/fff&text=Jordan1',
        images: ['https://dummyimage.com/600x400/000/fff&text=Jordan1']
    },
    {
        id: '200',
        brand: 'Adidas',
        name: 'Yeezy Boost 350 V2 Zebra',
        category: 'Sneakers',
        price: 259000,
        code: 'CP9654',
        releasePrice: 259000,
        releaseDate: '2017/02/25',
        sizeIds: {
            '230': 200, '240': 201, '250': 202, '260': 203, '270': 204, '280': 205, '290': 206
        },
        imageUrl: 'https://dummyimage.com/600x400/fff/000&text=Yeezy',
        images: ['https://dummyimage.com/600x400/fff/000&text=Yeezy']
    },
    {
        id: '300',
        brand: 'New Balance',
        name: '992 Made in USA Grey',
        category: 'Sneakers',
        price: 259000,
        code: 'M992GR',
        releasePrice: 259000,
        releaseDate: '2020/01/01',
        sizeIds: {
            '230': 300, '240': 301, '250': 302, '260': 303, '270': 304, '280': 305, '290': 306
        },
        imageUrl: 'https://dummyimage.com/600x400/cccccc/000&text=NB+992'
    }
];
