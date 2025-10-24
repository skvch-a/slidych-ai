import React from 'react';
import * as z from 'zod';
import { BlueLine } from '@/components/BlueLine';
import { ImageSchema } from '@/presentation-templates/defaultSchemes';

const layoutId = 'rosatom-bulleted-list';
const layoutName = 'Rosatom Bulleted List';
const layoutDescription = 'Слайд с маркированным списком в стиле Росатома.';

const Schema = z.object({
    title: z.string().min(3).max(100).default('Задачи 2025 года').meta({ description: 'Заголовок для списка' }),
    items: z.array(z.object({
        text: z.string().min(3).meta({ description: "Элемент списка" })
    })).min(2).max(6).default([
        { text: 'Формулировка приоритетной темы' },
        { text: 'Анализ раскрываемых показателей' },
        { text: 'Использование показателей экологической результативности' },
        { text: 'Продвижение экологической отчетности' }
    ]).meta({ description: 'Массив текстовых элементов для маркированного списка' }),
    images: z.array(ImageSchema).length(3).default([
        {
            __image_url__: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1332',
            __image_prompt__: 'деловая встреча в современном офисе'
        },
        {
            __image_url__: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1332',
            __image_prompt__: 'команда работает над проектом'
        },
        {
            __image_url__: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=1332',
            __image_prompt__: 'ноутбук с кодом крупным планом'
        }
    ]).meta({ description: 'Три небольших изображения под списком' })
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
                color: 'var(--text-body-color, #0f172a)',
                fontFamily: 'var(--body-font-family, Inter, sans-serif)'
            }}
        >
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-4xl font-bold" style={{ color: 'var(--text-heading-color, #0f172a)', fontFamily: 'var(--heading-font-family, Inter, sans-serif)' }}>{slideData?.title}</h3>
                <img src="/rosatom-logo.png" alt="Rosatom Logo" className="h-10" />
            </div>
            <div className="flex-grow">
                <ul className="space-y-4 pt-4">
                    {slideData?.items?.map((item, index) => (
                        <li key={index} className="flex items-start text-xl">
                            <span className="font-bold text-2xl mr-4" style={{ color: 'var(--primary-accent-color, rgb(63, 129, 191))' }}>&#8226;</span>
                            <span>{item.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-around items-center pt-6">
                {slideData?.images?.map((image, index) => (
                    <div key={index} className="w-1/4 h-40 rounded-lg overflow-hidden shadow-md">
                        <img
                            src={image.__image_url__}
                            alt={image.__image_prompt__}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
            <BlueLine />
        </div>
    );
};

export { Schema, layoutId, layoutName, layoutDescription };
export default dynamicSlideLayout;