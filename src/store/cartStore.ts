import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    id: string;
    brand: string;
    name: string;
    size: string;
    price: number;
    imageUrl: string;
    selected: boolean;
}

interface CartState {
    cartItems: CartItem[];
    addItem: (item: Omit<CartItem, 'selected'>) => void;
    removeItem: (id: string) => void;
    removeSelectedItems: () => void;
    toggleSelect: (id: string) => void;
    toggleSelectAll: () => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            cartItems: [
                {
                    id: '1',
                    brand: 'Nike',
                    name: 'Nike Air Jordan 1 Retro High OG Chicago',
                    size: '270',
                    price: 450000,
                    imageUrl: 'https://placehold.co/400x400/png?text=Jordan+1+Chicago',
                    selected: true
                },
                {
                    id: '2',
                    brand: 'Supreme',
                    name: 'Supreme Box Logo Hoodie Black',
                    size: 'L',
                    price: 850000,
                    imageUrl: 'https://placehold.co/400x400/png?text=Supreme+Box+Logo',
                    selected: true
                },
            ],
            addItem: (item) => set((state) => ({
                cartItems: [...state.cartItems, { ...item, selected: true }]
            })),
            removeItem: (id) => set((state) => ({
                cartItems: state.cartItems.filter((i) => i.id !== id)
            })),
            removeSelectedItems: () => set((state) => ({
                cartItems: state.cartItems.filter((i) => !i.selected)
            })),
            toggleSelect: (id) => set((state) => ({
                cartItems: state.cartItems.map((i) =>
                    i.id === id ? { ...i, selected: !i.selected } : i
                )
            })),
            toggleSelectAll: () => set((state) => {
                const allSelected = state.cartItems.length > 0 && state.cartItems.every(i => i.selected);
                return {
                    cartItems: state.cartItems.map(i => ({ ...i, selected: !allSelected }))
                };
            }),
            clearCart: () => set({ cartItems: [] }),
        }),
        {
            name: 'cart-storage',
        }
    )
);
