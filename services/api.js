export async function fetchDailyEvents() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/daily-events';
    const res = await fetch(`${apiUrl}`);
    if (!res.ok) throw new Error('Failed to fetch daily events');
    return res.json();
}
