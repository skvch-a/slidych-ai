import React from 'react';
import * as z from 'zod';

const layoutId = 'rosatom-section-header';
const layoutName = 'Rosatom Section Header';
const layoutDescription = 'Слайд-разделитель для обозначения новой темы в стиле Росатома.';

const Schema = z.object({
    sectionTitle: z.string().min(3).max(80).default('Задачи проекта').meta({ description: 'Краткий заголовок нового раздела или главы' })
});

type SlideData = z.infer<typeof Schema>;

interface SlideLayoutProps {
    data?: Partial<SlideData>;
}

const dynamicSlideLayout: React.FC<SlideLayoutProps> = ({ data: slideData }) => {
    return (
        <div
            className="w-full rounded-sm max-w-[1280px] shadow-lg max-h-[720px] aspect-video relative z-20 mx-auto overflow-hidden flex flex-col justify-center items-center p-12"
            style={{
                backgroundColor: 'var(--primary-accent-color, #2563eb)',
                color: 'var(--text-heading-color-dark, #ffffff)',
                fontFamily: 'var(--heading-font-family, Inter, sans-serif)'
            }}
        >
            <h2 className="text-5xl font-bold text-center">{slideData?.sectionTitle}</h2>
        </div>
    );
};

export { Schema, layoutId, layoutName, layoutDescription };
export default dynamicSlideLayout;