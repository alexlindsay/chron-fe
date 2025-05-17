'use client';

import React, { useEffect, useState } from 'react';
import EventTile from '../components/EventTile';
import DropSlot from '../components/DropSlot';
import CategoryWeekTable from '../components/CategoryWeekTable';
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
    const [error, setError] = useState<string>('');
    const { width, height } = useWindowSize();

    // Fisher-Yates shuffle
    const shuffleArray = (array: Event[]): Event[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useEffect(() => {
        async function loadEvents() {
            setLoading(true);
            setError('');
            try {
                const data = await fetchDailyEvents();
                setEvents(data.events);
                localStorage.setItem('events', JSON.stringify(data.events)); // Save for drag-drop
                setAvailable(shuffleArray(data.events));
            } catch (err) {
                console.log("Load events error: ", err)
                setError('Failed to load events from the server.');
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

        const fromSlotIndex = newSlots.findIndex((e) => e?.id === event.id);
        if (fromSlotIndex !== -1) {
            // Move from one slot to another
            newSlots[fromSlotIndex] = null;
        } else {
            // Remove from available pool
            const availableIndex = newAvailable.findIndex((e) => e.id === event.id);
            if (availableIndex !== -1) {
                newAvailable.splice(availableIndex, 1);
            }
        }

        // Replace existing event in the drop target (put back to available)
        if (newSlots[index]) {
            newAvailable.push(newSlots[index] as Event);
        }

        newSlots[index] = event;

        setSlots(newSlots);
        setAvailable(newAvailable);
        setFeedback([]);
    };

    const resetBoard = () => {
        // Do NOT reset tries
        const remainingEvents = [...events].filter(
            (e) => !slots.some((slot) => slot?.id === e.id)
        );
        const availableReset = shuffleArray([...remainingEvents, ...slots.filter(Boolean) as Event[]]);
        setAvailable(availableReset);
        setSlots(Array(5).fill(null));
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg">Loading events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg text-red-500">{error}</p>
            </div>
        );
    }

    const correctOrder = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="max-w-4xl mx-auto p-4 text-center">
            <h1 className="text-2xl font-bold mb-2">Temporal Tiles</h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                3 chances to set the events of history in chronological order.
            </p>
            <CategoryWeekTable />

            <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 justify-items-center"
                aria-label="Drop slots for arranging timeline"
            >
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

            <div className="space-x-2">
                <button
                    className="px-10 py-3 bg-blue-600 text-white rounded-md disabled:opacity-50"
                    onClick={checkAnswer}
                    disabled={tries <= 0 || slots.includes(null) || answerRevealed}
                >
                    Submit
                </button>
                <button
                    className="px-10 py-3 bg-gray-300 text-gray-800 rounded-md"
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
