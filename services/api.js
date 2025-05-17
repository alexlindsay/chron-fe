export async function fetchDailyEvents() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const res = await fetch(`${apiUrl}/api/daily-events`);
    if (!res.ok) throw new Error('Failed to fetch daily events');
    return res.json();
}
