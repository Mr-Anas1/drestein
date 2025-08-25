import Footer from '@/components/Footer'
import Header from '@/components/Header'
import React from 'react'
import Link from 'next/link'
import { DEPARTMENTS } from '@/constants/departments'
import { ArrowRight } from 'lucide-react'

const page = () => {
    return (
        <div className='min-h-screen overflow-x-hidden w-screen bg-gradient-to-br from-background via-background-soft to-background'>
            <Header />
            <div className='py-20 px-6 md:px-12 max-w-7xl mx-auto' id="departments">
                <h1 className="font-audiowide text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 text-center">Departments</h1>
                <p className='text-muted-text text-center font-space text-lg mb-10'>Browse departments and jump to their events.</p>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'>
                    {DEPARTMENTS.map((dept) => (
                        <div
                            key={dept.id}
                            className='group rounded-2xl p-[1px] bg-gradient-to-r from-primary/30 to-secondary/30 hover:from-primary/60 hover:to-secondary/60 transition-all duration-300 hover:-translate-y-0.5'
                        >
                            <div className='rounded-2xl flex flex-col justify-between bg-background-soft/80 border border-border/60 backdrop-blur-sm p-6 h-full'>
                                <div className='flex items-start gap-4'>
                                    <div className='h-12 w-12 min-h-[48px] min-w-[48px] rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-audiowide text-white border border-border/60'>
                                        {dept.code}
                                    </div>
                                    <div className='flex-1'>
                                        <h2 className='font-audiowide text-xl text-white group-hover:text-primary transition-colors duration-300'>
                                            {dept.name}
                                        </h2>
                                        <p className='text-xs text-muted-text mt-1'>
                                            Department Code: <span className='text-white/80'>{dept.code}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className='mt-6 flex justify-end'>
                                    <Link
                                        href={`/events#dept-${dept.id}`}
                                        className='inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-primary/40 text-white font-audiowide bg-primary/10 hover:bg-primary hover:text-white hover:border-primary transition-colors duration-300'
                                    >
                                        View Events <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className='group rounded-2xl p-[1px] bg-gradient-to-r from-secondary/30 to-primary/30 hover:from-secondary/60 hover:to-primary/60 transition-all duration-300 hover:-translate-y-0.5'>
                        <div className='rounded-2xl flex flex-col justify-between bg-background-soft/80 border border-border/60 backdrop-blur-sm p-6 h-full'>
                            <div className='flex items-start gap-4'>
                                <div className='h-12 w-12  rounded-xl bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center text-xs font-audiowide text-white border border-border/60'>
                                    OTH
                                </div>
                                <div className='flex-1'>
                                    <h2 className='font-audiowide text-xl text-white group-hover:text-secondary transition-colors duration-300'>
                                        Others
                                    </h2>
                                    <p className='text-xs text-muted-text mt-1'>General events without a specific department</p>
                                </div>
                            </div>
                            <div className='mt-6 flex justify-end'>
                                <Link
                                    href={'/events#dept-others'}
                                    className='inline-flex items-center gap-2 rounded-lg px-4 py-2 border border-secondary/40 text-white font-audiowide bg-secondary/10 hover:bg-secondary hover:text-white hover:border-secondary transition-colors duration-300'
                                >
                                    View Events <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default page