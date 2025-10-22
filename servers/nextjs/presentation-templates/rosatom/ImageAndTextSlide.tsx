import React from 'react';
import * as z from 'zod';
import { ImageSchema } from '@/presentation-templates/defaultSchemes';
import { BlueLine } from '@/components/BlueLine';

const layoutId = 'rosatom-image-and-text';
const layoutName = 'Rosatom Image and Text';
const layoutDescription = 'Универсальный слайд с изображением и текстом.';

const Schema = z.object({
    title: z.string().min(3).max(100).default('Ключевой аспект').meta({ description: 'Заголовок текстового блока' }),
    content: z.string().min(20).max(1000).default('Подробное описание ключевого аспекта, который иллюстрируется изображением. Текст раскрывает основные идеи и предоставляет контекст для лучшего понимания.').meta({ description: 'Основной текст' }),
    image: ImageSchema.default({
        __image_url__: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1332',
        __image_prompt__: 'деловая встреча в современном офисе'
    }).meta({ description: 'Сопроводительное изображение' }),
    imageSide: z.enum(['left', 'right']).default('left').meta({ description: 'Расположение изображения (слева или справа)' })
});

type SlideData = z.infer<typeof Schema>;

interface SlideLayoutProps {
    data?: Partial<SlideData>;
}

const dynamicSlideLayout: React.FC<SlideLayoutProps> = ({ data: slideData }) => {
    const imageBlock = (
        <div className="flex-1 h-full">
            <img
                src={slideData?.image?.__image_url__}
                alt={slideData?.image?.__image_prompt__}
                className="w-full h-full object-cover"
            />
        </div>
    );

    const textBlock = (
        <div className="flex-1 flex flex-col justify-center p-12">
            <h3 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-heading-color, #0f172a)', fontFamily: 'var(--heading-font-family, Inter, sans-serif)' }}>{slideData?.title}</h3>
            <p className="text-xl leading-relaxed">{slideData?.content}</p>
        </div>
    );

    return (
        <div
            className="w-full rounded-sm max-w-[1280px] shadow-lg max-h-[720px] aspect-video relative z-20 mx-auto overflow-hidden flex"
            style={{
                backgroundColor: 'var(--card-background-color, #ffffff)',
                color: 'var(--text-body-color, #0f172a)',
                fontFamily: 'var(--body-font-family, Inter, sans-serif)'
            }}
        >
            {slideData?.imageSide === 'left' ? <>{imageBlock}{textBlock}</> : <>{textBlock}{imageBlock}</>}
            <BlueLine />
        </div>
    );
};

export { Schema, layoutId, layoutName, layoutDescription };
export default dynamicSlideLayout;