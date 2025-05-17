import React from 'react';
import { Event } from '../types';

interface Props {
    index: number;
    event: Event | null;
    onDrop: (event: Event, index: number) => void;
    isCorrect?: boolean;
}

const DropSlot: React.FC<Props> = ({ index, event, onDrop, isCorrect }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow a drop
    };

    const handleDrop = (e: React.DragEvent) => {
        const eventId = e.dataTransfer.getData('eventId');
        if (!eventId) return;

        const foundEvent = JSON.parse(localStorage.getItem('events') || '[]').find(
            (ev: Event) => ev.id === eventId
        );
        if (foundEvent) onDrop(foundEvent, index);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`aspect-square w-full max-w-[160px] sm:max-w-[200px] p-2 border-2 rounded-xl shadow transition 
                flex items-center justify-center text-center 
                ${isCorrect === true
                    ? 'border-green-500 bg-green-50 dark:bg-green-900'
                    : isCorrect === false
                        ? 'border-red-500 bg-red-50 dark:bg-red-900'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}
        >
            {event ? (
                <div className="flex flex-col items-center justify-center gap-1 px-1">
                    <div className="text-2xl">{event.emoji}</div>
                    <h3 className="font-semibold text-sm">{event.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{event.text}</p>
                </div>
            ) : (
                <span className="text-gray-400 dark:text-gray-500 text-lg font-bold">{index + 1}</span>
            )}
        </div>
    );
};

export default DropSlot;
