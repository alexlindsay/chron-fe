'use client';

import React, { useEffect, useState } from 'react';
import EventTile from '../components/EventTile';
import DropSlot from '../components/DropSlot';
import { fetchDailyEvents } from '../services/api';
import { Event } from '../types';
import Confetti from 'react-confetti';
import { useWindowSize } from '../hooks/useWindowSize';

export default function GamePage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [available, setAvailable] = useState<Event[]>([]);
    const [slots, setSlots] = useState<(Event | null)[]>(Array(5).fill(null));
    const [tries, setTries] = useState<number>(3);
    const [message, setMessage] = useState<string>('');
    const [feedback, setFeedback] = useState<boolean[]>([]);
    const [answerRevealed, setAnswerRevealed] = useState<boolean>(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const { width, height } = useWindowSize();

    useEffect(() => {
        async function loadEvents() {
            setLoading(true);
            setLoadError(null);
            try {
                const data = await fetchDailyEvents();
                setEvents(data.events);
                setAvailable(data.events);
            } catch (err) {
                setLoadError('Failed to load events from the server.');
            } finally {
                setLoading(false);
            }
        }
        loadEvents();
    }, []);

    const handleDrop = (event: Event, index: number) => {
        if (!Array.isArray(slots) || !Array.isArray(available)) return;

        const newSlots = [...slots];
        const newAvailable = [...available];
        const existingEvent = newSlots[index];

        const alreadySlotted = newSlots.some(e => e?.id === event.id);
        if (alreadySlotted) return;

        if (existingEvent) {
            newAvailable.push(existingEvent);
        }

        newSlots[index] = event;
        const filteredAvailable = newAvailable.filter(e => e.id !== event.id);

        setSlots(newSlots);
        setAvailable(filteredAvailable);
        setFeedback([]);
    };

    const resetBoard = () => {
        setAvailable(events);
        setSlots(Array(5).fill(null));
        setTries(3);
        setMessage('');
        setFeedback([]);
        setAnswerRevealed(false);
        setShowConfetti(false);
    };

    const checkAnswer = () => {
        if (slots.some(s => s === null)) return;

        const correctOrder = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const isCorrect = slots.every((e, i) => e?.id === correctOrder[i].id);

        if (isCorrect) {
            setMessage('✅ Correct!');
            setFeedback(slots.map(() => true));
            setShowConfetti(true);
        } else {
            const newTries = tries - 1;
            setTries(newTries);
            setFeedback(slots.map((e, i) => e?.id === correctOrder[i].id));

            if (newTries <= 0) {
                setMessage('❌ Out of tries. Here’s the correct order:');
                setAnswerRevealed(true);
            } else {
                setMessage('Try again!');
            }
        }
    };

    const correctOrder = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="max-w-4xl mx-auto p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Temporal Tiles</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop the events into the correct chronological order. You have 3 tries to get it right!
            </p>

            {loading ? (
                <p>Loading events...</p>
            ) : loadError ? (
                <p className="text-red-600 dark:text-red-400 mb-6">{loadError}</p>
            ) : (
                <>
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        {slots.map((event, i) => {
                            const status = feedback[i];
                            const correctEvent = correctOrder[i];
                            const displayEvent = answerRevealed ? correctEvent : event;

                            return (
                                <DropSlot
                                    key={i}
                                    index={i}
                                    event={displayEvent}
                                    onDrop={handleDrop}
                                    isCorrect={answerRevealed ? true : status}
                                />
                            );
                        })}
                    </div>

                    <h2 className="text-lg font-semibold mb-2">Events</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {available.map((event) => (
                            <EventTile
                                key={event.id}
                                event={event}
                                onClick={() => {
                                    const firstEmpty = slots.findIndex(s => s === null);
                                    if (firstEmpty >= 0) handleDrop(event, firstEmpty);
                                }}
                            />
                        ))}
                    </div>
                </>
            )}

            <div className="space-x-2">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                    onClick={checkAnswer}
                    disabled={slots.includes(null) || answerRevealed || !!loadError}
                >
                    Submit
                </button>
                <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                    onClick={resetBoard}
                >
                    Reset
                </button>
            </div>

            <p className="text-lg font-medium mt-4">{message}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Attempts Left: {tries}</p>
            {showConfetti && <Confetti width={width} height={height} />}
        </div>
    );
}
