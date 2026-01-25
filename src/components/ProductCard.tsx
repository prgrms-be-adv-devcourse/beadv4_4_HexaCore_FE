import { useWishlistStore } from '../store/useWishlistStore';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
    id: string;
    brand: string;
    name: string;
    price: number | null;
    imageUrl: string;
}

export const ProductCard = ({ id, brand, name, price, imageUrl }: ProductCardProps) => {
    const { toggleWishlist, wishlistIds } = useWishlistStore();
    const isLiked = wishlistIds.includes(id);

    const handleToggleLike = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation(); // Prevent bubbling
        toggleWishlist(id);
    };

    return (
        <Link to={`/products/${id}`} className="block w-[250px] no-underline text-inherit mx-auto group">
            <div className="flex flex-col gap-3 cursor-pointer bg-transparent">
                <div className="relative w-full aspect-square bg-[#f6f6f6] rounded-xl overflow-hidden font-pretendard">
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-contain transition-transform duration-300 ease-in-out mix-blend-multiply group-hover:scale-105"
                    />
                    <button
                        className={`absolute top-2.5 right-2.5 bg-white border-none w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-all duration-200 ease-in-out z-10
                            ${isLiked ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5 group-hover:opacity-100 group-hover:translate-y-0'}`}
                        onClick={handleToggleLike}
                    >
                        <Heart
                            size={18}
                            color={isLiked ? "#ef6253" : "#333"}
                            fill={isLiked ? "#ef6253" : "none"}
                            className="transition-colors duration-200"
                        />
                    </button>
                </div>
                <div className="flex flex-col">
                    <h4 className="text-[16.3px] font-bold text-[#333] mb-1 underline decoration-transparent font-pretendard">{brand}</h4>
                    <p className="text-[17px] text-[#333] leading-[1.4] mb-2 whitespace-nowrap overflow-hidden text-ellipsis block h-auto font-pretendard">{name}</p>
                    <div className="mt-auto flex flex-col font-pretendard">
                        <span className="text-[13px] text-[#888] mb-0.5">즉시 구매가</span>
                        <span className="text-[16.5px] font-bold text-[#333]">
                            {price !== null ? `${price.toLocaleString()}원` : '입찰 문의'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};
