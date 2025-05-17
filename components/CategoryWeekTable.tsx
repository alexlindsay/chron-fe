import React from 'react';

const THEMES = [
    { key: 1, name: 'Music', color: 'bg-purple-200' },
    { key: 2, name: 'Ancient', color: 'bg-yellow-200' },
    { key: 3, name: 'Technology', color: 'bg-blue-200' },
    { key: 4, name: 'Modern', color: 'bg-green-200' },
    { key: 5, name: 'General', color: 'bg-indigo-200' },
    { key: 6, name: 'World', color: 'bg-red-200' },
    { key: 0, name: 'Challenge', color: 'bg-gray-300' },
];

const WEEKDAYS: { abbr: string; themeKey: number }[] = [
    { abbr: 'Mo', themeKey: 1 },
    { abbr: 'Tu', themeKey: 2 },
    { abbr: 'We', themeKey: 3 },
    { abbr: 'Th', themeKey: 4 },
    { abbr: 'Fr', themeKey: 5 },
    { abbr: 'Sa', themeKey: 6 },
    { abbr: 'Su', themeKey: 0 },
];

const themeMap = Object.fromEntries(THEMES.map(t => [t.key, t]));

export default function CategoryWeekTable() {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8 px-2">
            {WEEKDAYS.map(({ abbr, themeKey }) => {
                const { name, color } = themeMap[themeKey];
                return (
                    <div
                        key={abbr}
                        className={`${color} relative h-16 flex items-center justify-center rounded-lg shadow text-center`}
                    >
                        <span className="text-xs sm:text-sm font-semibold">{name}</span>
                        <span className="absolute bottom-1 left-1 text-[10px] sm:text-xs font-bold">{abbr}</span>
                    </div>
                );
            })}
        </div>
    );
}
