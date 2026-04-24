import { NextRequest, NextResponse } from 'next/server';
import { diagnoseError, formatDebugResponse, autoDebugFromStack } from '@/lib/debugAssistant';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { errorMessage, language, context, fileName } = body;
    
    if (!errorMessage) {
      return NextResponse.json(
        { success: false, response: 'Error message is required' },
        { status: 400 }
      );
    }
    
    const request = {
      errorMessage,
      language,
      context: context || (fileName ? { fileName } : undefined)
    };
    
    const result = diagnoseError(request);
    const formattedResponse = formatDebugResponse(result);
    
    return NextResponse.json({
      ...result,
      response: formattedResponse
    });
    
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        response: "I'm having trouble analyzing this error. Please provide the complete error message.",
        diagnosis: "Technical issue in debug assistant"
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const error = searchParams.get('error');
  const fileName = searchParams.get('file');
  
  if (!error) {
    return NextResponse.json({
      success: false,
      message: 'Error parameter is required',
      usage: {
        'POST /api/debug': 'Send JSON body with errorMessage',
        'GET /api/debug?error=your_error': 'Get debug for error'
      },
      sampleErrors: [
        'TypeError: undefined is not a function',
        'Objects are not valid as a React child',
        'window is not defined',
        'Hydration failed',
        'Too many re-renders'
      ]
    });
  }
  
  const result = autoDebugFromStack(error, fileName || undefined);
  const formattedResponse = formatDebugResponse(result);
  
  return NextResponse.json({
    ...result,
    response: formattedResponse
  });
}