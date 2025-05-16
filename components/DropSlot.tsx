import React from 'react';
import { Event } from '../types';

interface Props {
    index: number;
    event: Event | null;
    onDrop: (event: Event, index: number) => void;
    isCorrect?: boolean;
}

export default function DropSlot({ index, event, onDrop, isCorrect }: Props) {
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (data) {
            const droppedEvent: Event = JSON.parse(data);
            onDrop(droppedEvent, index);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (event) {
            e.dataTransfer.setData('application/json', JSON.stringify(event));
            e.currentTarget.classList.add('opacity-50');
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-50');
    };

    const borderColor = isCorrect === undefined
        ? 'border-gray-300'
        : isCorrect
            ? 'border-green-500'
            : 'border-red-500';

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`w-36 h-24 border-2 ${borderColor} rounded-xl transition flex items-center justify-center bg-gray-50`}
        >
            {event ? (
                <div
                    draggable
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className="w-full h-full px-3 py-2 cursor-grab active:cursor-grabbing rounded-xl bg-white shadow flex items-center justify-center text-sm font-medium text-center"
                >
                    {event.title}
                </div>
            ) : (
                <span className="text-gray-400 text-sm">Drop event</span>
            )}
        </div>
    );
}
