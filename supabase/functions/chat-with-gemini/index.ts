import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, message } = await req.json();
    console.log('Received request:', { conversationId, message });

    // Get auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id);

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    console.log('Fetched conversation history:', messages?.length || 0, 'messages');

    // Build conversation history for Lovable AI (OpenAI format)
    const conversationHistory = messages?.map(m => ({
      role: m.role,
      content: m.content
    })) || [];

    // Add new user message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    // Call Lovable AI Gateway
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI...');
    const aiResponse = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: conversationHistory,
          temperature: 0.9,
          max_tokens: 2048,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      // Handle specific error codes
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue using the chatbot.');
      }
      throw new Error('Failed to get AI response. Please try again.');
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    const assistantMessage = aiData.choices?.[0]?.message?.content || 'No response generated';

    // Save both messages to database
    const { error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message
      });

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      throw userMsgError;
    }

    const { error: assistantMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantMessage
      });

    if (assistantMsgError) {
      console.error('Error saving assistant message:', assistantMsgError);
      throw assistantMsgError;
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    console.log('Messages saved successfully');

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        conversationId 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in chat-with-gemini function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
