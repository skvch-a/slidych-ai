import React from 'react';
import * as z from 'zod';
import { BlueLine } from '@/components/BlueLine';

const layoutId = 'rosatom-title';
const layoutName = 'Rosatom Title Slide';
const layoutDescription = 'Титульный слайд в корпоративном стиле Росатома с логотипом, заголовком и информацией об авторе.';

const Schema = z.object({
    title: z.string().min(5).max(120).default('Отчетные продукты и их назначение').meta({ description: 'Главный заголовок презентации' }),
    author: z.string().optional().default('Александр Берензон').meta({ description: 'Имя автора или название отдела' }),
    authorTitle: z.string().optional().default('Главный специалист').meta({ description: 'Должность автора или подразделение' }),
    date: z.string().optional().default('06.11.2024').meta({ description: 'Дата презентации' })
});

type SlideData = z.infer<typeof Schema>;

interface SlideLayoutProps {
    data?: Partial<SlideData>;
}

const dynamicSlideLayout: React.FC<SlideLayoutProps> = ({ data: slideData }) => {
    return (
        <div
            className="w-full rounded-sm max-w-[1280px] shadow-lg max-h-[720px] aspect-video relative z-20 mx-auto overflow-hidden flex flex-col justify-between p-20"
            style={{
                backgroundColor: 'var(--card-background-color, #ffffff)',
                color: 'var(--text-heading-color, #0f172a)',
                fontFamily: 'var(--heading-font-family, Inter, sans-serif)'
            }}
        >
            <img src="/rosatom-logo.png" alt="Rosatom Logo" className="h-12 w-auto self-start" />

            <div className="flex-grow flex flex-col justify-center">
                <h1 className="text-5xl font-bold max-w-4xl">{slideData?.title}</h1>
            </div>

            <div className="self-start text-left">
                {slideData?.date && <p className="text-lg mb-4">{slideData.date}</p>}
                {slideData?.author && <p className="text-xl font-semibold">{slideData.author}</p>}
                {slideData?.authorTitle && <p className="text-lg">{slideData.authorTitle}</p>}
            </div>
            <BlueLine />
        </div>
    );
};

export { Schema, layoutId, layoutName, layoutDescription };
export default dynamicSlideLayout;