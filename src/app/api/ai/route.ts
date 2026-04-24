import { NextRequest, NextResponse } from 'next/server';
import { processAIRequest, isEmergencyQuery, getHealthTips, AI_CONFIG } from '@/lib/aiEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context, mode, language, userSymptoms } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, response: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Check for emergency first
    if (isEmergencyQuery(query)) {
      return NextResponse.json({
        success: true,
        response: `🚨 EMERGENCY DETECTED\n\nPlease call emergency services IMMEDIATELY: 108\n\nDo not wait. Every minute counts in a medical emergency.\n\nWhile waiting for help:\n- Stay calm\n- If trained, provide first aid\n- Do not give food or water if unconscious\n- Keep the person comfortable`,
        sources: [],
        suggestions: ['Call 108 immediately', 'Stay with person', 'Prepare for CPR if needed'],
        isEmergency: true,
        mode: 'emergency'
      });
    }
    
    // Process the AI request
    const result = await processAIRequest({
      query: query.trim(),
      context,
      mode,
      language,
      userSymptoms
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      {
        success: false,
        response: AI_CONFIG.fallbackResponses[0],
        sources: [],
        suggestions: ['Please try again', 'Consult a doctor if symptoms persist'],
        isEmergency: false,
        mode: 'chat'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json(
      { 
        success: false, 
        response: 'Query parameter is required',
        availableEndpoints: {
          'POST /api/ai': 'Main AI endpoint - send JSON body with query',
          'GET /api/ai?query=your_question': 'Simple GET request',
          'GET /api/ai/health-tips': 'Get general health tips'
        }
      },
      { status: 400 }
    );
  }
  
  // Check for emergency
  if (isEmergencyQuery(query)) {
    return NextResponse.json({
      success: true,
      response: `🚨 EMERGENCY: Call 108 IMMEDIATELY\n\nDo not delay. Every minute counts!`,
      isEmergency: true,
      mode: 'emergency'
    });
  }
  
  const result = await processAIRequest({ query });
  
  return NextResponse.json(result);
}