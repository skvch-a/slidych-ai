import React from 'react';
import * as z from 'zod';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BlueLine } from '@/components/BlueLine';

const layoutId = 'rosatom-line-chart';
const layoutName = 'Rosatom Line Chart';
const layoutDescription = 'Слайд для отображения динамики показателей с помощью линейного графика.';

const Schema = z.object({
    title: z.string().min(3).max(100).default('Динамика производственных показателей').meta({ description: 'Заголовок слайда' }),
    description: z.string().min(10).max(300).default('Отслеживание изменений ключевых производственных метрик за последние пять лет.').meta({ description: 'Краткое описание графика' }),
    chartData: z.array(z.object({
        name: z.string().meta({ description: 'Название периода (ось X)' }),
        value: z.number().meta({ description: 'Значение (ось Y)' }),
    })).min(2).max(10).default([
        { name: '2020', value: 2400 },
        { name: '2021', value: 1398 },
        { name: '2022', value: 9800 },
        { name: '2023', value: 3908 },
        { name: '2024', value: 4800 },
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
                fontFamily: 'var(--body-font-family, Inter, sans-serif)'
            }}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-4xl font-bold" style={{ color: 'var(--text-heading-color, #0f172a)', fontFamily: 'var(--heading-font-family, Inter, sans-serif)' }}>{slideData?.title}</h3>
                    <p className="text-lg mt-2 max-w-2xl" style={{ color: 'var(--text-body-color, #374151)' }}>{slideData?.description}</p>
                </div>
                <img src="/rosatom-logo.png" alt="Rosatom Logo" className="h-10" />
            </div>
            <div className="flex-grow w-full h-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={slideData?.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="var(--text-body-color, #374151)" />
                        <YAxis stroke="var(--text-body-color, #374151)" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Показатель" stroke="var(--primary-accent-color, #2563eb)" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <BlueLine />
        </div>
    );
};

export { Schema, layoutId, layoutName, layoutDescription };
export default dynamicSlideLayout;