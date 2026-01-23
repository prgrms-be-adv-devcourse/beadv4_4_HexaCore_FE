export const Footer = () => {
    return (
        <footer className="bg-[#fbfbfb] border-t border-[#f0f0f0] py-16 px-6 font-pretendard">
            <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <h3 className="text-sm font-bold text-black mb-6 tracking-tight">CUSTOMER SERVICE</h3>
                    <div className="flex flex-col gap-2">
                        <p className="text-lg font-bold text-black">1588-7813</p>
                        <p className="text-sm text-gray-500 font-medium">평일 09:00 - 18:00 (토/일, 공휴일 휴무)</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-black mb-6 tracking-tight">MENU</h3>
                    <ul className="flex flex-col gap-4 list-none p-0 m-0">
                        <li><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors no-underline font-medium">About Us</a></li>
                        <li><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors no-underline font-medium">Agreement</a></li>
                        <li><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors no-underline font-medium">Privacy Policy</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-black mb-6 tracking-tight">SERVICE</h3>
                    <ul className="flex flex-col gap-4 list-none p-0 m-0">
                        <li><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors no-underline font-medium">공지사항</a></li>
                        <li><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors no-underline font-medium">이용안내</a></li>
                        <li><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors no-underline font-medium">검수기준</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto mt-16 pt-8 border-t border-[#f0f0f0] flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[13px] text-gray-400 font-medium">© 2026 RESELLO Corp. All rights reserved.</p>
                <div className="flex gap-6">
                    <span className="text-[13px] text-gray-400 cursor-pointer hover:text-gray-600">Instagram</span>
                    <span className="text-[13px] text-gray-400 cursor-pointer hover:text-gray-600">Facebook</span>
                </div>
            </div>
        </footer>
    );
};
