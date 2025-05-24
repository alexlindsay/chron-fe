import React from 'react';
import { Event } from '../types';
import cn from 'classnames';

interface Props {
    index: number;
    event: Event | null;
    onDrop: (event: Event, index: number) => void;
    onRemove?: (index: number) => void;
    isCorrect?: boolean;
    answerRevealed?: boolean
    showDate?: boolean
}

const DropSlot: React.FC<Props> = ({ index, event, onDrop, onRemove, isCorrect, answerRevealed, showDate }) => {
    // const handleDragOver = (e: React.DragEvent) => {
    //     e.preventDefault();
    // };

    // const handleDrop = (e: React.DragEvent) => {
    //     const eventId = e.dataTransfer.getData('eventId');
    //     if (!eventId) return;

    //     const foundEvent = JSON.parse(localStorage.getItem('events') || '[]').find(
    //         (ev: Event) => ev.id === eventId
    //     );
    //     if (foundEvent) onDrop(foundEvent, index);
    // };

    const handleClick = () => {
        if (event && onRemove) {
            onRemove(index);
        }
    };

    return (
        <div
            className={cn(
                "border-2 border-dashed rounded-xl px-2 py-4 min-h-24 flex items-center justify-between text-center transition-all duration-300",
                event ? "border-blue-300 bg-blue-100 dark:bg-blue-800" : "",
                answerRevealed && isCorrect === true ? "border-green-400 bg-green-50 dark:bg-green-900" : "",
                answerRevealed && isCorrect === false ? "border-red-400 bg-red-50 dark:bg-red-900" : "",
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                const data = e.dataTransfer.getData("application/json");
                if (data) {
                    const droppedEvent: Event = JSON.parse(data);
                    onDrop(droppedEvent, index);
                }
            }}
            onClick={handleClick}
        >
            {event ? (
                <>
                    <div className="text-2xl mr-1">
                        {answerRevealed && isCorrect !== undefined ? (
                            <span className="text-2xl ml-2">
                                {isCorrect ? "✅" : "❌"}
                            </span>
                        ) : (
                            event.emoji
                        )}
                    </div>
                    <div className="font-semibold text-base break-words">{index + 1}. {event.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 break-words">{event.text}</div>
                    {showDate && (
                        <div className="text-xs text-gray-500 mt-2">
                            {new Date(event.date).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </div>
                    )}

                </>
            ) : (
                <span className="text-gray-400 mx-auto text-sm">Event here</span>
            )}
        </div>
    );
};

{/* {onRemove && !showDate && ( */ }
//     <button
//         className="mt-2 text-xs text-red-500 underline"
//         onClick={() => onRemove(index)}
//     >
//         Remove
//     </button>
// )}
export default DropSlot;
