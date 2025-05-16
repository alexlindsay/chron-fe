export async function fetchDailyEvents() {
    const res = await fetch('http://localhost:3000/api/daily-events');
    if (!res.ok) throw new Error('Failed to fetch daily events');
    return res.json();
}
