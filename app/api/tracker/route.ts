import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Construir la URL con el parámetro para evitar cache
    const url = `https://trackleaders.com/spot/tahoe200-25/Jorge_Combe-status.json?_=${Date.now()}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tracker data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracker data' },
      { status: 500 }
    );
  }
} 