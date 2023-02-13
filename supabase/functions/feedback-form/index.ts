import {serve} from "https://deno.land/std@0.168.0/http/server.ts"
import {corsHeaders} from '../_shared/cors.ts'

interface IFeedbackForm {
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
