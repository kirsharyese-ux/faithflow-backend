import { createClient } from '@supabase/supabase-js';
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";
import Stripe from "stripe";

console.log("🚀 SERVER FILE EXECUTING");

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = data.user;

    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Auth failed' });
  }
};

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('📡 REQUEST HIT:', req.method, req.url);
  next();
});

console.log("📡 REGISTERING ROUTES...");

// POST "/api/webhook" route
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const userId = session.metadata.user_id;

    await supabase.from('profiles').upsert([
      {
        id: userId,
        is_pro: true,
      },
    ]);
  }

  res.json({ received: true });
});

// POST "/api/create-checkout-session" route
app.post('/api/create-checkout-session', authenticateUser, async (req, res) => {
  console.log('🚀 Checkout hit');
  console.log('Headers:', req.headers);
  console.log('User:', req.user);

  try {
    const user = req.user;

    if (!user) {
      console.error('❌ No user found on request');
      return res.status(401).json({ error: 'No user' });
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: 'https://faithflow-backend-v8c5.onrender.com/success',
        cancel_url: 'https://faithflow-backend-v8c5.onrender.com/cancel',
        metadata: {
          user_id: user.id,
        },
      });

      console.log('✅ Stripe URL:', session.url);
    } catch (err) {
      console.error('❌ STRIPE ERROR FULL:', err);
      return res.status(500).json({ error: err?.message || 'Stripe session creation failed' });
    }

    if (!session?.url) {
      console.error('❌ Stripe session has no URL:', session);
      return res.status(500).json({ error: 'Stripe session created without URL' });
    }

    return res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Checkout route error:', err);
    return res.status(500).json({ error: err?.message || 'Checkout route error' });
  }
});

// GET "/" route
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// GET "/version" route
app.get("/version", (req, res) => {
  res.send("NEW VERSION LIVE");
});

// GET "/api/ping" route
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// GET "/routes" route
app.get("/routes", (req, res) => {
  res.json({
    routes: [
      "GET /",
      "GET /version",
      "GET /api/ping",
      "GET /routes",
      "POST /api/ai/chat",
      "POST /api/create-checkout-session",
      "POST /api/webhook"
    ]
  });
});

app.get('/success', (_req, res) => {
  res.send('Checkout successful. Thank you!');
});

app.get('/cancel', (_req, res) => {
  res.send('Checkout canceled. You can try again.');
});

// POST "/api/ai/chat" route
app.post("/api/ai/chat", authenticateUser, async (req, res) => {
  try {
    const user = req.user;
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    // Check subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single();

    // Enforce usage limit for free users
    if (!profile?.is_pro) {
      const { count, error: countError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user');

      if (countError) {
        console.error(countError);
        return res.status(500).json({ error: 'Count failed' });
      }

      if (count >= 50) {
        return res.status(403).json({
          error: 'Free limit reached (50 messages). Upgrade to continue.',
        });
      }
    }

    // 👇 fallback if no API key
    if (!process.env.OPENAI_API_KEY) {
      const reply = "Test mode: " + message;

      // Save messages
      await supabase.from('messages').insert([
        { user_id: user.id, role: 'user', text: message },
        { user_id: user.id, role: 'ai', text: reply },
      ]);

      return res.json({
        reply
      });
    }

    // 👇 real AI call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful Christian Bible assistant. Give thoughtful, scripture-based responses."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const reply = completion.choices[0].message.content;

    // Save messages
    await supabase.from('messages').insert([
      { user_id: user.id, role: 'user', text: message },
      { user_id: user.id, role: 'ai', text: reply },
    ]);

    return res.json({
      reply
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "AI request failed"
    });
  }
});

// Fallback middleware for 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});