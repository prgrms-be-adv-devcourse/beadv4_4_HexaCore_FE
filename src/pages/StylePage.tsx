import { Heart, MessageCircle, ShoppingCart, Shirt } from 'lucide-react';

const STYLE_POSTS = [
    {
        id: 1,
        user: { name: 'hype_beast_99', avatar: 'https://placehold.co/100x100/png?text=User1' },
        imageUrl: 'https://placehold.co/800x1000/F9F9F9/333?text=Nike+Air+Jordan+1',
        content: '드디어 구한 조던 1 시카고! 실물 깡패네요 🔥 #jordan #chicago #streetstyle',
        likes: 1240,
        comments: 42,
        taggedProducts: ['Nike Air Jordan 1 Chicago']
    },
    {
        id: 2,
        user: { name: 'fashion_killa', avatar: 'https://placehold.co/100x100/png?text=User2' },
        imageUrl: 'https://placehold.co/800x1000/F9F9F9/333?text=Nike+Dunk+Low',
        content: '오늘의 출근룩. 덩크는 역시 범고래가 국룰이죠 🐼 #dailylook #nike #dunk',
        likes: 850,
        comments: 28,
        taggedProducts: ['Nike Dunk Low Panda']
    },
    {
        id: 3,
        user: { name: 'minimal_life', avatar: 'https://placehold.co/100x100/png?text=User3' },
        imageUrl: 'https://placehold.co/800x1000/F9F9F9/333?text=New+Balance+992',
        content: '깔끔한 무채색 코디에 포인트로 딱입니다 👍 #newbalance #992 #ootd',
        likes: 2100,
        comments: 65,
        taggedProducts: ['New Balance 992 Gray']
    },
    {
        id: 4,
        user: { name: 'retro_vibes', avatar: 'https://placehold.co/100x100/png?text=User4' },
        imageUrl: 'https://placehold.co/800x1000/F9F9F9/333?text=Adidas+Samba',
        content: '빈티지한 무드 가득한 오늘. 가을엔 역쉬 아디다스죠. #adidas #samba #vintage',
        likes: 1530,
        comments: 31,
        taggedProducts: ['Adidas Samba OG White']
    },
    {
        id: 5,
        user: { name: 'street_master', avatar: 'https://placehold.co/100x100/png?text=User5' },
        imageUrl: 'https://placehold.co/800x1000/F9F9F9/333?text=Supreme+Hoodie',
        content: '슈프림과의 조합은 언제나 옳다. #supreme #streetwear #style',
        likes: 3200,
        comments: 110,
        taggedProducts: ['Supreme Box Logo Hoodie']
    },
    {
        id: 6,
        user: { name: 'daily_sneakers', avatar: 'https://placehold.co/100x100/png?text=User6' },
        imageUrl: 'https://placehold.co/800x1000/F9F9F9/333?text=Nike+Dunk+Low',
        content: '나이키 공홈 선착 성공! 영롱한 초록색 실루엣이 너무 예쁘네요.',
        likes: 920,
        comments: 15,
        taggedProducts: ['Nike Dunk Low Spartan Green']
    }
];

export const StylePage = () => {
    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 px-6 lg:px-10 font-pretendard">
            <div className="max-w-[1200px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <Shirt size={28} strokeWidth={2.5} className="text-[#333]" />
                        <h2 className="text-3xl font-black text-[#333] tracking-tight">STYLE</h2>
                    </div>
                    <p className="text-gray-400 font-medium ml-[40px]">트렌디한 스타일링을 확인해보세요</p>
                </div>

                {/* Filter / Tabs */}
                <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {['인기', '최신', '팔로잉', '스니커즈', '의류'].map((tab, idx) => (
                        <button
                            key={idx}
                            className={`px-6 py-2 rounded-full text-sm font-bold border border-solid transition-all whitespace-nowrap
                                ${idx === 0 ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Style Grid (Instagram Style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {STYLE_POSTS.map((post) => (
                        <div key={post.id} className="group bg-white rounded-3xl overflow-hidden border border-solid border-gray-100 shadow-sm transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                            {/* User Profile */}
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-solid border-gray-100 p-0.5 overflow-hidden">
                                        <img src={post.user.avatar} alt={post.user.name} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <span className="text-sm font-bold text-[#333]">{post.user.name}</span>
                                </div>
                                <button className="text-accent text-xs font-bold hover:underline">팔로우</button>
                            </div>

                            {/* Main Image */}
                            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                                <img
                                    src={post.imageUrl}
                                    alt="style post"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {/* Tag Overlay Hint */}
                                <div className="absolute bottom-4 left-4">
                                    <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-white border border-white/20">
                                        <ShoppingCart size={14} />
                                        <span className="text-[10px] font-bold tracking-tight">상품 정보</span>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                    <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg text-[#333]">
                                        <Heart size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Content & Stats */}
                            <div className="p-5">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1.5 cursor-pointer">
                                        <Heart size={20} className="text-[#333] hover:text-red-500 hover:fill-red-500 transition-all" />
                                        <span className="text-xs font-bold text-[#333]">{post.likes.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 cursor-pointer">
                                        <MessageCircle size={20} className="text-[#333]" />
                                        <span className="text-xs font-bold text-[#333]">{post.comments}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-[#555] leading-relaxed line-clamp-2">
                                    <span className="font-bold text-[#333] mr-2">{post.user.name}</span>
                                    {post.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


