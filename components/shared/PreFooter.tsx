import React from 'react'
import { 
    Headphones, 
    Award, 
    RotateCcw, 
    PackageCheck, 
    CreditCard, 
    ShieldCheck
} from 'lucide-react'

const PreFooter = () => {
    return (
        <section className="w-full bg-[#0d2238] border-t border-slate-800 text-white font-body">
            <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10">
                    
                    {/* Column 1 */}
                    <div className="flex flex-col gap-10">
                        {/* Helpline Number */}
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                <Headphones className="w-9 h-9 text-slate-300 flex-shrink-0" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-white text-[15px] tracking-wide">Helpline Number</h3>
                                <p className="text-slate-300 text-sm mt-1">Call: <a href="tel:+918530090303" className="hover:text-blue-400 transition-colors font-medium">+91 85300 90303</a></p>
                                <p className="text-slate-300 text-sm mt-0.5">Email: <a href="mailto:hello@mtwo.in" className="hover:text-blue-400 transition-colors font-medium">hello@mtwo.in</a></p>
                                <p className="text-slate-400 text-xs mt-1.5 font-medium">(Mon-Sun: 9am-8pm)</p>
                            </div>
                        </div>

                        {/* 100% ORIGINAL */}
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                <Award className="w-9 h-9 text-slate-300 flex-shrink-0" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-white text-[15px] tracking-wide uppercase">100% ORIGINAL</h3>
                                <p className="text-slate-300 text-sm mt-1 leading-snug">guarantee for all products</p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col gap-10">
                        {/* Return within 7 days */}
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                <RotateCcw className="w-9 h-9 text-slate-300 flex-shrink-0" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-white text-[15px] tracking-wide">Return within 7 days</h3>
                                <p className="text-slate-300 text-sm mt-1 leading-snug">of receiving your order</p>
                            </div>
                        </div>

                        {/* Complete products */}
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                <PackageCheck className="w-9 h-9 text-slate-300 flex-shrink-0" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-white text-[15px] tracking-wide">Complete products</h3>
                                <p className="text-slate-300 text-sm mt-1 leading-snug">20,00,000+ products from 12,000+ Brands</p>
                            </div>
                        </div>
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-col gap-10">
                        {/* 100% Safe & Secure Payments */}
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                <CreditCard className="w-9 h-9 text-slate-300 flex-shrink-0" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-white text-[15px] tracking-wide">100% Safe & Secure Payments</h3>
                                <p className="text-slate-300 text-sm mt-1 leading-snug">Pay using secure payment methods</p>
                            </div>
                        </div>

                        {/* Buyer Protection */}
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                <ShieldCheck className="w-9 h-9 text-slate-300 flex-shrink-0" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-white text-[15px] tracking-wide">Buyer Protection</h3>
                                <p className="text-slate-300 text-sm mt-1 leading-snug">Committed to buyer interests to provide a smooth shopping experience.</p>
                            </div>
                        </div>
                    </div>

                    {/* Column 4 */}
                    <div className="flex flex-col gap-10">
                        {/* Experience MTWO App */}
                        <div className="flex flex-col gap-3">
                            <h3 className="font-bold text-white text-[15px] tracking-wide">Experience MTWO App</h3>
                            <div className="flex flex-row items-center gap-2.5 sm:gap-3">
                                <a 
                                    href="#" 
                                    className="flex items-center gap-2 bg-black border border-slate-700 hover:border-slate-500 rounded px-2.5 py-1.5 transition-all duration-200"
                                    aria-label="Get it on Google Play"
                                >
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M5 3.5v17l13.5-8.5L5 3.5z" />
                                    </svg>
                                    <div className="text-left leading-none">
                                        <span className="text-[9px] text-slate-400 block font-medium uppercase tracking-tight">GET IT ON</span>
                                        <span className="text-xs font-semibold text-white block mt-0.5">Google Play</span>
                                    </div>
                                </a>
                                <a 
                                    href="#" 
                                    className="flex items-center gap-2 bg-black border border-slate-700 hover:border-slate-500 rounded px-2.5 py-1.5 transition-all duration-200"
                                    aria-label="Download on the App Store"
                                >
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39" />
                                    </svg>
                                    <div className="text-left leading-none">
                                        <span className="text-[9px] text-slate-400 block font-medium tracking-tight">Download on the</span>
                                        <span className="text-xs font-semibold text-white block mt-0.5">App Store</span>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Follow us on */}
                        <div className="flex flex-col gap-3">
                            <h3 className="font-bold text-white text-[15px] tracking-wide">Follow us on</h3>
                            <div className="flex items-center gap-4 text-slate-400">
                                <a href="#" className="hover:text-white transition-colors duration-200" aria-label="Facebook">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                    </svg>
                                </a>
                                <a href="#" className="hover:text-white transition-colors duration-200" aria-label="Twitter">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                                    </svg>
                                </a>
                                <a href="#" className="hover:text-white transition-colors duration-200" aria-label="Instagram">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                    </svg>
                                </a>
                                <a href="#" className="hover:text-white transition-colors duration-200" aria-label="Pinterest">
                                    {/* Pinterest is not always in older lucide versions, so we use a clean SVG to prevent import errors */}
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.27 2.68 7.91 6.46 9.39-.09-.8-.17-2.02.03-2.89.19-.8 1.21-5.12 1.21-5.12s-.31-.62-.31-1.54c0-1.44.84-2.52 1.88-2.52.88 0 1.31.66 1.31 1.46 0 .89-.57 2.22-.86 3.45-.24 1.03.52 1.87 1.53 1.87 1.84 0 3.26-1.94 3.26-4.74 0-2.48-1.78-4.21-4.32-4.21-2.94 0-4.67 2.21-4.67 4.5 0 .89.34 1.85.77 2.37.08.1.1.19.07.3-.08.33-.26 1.07-.3 1.22-.05.21-.17.26-.4.15-1.48-.69-2.41-2.86-2.41-4.6 0-3.75 2.73-7.2 7.86-7.2 4.13 0 7.33 2.94 7.33 6.87 0 4.1-2.58 7.4-6.17 7.4-1.2 0-2.34-.63-2.73-1.37 0 0-.6 2.28-.74 2.84-.27 1.04-.99 2.34-1.48 3.13C9.52 21.87 10.74 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                                    </svg>
                                </a>
                                <a href="#" className="hover:text-white transition-colors duration-200" aria-label="LinkedIn">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                        <rect width="4" height="12" x="2" y="9" />
                                        <circle cx="4" cy="4" r="2" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default PreFooter