// components/EventTile.tsx
'use client';

import React from 'react';
import { Event } from '../types';

type Props = {
    event: Event;
    onClick?: () => void;
    draggable?: boolean;
};

export default function EventTile({ event, onClick, draggable = true }: Props) {
    return (
        <div
            className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow hover:shadow-md transition-all cursor-pointer select-none text-left flex flex-col gap-1"
            draggable={draggable}
            onClick={onClick}
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify(event));
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onClick?.();
            }}
        >
            <div className="text-3xl mb-1">{event.emoji}</div>
            <div className="text-base font-semibold text-gray-800 dark:text-gray-100">{event.title}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{event.text}</div>
        </div>
    );
}
