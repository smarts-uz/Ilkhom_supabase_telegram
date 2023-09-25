// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {corsHeaders} from "../_shared/cors.ts";

interface  IFeedbackForm {
  name: string;
  phone: string;
  email: string;
}

async function _sendToTelegram(feedback: IFeedbackForm) {
  const TELEGRAM_TOKEN = Deno.env.get('TELEGRAM_TOKEN');
  const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
  const text = encodeURI(`name: ${feedback.name}\ntel: ${feedback.phone}\nemail: ${feedback.email}`);
  const req = new Request(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${text}`, {
    method: 'GET'
  });

  await fetch(req);
  return new Response(JSON.stringify({message: 'success'}), {
    headers: {...corsHeaders, 'Content-Type': 'application/json'},
    status: 200,
  });
}



serve(async (req) => {

  const { method } = req

  // This is needed if you're planning to invoke your function from a browser.
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let feedback = null
    if (method === 'POST' || method === 'PUT') {
      feedback = await req.json()
    }

    return _sendToTelegram(feedback);
  } catch (error) {
    console.error(error)

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
