'use client';

import React, { useEffect, useState } from 'react';
import EventTile from '../components/EventTile';
import DropSlot from '../components/DropSlot';
import CategoryWeekTable from '../components/CategoryWeekTable';
import { fetchDailyEvents } from '../services/api';
import { Event } from '../types';
import Confetti from 'react-confetti';
import { useWindowSize } from '../hooks/useWindowSize';
import ShareButton from '@/components/ShareButton';

export default function GamePage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [available, setAvailable] = useState<Event[]>([]);
    const [slots, setSlots] = useState<(Event | null)[]>(Array(5).fill(null));
    const [tries, setTries] = useState<number>(3);
    const [message, setMessage] = useState<string>('');
    // const [feedback, setFeedback] = useState<boolean[]>([]);
    const [answerRevealed, setAnswerRevealed] = useState<boolean>(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [gameOver, setGameOver] = useState<boolean>(false);
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
        // setFeedback([]);
    };


    const handleRemoveFromSlot = (index: number) => {
        // If an event is removed from a slot manually set answerRevealed to false again
        setAnswerRevealed(false);
        setSlots(prev => {
            const eventToReturn = prev[index];
            const newSlots = [...prev];
            newSlots[index] = null;
            if (eventToReturn) {
                setAvailable(prev => {
                    const updated = [...prev, eventToReturn];
                    const seen = new Set();
                    return updated.filter(e => {
                        if (seen.has(e.id)) return false;
                        seen.add(e.id);
                        return true;
                    });
                });
            }
            return newSlots;
        });
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
        // setFeedback([]);
        setAnswerRevealed(false);
        setShowConfetti(false);
    };

    const checkAnswer = () => {
        if (slots.some(s => s === null)) return;

        const correctOrder = [...events].sort((a, b) => {
            const [y1, m1, d1] = parseDateParts(a.date);
            const [y2, m2, d2] = parseDateParts(b.date);

            if (y1 !== y2) return y1 - y2;
            if (m1 !== m2) return m1 - m2;
            return d1 - d2;
        });
        const isCorrect = slots.every((e, i) => e?.id === correctOrder[i].id);
        setAnswerRevealed(true);

        if (isCorrect) {
            setMessage('✅ Correct!');
            setGameOver(true);
            // setFeedback(slots.map(() => true));
            setShowConfetti(true);
        } else {
            const newTries = tries - 1;
            setTries(newTries);
            // setFeedback(slots.map((e, i) => e?.id === correctOrder[i].id));

            if (newTries <= 0) {
                setMessage('❌ Out of tries. Here’s the correct order:');
                setAnswerRevealed(true);
                setGameOver(true);
            } else {
                setMessage('Try again!');
            }
        }
    };

    const parseDateParts = (dateStr: string) => {
        const match = dateStr.match(/^(-?\d+)-(\d{2})-(\d{2})$/);
        if (!match) return [0, 0, 0]; // fallback
        const [, year, month, day] = match;
        return [parseInt(year, 10), parseInt(month, 10), parseInt(day, 10)];
    };

    const correctOrder = [...events].sort((a, b) => {
        const [y1, m1, d1] = parseDateParts(a.date);
        const [y2, m2, d2] = parseDateParts(b.date);

        if (y1 !== y2) return y1 - y2;
        if (m1 !== m2) return m1 - m2;
        return d1 - d2;
    });

    const eventsLoaded = available.length === 0 ? (
        <p className='align-center pb-4'>All events in play</p>
    ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6 place-items-center">
            {loading ? (
                <div className="flex flex-col items-center justify-center col-span-full">
                    <div className="w-48 h-2 bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-timeline rounded-full my-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Assembling moments in history...</p>
                </div>
            ) : error ? (
                <p className="text-lg text-red-500 col-span-full">{error}</p>
            ) : (


                available.map((event, i) => (
                    <EventTile
                        key={event.id}
                        event={gameOver && !showConfetti ? correctOrder[i] : event}
                        onClick={() => {
                            const firstEmpty = slots.findIndex(s => s === null);
                            if (firstEmpty >= 0) handleDrop(event, firstEmpty);
                        }}
                    />
                ))
            )}
        </div>
    )

    const eventsContent = loading ? (
        <div className="text-center p-4">Loading events...</div>
    ) : (error || !events) ? (
        <div className="text-center p-4 text-red-500">
            I am having trouble getting the events right now. Please come back later.
        </div>
    ) : eventsLoaded;

    return (
        <div className="max-w-4xl mx-auto p-4 text-center font-mono dark:bg-zinc-900 dark:text-white">
            <h1 className="text-2xl font-sans font-bold mb-2">Temporal Tiles</h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4 font-sans">
                3 chances to set the events of history in chronological order.
            </p>

            <h2 className="text-lg font-sans font-semibold my-2">Events</h2>

            {eventsContent}

            <h2 className="text-lg font-sans font-semibold my-2">Your Timeline</h2>
            <div className="flex flex-col gap-4 w-full max-w-md mx-auto mb-4">
                {slots.map((event, i) => {
                    const isCorrect = event && correctOrder[i]
                        ? event.date === correctOrder[i].date
                        : undefined;
                    return (
                        <DropSlot
                            key={i}
                            index={i}
                            event={gameOver && !showConfetti ? correctOrder[i] : event}
                            onDrop={handleDrop}
                            isCorrect={isCorrect}
                            onRemove={handleRemoveFromSlot}
                            answerRevealed={answerRevealed}
                            gameOver={gameOver}
                        />
                    )
                })}
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
                <ShareButton />
            </div>

            <p className="text-lg font-medium mt-4">{message}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Attempts Left: {tries}</p>
            <br />
            <p className='text-lg font-black mb-2 font-sans'>New categories every day!</p>
            <CategoryWeekTable />
            {showConfetti && <Confetti width={width} height={height} />}
        </div>
    );

}
