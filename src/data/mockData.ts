export interface Product {
    id: string;
    brand: string;
    name: string;
    price: number;
    imageUrl: string;
    sizeIds?: { [size: string]: number }; // 사이즈별 마켓 모듈 PK 매핑
    code: string;           // 모델 번호
    releasePrice: number;   // 발매가
    releaseDate: string;    // 발매일
    images?: string[];
    tags?: string[];
}

export const SHOP_PRODUCTS: Product[] = [
    {
        id: '100',
        brand: 'Nike',
        name: 'Jordan 1 Retro High OG Chicago',
        price: 209000,
        code: 'JD-101-CHI',
        releasePrice: 199000,
        releaseDate: '2022/11/11',
        sizeIds: {
            '230': 100, '240': 101, '250': 102, '260': 103, '270': 100, '280': 101, '290': 106
        },
        imageUrl: 'https://dummyimage.com/600x400/000/fff&text=Jordan1',
        images: ['https://dummyimage.com/600x400/000/fff&text=Jordan1']
    },
    {
        id: '200',
        brand: 'Adidas',
        name: 'Yeezy Boost 350 V2 Zebra',
        price: 289000,
        code: 'CP9654',
        releasePrice: 289000,
        releaseDate: '2017/02/25',
        sizeIds: {
            '230': 200, '240': 201, '250': 202, '260': 200, '270': 204, '280': 205, '290': 206
        },
        imageUrl: 'https://dummyimage.com/600x400/000/fff&text=Yeezy',
        images: ['https://dummyimage.com/600x400/000/fff&text=Yeezy']
    },
    {
        id: '4', brand: 'New Balance', name: 'New Balance 530 Steel Grey', price: 129000, code: 'MR530KA',
        releasePrice: 129000, releaseDate: '2020/01/01', imageUrl: 'https://placehold.co/400x400/png?text=NB+530',
        sizeIds: { '230': 400, '240': 401, '250': 402, '260': 403, '270': 404, '280': 405, '290': 406 }
    },
    {
        id: '5', brand: 'Nike', name: 'Nike Dunk Low Retro Black White', price: 129000, code: 'DD1391-100',
        releasePrice: 129000, releaseDate: '2021/01/14', imageUrl: 'https://placehold.co/400x400/png?text=Dunk+Low',
        sizeIds: { '230': 500, '240': 501, '250': 502, '260': 503, '270': 504, '280': 505, '290': 506 }
    },
    {
        id: '6', brand: 'Jordan', name: 'Jordan 1 Retro High OG', price: 239000, code: '555088-063',
        releasePrice: 209000, releaseDate: '2022/01/01', imageUrl: 'https://placehold.co/400x400/png?text=Jordan+1',
        sizeIds: { '230': 600, '240': 601, '250': 602, '260': 603, '270': 604, '280': 605, '290': 606 }
    },
    {
        id: '7', brand: 'Stussy', name: 'Stussy World Tour Tee', price: 68000, code: 'ST-WT-001',
        releasePrice: 65000, releaseDate: '2023/05/20', imageUrl: 'https://placehold.co/400x400/png?text=Stussy',
        sizeIds: { 'S': 700, 'M': 701, 'L': 702, 'XL': 703 }
    },
    {
        id: '8', brand: 'Apple', name: 'AirPods Max Silver', price: 769000, code: 'MGYJ3KH/A',
        releasePrice: 719000, releaseDate: '2020/12/15', imageUrl: 'https://placehold.co/400x400/png?text=AirPods',
        sizeIds: { 'OneSize': 800 }
    },
];
