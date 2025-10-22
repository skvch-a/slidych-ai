import React from 'react';
import * as z from 'zod';
import { BlueLine } from '@/components/BlueLine';

const layoutId = 'rosatom-two-column-text';
const layoutName = 'Rosatom Two Column Text';
const layoutDescription = 'Слайд с двумя колонками текста для сравнений или параллельного изложения.';

const Schema = z.object({
    title: z.string().min(3).max(100).default('Сравнение подходов').meta({ description: 'Основной заголовок слайда' }),
    columns: z.array(z.object({
        heading: z.string().min(3).max(50).default('Подход А').meta({ description: 'Заголовок колонки' }),
        content: z.string().min(10).max(500).default('Детальное описание подхода, его преимущества и особенности применения в рамках текущего проекта.').meta({ description: 'Основной текст колонки' })
    })).min(2).max(2).default([
        { heading: 'Подход А', content: 'Детальное описание подхода А, его преимущества и особенности применения в рамках текущего проекта.' },
        { heading: 'Подход Б', content: 'Детальное описание подхода Б, его преимущества и особенности применения в рамках текущего проекта.' }
    ])
});

type SlideData = z.infer<typeof Schema>;

interface SlideLayoutProps {
    data?: Partial<SlideData>;
}

const dynamicSlideLayout: React.FC<SlideLayoutProps> = ({ data: slideData }) => {
    return (
        <div
            className="h-full w-full flex flex-col p-12 relative"
            style={{
                backgroundColor: 'var(--card-background-color, #ffffff)',
                color: 'var(--text-body-color, #0f172a)',
                fontFamily: 'var(--body-font-family, Inter, sans-serif)'
            }}
        >
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-4xl font-bold" style={{ color: 'var(--text-heading-color, #0f172a)', fontFamily: 'var(--heading-font-family, Inter, sans-serif)' }}>{slideData?.title}</h3>
                <img src="/rosatom-logo.png" alt="Rosatom Logo" className="h-10" />
            </div>
            <div className="flex-grow grid grid-cols-2 gap-8 pt-4">
                {slideData?.columns?.map((column, index) => (
                    <div key={index}>
                        <h4 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-heading-color, #0f172a)' }}>{column.heading}</h4>
                        <p className="text-lg leading-relaxed">{column.content}</p>
                    </div>
                ))}
            </div>
            <BlueLine />
        </div>
    );
};

export { Schema, layoutId, layoutName, layoutDescription };
export default dynamicSlideLayout;