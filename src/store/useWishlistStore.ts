import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
    wishlistIds: string[];
    toggleWishlist: (productId: string) => void;
    isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            wishlistIds: [],
            toggleWishlist: (productId: string) => {
                const currentIds = get().wishlistIds;
                const isExist = currentIds.includes(productId);

                if (isExist) {
                    set({ wishlistIds: currentIds.filter((id) => id !== productId) });
                } else {
                    set({ wishlistIds: [...currentIds, productId] });
                }
            },
            isWishlisted: (productId: string) => {
                return get().wishlistIds.includes(productId);
            },
        }),
        {
            name: 'wishlist-storage', // LocalStorage Key
        }
    )
);
