import React from 'react';
import * as z from 'zod';
import { BlueLine } from '@/components/BlueLine';

const layoutId = 'rosatom-standard-content';
const layoutName = 'Rosatom Standard Content';
const layoutDescription = 'Стандартный контентный слайд с заголовком и текстом в стиле Росатома.';

const Schema = z.object({
    title: z.string().min(3).max(100).default('История проекта').meta({ description: 'Заголовок для данного слайда' }),
    content: z.string().min(20).max(1000).default('С 2009 года — независимое заверение отчетности, проведение диалогов с заинтересованными сторонами. Переход на единый бренд «Росатома» в 2021 году.').meta({ description: 'Основной текстовый блок или параграф' })
});

type SlideData = z.infer<typeof Schema>;

interface SlideLayoutProps {
    data?: Partial<SlideData>;
}

const dynamicSlideLayout: React.FC<SlideLayoutProps> = ({ data: slideData }) => {
    return (
        <div
            className="w-full rounded-sm max-w-[1280px] shadow-lg max-h-[720px] aspect-video relative z-20 mx-auto overflow-hidden flex flex-col p-12"
            style={{
                backgroundColor: 'var(--card-background-color, #ffffff)',
                color: 'var(--text-heading-color, #0f172a)',
                fontFamily: 'var(--body-font-family, Inter, sans-serif)'
            }}
        >
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-4xl font-bold" style={{ fontFamily: 'var(--heading-font-family, Inter, sans-serif)' }}>{slideData?.title}</h3>
                <img src="/rosatom-logo.png" alt="Rosatom Logo" className="h-10" />
            </div>
            <p className="text-xl leading-relaxed whitespace-pre-line">{slideData?.content}</p>
            <BlueLine />
        </div>
    );
};

export { Schema, layoutId, layoutName, layoutDescription };
export default dynamicSlideLayout;