import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
            <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-8">
                <img
                    src="/404.svg"
                    alt="Page not found"
                    className="w-3/4 mx-auto mb-6"
                />
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Ой! Страница не найдена...
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                    Кажется, Вы попали на страницу, которой на самом деле не существует. Но не беспокойтесь, любая хорошая презентация начинается с пустого слайда!
                </p>

                <div className="flex justify-center space-x-4 mb-8">
                    <Link href="/dashboard">
                        <Button className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
                            Вернутся на главную страницу
                        </Button>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default NotFound;