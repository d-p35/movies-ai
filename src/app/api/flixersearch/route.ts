// app/api/search/route.ts
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const movieName = searchParams.get('movieName');
    if (!movieName) {
        return NextResponse.json({ error: 'Movie name is required' }, { status: 400 });
    }

    const baseUrl = 'https://myflixerz.to';
    const searchUrl = `${baseUrl}/search/${movieName.replace(/\s+/g, '-')}`;

    try {
        const response = await axios.get(searchUrl);
        return NextResponse.json(response.data);
    } catch (error) {
        // console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
