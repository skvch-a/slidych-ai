import React from "react";
import * as z from "zod";
import { IconSchema } from "@/presentation-templates/defaultSchemes";
import { RemoteSvgIcon } from "@/app/hooks/useRemoteSvgIcon";
import { BlueLine } from '@/components/BlueLine';

const layoutId = 'rosatom-icon-grid';
const layoutName = 'Rosatom Icon Grid';
const layoutDescription = 'Слайд с сеткой иконок и текста для отображения ключевых направлений.';

const Schema = z.object({
    title: z.string().min(3).max(80).default("Ключевые направления").meta({ description: "Заголовок для сетки элементов" }),
    items: z.array(z.object({
        icon: IconSchema.default({
            __icon_url__: 'https://presenton-public.s3.ap-southeast-1.amazonaws.com/static/icons/bold/users-four-bold.svg',
            __icon_query__: 'репутация'
        }),
        text: z.string().min(5).max(100).default("Укрепление репутации как открытой и прозрачной компании").meta({ description: "Текстовое описание элемента" })
    })).min(2).max(4).default([
        {
            icon: { __icon_url__: 'https://presenton-public.s3.ap-southeast-1.amazonaws.com/static/icons/bold/users-four-bold.svg', __icon_query__: 'репутация' },
            text: "Укрепление репутации как открытой и прозрачной компании"
        },
        {
            icon: { __icon_url__: 'https://presenton-public.s3.ap-southeast-1.amazonaws.com/static/icons/bold/chart-line-up-bold.svg', __icon_query__: 'энергетика' },
            text: "Повышение общественной приемлемости атомной энергетики"
        },
        {
            icon: { __icon_url__: 'https://presenton-public.s3.ap-southeast-1.amazonaws.com/static/icons/bold/briefcase-bold.svg', __icon_query__: 'бизнес' },
            text: "Развитие бизнеса на действующих и новых площадках"
        },
        {
            icon: { __icon_url__: 'https://presenton-public.s3.ap-southeast-1.amazonaws.com/static/icons/bold/trophy-bold.svg', __icon_query__: 'рейтинги' },
            text: "Участие в российских и международных рейтингах"
        }
    ]).meta({ description: "Массив элементов, каждый с иконкой и текстом" })
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
            <div className="flex justify-between items-center mb-12">
                <h3 className="text-4xl font-bold" style={{ color: 'var(--text-heading-color, #0f172a)', fontFamily: 'var(--heading-font-family, Inter, sans-serif)' }}>{slideData?.title}</h3>
                <img src="/rosatom-logo.png" alt="Rosatom Logo" className="h-10" />
            </div>
            <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                {slideData?.items?.map((item, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                        <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'var(--secondary-accent-color, #eff6ff)' }}>
                            <RemoteSvgIcon
                                url={item.icon?.__icon_url__}
                                className="w-16 h-16"
                                color="var(--primary-accent-color, #2563eb)"
                                title={item.icon?.__icon_query__}
                            />
                        </div>
                        <p className="text-lg">{item.text}</p>
                    </div>
                ))}
            </div>
            <BlueLine />
        </div>
    );
};

export { Schema, layoutId, layoutName, layoutDescription };
export default dynamicSlideLayout;