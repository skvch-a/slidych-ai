import React from 'react';
import * as z from 'zod';
import { BlueLine } from '@/components/BlueLine';

const layoutId = 'rosatom-theses-list';
const layoutName = 'Rosatom Theses List';
const layoutDescription = 'Слайд для изложения нескольких ключевых тезисов в формате "подзаголовок-текст".';

const Schema = z.object({
    title: z.string().min(3).max(100).default('Ключевые тезисы').meta({ description: 'Основной заголовок слайда' }),
    items: z.array(z.object({
        heading: z.string().min(3).max(80).default('Цифровая трансформация').meta({ description: 'Подзаголовок тезиса' }),
        content: z.string().min(10).max(500).default('Интеграция цифровых технологий во все аспекты бизнес-процессов, требующая фундаментальных изменений в технологии, культуре и операциях.').meta({ description: 'Развернутое описание тезиса' })
    })).min(2).max(4).default([
        { heading: 'Цифровая трансформация', content: 'Интеграция цифровых технологий во все аспекты бизнес-процессов, требующая фундаментальных изменений в технологии, культуре и операциях.' },
        { heading: 'Устойчивое развитие', content: 'Обеспечение баланса между экономическим ростом, социальной ответственностью и бережным отношением к окружающей среде.' },
        { heading: 'Инновационная экосистема', content: 'Создание среды, способствующей генерации, развитию и внедрению новых идей и технологий для долгосрочного успеха.' }
    ])
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
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-4xl font-bold" style={{ color: 'var(--text-heading-color, #0f172a)', fontFamily: 'var(--heading-font-family, Inter, sans-serif)' }}>{slideData?.title}</h3>
                    <img src="/rosatom-logo.png" alt="Rosatom Logo" className="h-10" />
                </div>

                <div className="flex-grow space-y-8">
                    {slideData?.items?.map((item, index) => (
                        <div key={index}>
                            <h4 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-heading-color, #0f172a)' }}>
                                {item.heading}
                            </h4>
                            <div className="w-16 h-1 mb-3" style={{ backgroundColor: 'var(--primary-accent-color, #2563eb)' }}></div>
                            <p className="text-lg leading-relaxed">
                                {item.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <BlueLine />
        </div>
    );
};

export { Schema, layoutId, layoutName, layoutDescription };
export default dynamicSlideLayout;