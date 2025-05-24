import React from 'react';
import { Event } from '../types';

interface Props {
    event: Event;
    onClick?: () => void;
}

const EventTile: React.FC<Props> = ({ event, onClick }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('eventId', event.id);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onClick={onClick}
            className="cursor-grab active:cursor-grabbing p-4 border rounded-md shadow hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-800 transition font-mono"
        >
            <div className="text-xl">{event.emoji}</div>
            <h3 className="font-semibold">{event.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{event.text}</p>
        </div>
    );
};

export default EventTile;
