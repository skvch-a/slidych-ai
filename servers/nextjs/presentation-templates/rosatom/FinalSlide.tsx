import React from 'react';
import * as z from 'zod';
import { BlueLine } from '@/components/BlueLine';

const layoutId = 'rosatom-final-slide';
const layoutName = 'Rosatom Final Slide';
const layoutDescription = 'Заключительный слайд в стиле Росатома с благодарностью и контактами.';

const Schema = z.object({
    closingText: z.string().default("Спасибо за внимание").meta({ description: 'Заключительная фраза' }),
    contactName: z.string().optional().default('Александр Берензон').meta({ description: 'Контактное лицо' }),
    contactDetail: z.string().optional().default('allvberenzon@rosatom.ru').meta({ description: 'Контактная информация (email, сайт)' }),
    date: z.string().optional().default('06.11.2024').meta({ description: 'Дата презентации' })
});

type SlideData = z.infer<typeof Schema>;

interface SlideLayoutProps {
    data?: Partial<SlideData>;
}

const dynamicSlideLayout: React.FC<SlideLayoutProps> = ({ data: slideData }) => {
    return (
        <div
            className="w-full rounded-sm max-w-[1280px] shadow-lg max-h-[720px] aspect-video relative z-20 mx-auto overflow-hidden flex flex-col justify-center items-start p-20"
            style={{
                backgroundColor: 'var(--card-background-color, #ffffff)',
                color: 'var(--text-heading-color, #0f172a)',
                fontFamily: 'var(--heading-font-family, Inter, sans-serif)'
            }}
        >
            <h1 className="text-6xl font-bold mb-auto">{slideData?.closingText}</h1>

            <div className="self-start text-left">
                {slideData?.contactName && <p className="text-xl font-semibold">{slideData.contactName}</p>}
                {slideData?.contactDetail && <p className="text-lg">{slideData.contactDetail}</p>}
                {slideData?.date && <p className="text-lg mt-4">{slideData.date}</p>}
            </div>
            <BlueLine />
        </div>
    );
};

export { Schema, layoutId, layoutName, layoutDescription };
export default dynamicSlideLayout;