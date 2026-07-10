import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
import * as auth from "./auth.ts";
import * as social from "./social.ts";
import * as audioLibrary from "./audio_library.ts";

/** Must match folder name and Supabase deploy slug */
const FUNCTION_NAME = "make-server-b89d4352";
const app = new Hono().basePath(`/${FUNCTION_NAME}`);

function getSessionToken(c: { req: { header: (name: string) => string | undefined } }) {
  return c.req.header("X-Chirp-Session") || undefined;
}

async function requireUser(c: { req: { header: (name: string) => string | undefined } }) {
  const token = getSessionToken(c);
  const user = await auth.getUserFromToken(token);
  if (!user) return null;
  return user;
}

app.use("*", logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Chirp-Session"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/health", (c) => {
  return c.json({ status: "ok", function: FUNCTION_NAME });
});

/** Verifies KV table + service role (call after deploy) */
app.get("/health/db", async (c) => {
  try {
    const probeKey = "__health_probe__";
    await kv.set(probeKey, { ok: true, at: new Date().toISOString() });
    const v = await kv.get(probeKey);
    await kv.del(probeKey);
    return c.json({ status: "ok", kv: true, probe: v });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("health/db error:", detail);
    return c.json({ status: "error", kv: false, detail }, 500);
  }
});

app.post("/newsletter", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email || !email.includes("@")) {
      return c.json({ error: "Invalid email address" }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      return c.json({ error: "Server configuration error" }, 500);
    }

    const notificationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Chirp Newsletter <onboarding@resend.dev>",
        to: ["juliezhu.ziyang@gmail.com"],
        subject: "New Chirp Newsletter Subscription",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f97316;">New Newsletter Subscription</h2>
            <p>Someone has subscribed to the Chirp newsletter!</p>
            <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
                Subscribed at: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!notificationResponse.ok) {
      const error = await notificationResponse.text();
      console.error("Resend API error (notification):", error);
      return c.json({ error: "Failed to send notification email" }, 500);
    }

    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Chirp <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Chirp! 🦜",
        html: `<p>Thank you for subscribing to Chirp's newsletter.</p>`,
      }),
    });

    if (!confirmationResponse.ok) {
      console.error("Confirmation email failed but subscription was recorded");
    }

    await kv.set(`newsletter:${email}`, {
      email,
      subscribedAt: new Date().toISOString(),
    });

    return c.json({ success: true, message: "Successfully subscribed to newsletter!" });
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return c.json({ error: "Failed to process subscription" }, 500);
  }
});

app.post("/auth/register", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }
    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }
    const result = await auth.registerUser(email, password, name);
    return c.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return c.json({ error: "An account with this email already exists" }, 409);
    }
    const detail = error instanceof Error ? error.message : String(error);
    console.error("Register error:", detail);
    return c.json(
      {
        error: "Failed to create account",
        detail,
      },
      500,
    );
  }
});

app.post("/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    const result = await auth.loginUser(email, password);
    return c.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return c.json({ error: "Invalid email or password" }, 401);
    }
    console.error("Login error:", error);
    return c.json({ error: "Failed to sign in" }, 500);
  }
});

app.post("/auth/logout", async (c) => {
  const token = getSessionToken(c);
  if (token) {
    try {
      await auth.logoutUser(token);
    } catch (e) {
      console.error("Logout error:", e);
    }
  }
  return c.json({ success: true });
});

app.get("/auth/me", async (c) => {
  const token = getSessionToken(c);
  const user = await auth.getUserFromToken(token);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return c.json({ user });
});

app.put("/auth/profile", async (c) => {
  const token = getSessionToken(c);
  const currentUser = await auth.getUserFromToken(token);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const user = await auth.updateUserProfile(currentUser.id, {
      name: body.name,
      onboardingCompleted: body.onboardingCompleted,
      ownsParrot: body.ownsParrot,
      bird: body.bird,
      needs: body.needs,
      avatar: body.avatar,
    });
    return c.json({ user });
  } catch (error) {
    console.error("Profile update error:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

app.post("/auth/onboarding", async (c) => {
  const token = getSessionToken(c);
  const currentUser = await auth.getUserFromToken(token);
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const user = await auth.updateUserProfile(currentUser.id, {
      onboardingCompleted: true,
      ownsParrot: body.ownsParrot ?? null,
      bird: body.bird ?? null,
      needs: body.needs ?? [],
    });
    return c.json({ user });
  } catch (error) {
    console.error("Onboarding error:", error);
    return c.json({ error: "Failed to save onboarding" }, 500);
  }
});

app.get("/auth/register", (c) => {
  return c.json({
    ok: true,
    message: "Auth route is deployed. Use POST with { email, password, name } to register.",
  });
});

// --- Community ---
app.get("/community/posts", async (c) => {
  const posts = await social.getCommunityPosts();
  return c.json({ posts });
});

app.post("/community/posts", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.json();
    const post = await social.createCommunityPost(user.id, body);
    return c.json({ post });
  } catch (e) {
    console.error("create post:", e);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

app.post("/community/posts/:postId/comments", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const postId = c.req.param("postId");
    const { text } = await c.req.json();
    const comment = await social.addComment(user.id, postId, text);
    return c.json({ comment });
  } catch (e) {
    console.error("comment:", e);
    return c.json({ error: "Failed to add comment" }, 500);
  }
});

// --- Friends ---
app.get("/friends", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const state = await social.getFriendsState(user.id);
  return c.json(state);
});

app.get("/friends/relationship/:otherUserId", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const otherUserId = c.req.param("otherUserId");
  const relationship = await social.getFriendRelationship(user.id, otherUserId);
  return c.json(relationship);
});

app.post("/friends/request", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const { toUserId } = await c.req.json();
    await social.sendFriendRequest(user.id, toUserId);
    return c.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return c.json({ error: msg }, 400);
  }
});

app.post("/friends/respond", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const { requestId, accept } = await c.req.json();
    const result = await social.respondFriendRequest(user.id, requestId, !!accept);
    return c.json(result);
  } catch (e) {
    return c.json({ error: "Failed to respond" }, 400);
  }
});

app.get("/friends/activity", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const activity = await social.getActivityFeed(user.id);
  return c.json({ activity });
});

app.post("/friends/activity", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.json();
    const type = body.type as "emotion_analysis" | undefined;
    if (type !== "emotion_analysis") {
      return c.json({ error: "Invalid activity type" }, 400);
    }
    await social.recordActivity(user.id, {
      type: "emotion_analysis",
      emotion: body.emotion ?? null,
    });
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: "Failed to log activity" }, 500);
  }
});

app.get("/friends/messages/:otherUserId", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const otherUserId = c.req.param("otherUserId");
  const messages = await social.getMessagesAndMarkRead(user.id, otherUserId);
  return c.json({ messages });
});

app.post("/friends/mark-requests-seen", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const result = await social.markFriendRequestsSeen(user.id);
    return c.json(result);
  } catch (e) {
    return c.json({ error: "Failed to mark requests seen" }, 500);
  }
});

app.post("/friends/messages/:otherUserId", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const { text } = await c.req.json();
    const msg = await social.sendMessage(user.id, c.req.param("otherUserId"), text);
    return c.json({ message: msg });
  } catch (e) {
    return c.json({ error: "Failed to send message" }, 500);
  }
});

app.get("/users/:userId/public", async (c) => {
  try {
    const profile = await social.getPublicProfile(c.req.param("userId"));
    return c.json({ profile });
  } catch {
    return c.json({ error: "User not found" }, 404);
  }
});

// --- Audio library (social intervention) ---
app.get("/audio-library/intervention", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const excludeId = c.req.query("excludeId") || undefined;
    const clip = await audioLibrary.getRandomInterventionClip(excludeId);
    if (!clip) {
      return c.json({ error: "No verified positive clips available" }, 404);
    }
    return c.json({ clip });
  } catch (e) {
    console.error("audio-library intervention:", e);
    return c.json({ error: "Failed to load intervention clip" }, 500);
  }
});

app.get("/audio-library/positive", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const clips = await audioLibrary.listVerifiedPositiveClips();
    return c.json({ clips });
  } catch (e) {
    return c.json({ error: "Failed to list clips" }, 500);
  }
});

app.post("/audio-library", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.json();
    const clip = await audioLibrary.addAudioClip({
      title: body.title,
      description: body.description ?? "",
      emotion_label: body.emotion_label,
      validation_status: body.validation_status ?? "pending",
      audioUrl: body.audioUrl,
      species: body.species ?? null,
      durationSeconds: body.durationSeconds ?? null,
    });
    return c.json({ clip });
  } catch (e) {
    return c.json({ error: "Failed to add clip" }, 400);
  }
});

// --- Contribute & feedback ---
app.post("/contribute", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.json();
    const record = await social.submitContribution(user.id, {
      emotions: body.emotions ?? [],
      videoBase64: body.videoBase64,
      videoFilename: body.videoFilename,
      videoMime: body.videoMime,
    });
    return c.json({ success: true, record });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("contribute:", detail);
    return c.json({ error: "Failed to submit contribution", detail }, 500);
  }
});

app.post("/feedback", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const { text } = await c.req.json();
    const entry = await social.saveFeedback(user.id, text);
    return c.json({ success: true, entry });
  } catch (e) {
    return c.json({ error: "Failed to save feedback" }, 500);
  }
});

app.post("/feedback/analysis", async (c) => {
  const user = await requireUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  try {
    const body = await c.req.json();
    const entry = await social.saveAnalysisFeedback(user.id, {
      accurate: Boolean(body.accurate),
      predictedState: String(body.predictedState ?? ""),
      scores: {
        valence: Number(body.scores?.valence ?? 0),
        arousal: Number(body.scores?.arousal ?? 0),
        socialEngagement: Number(body.scores?.socialEngagement ?? 0),
      },
      birdProbability:
        body.birdProbability != null ? Number(body.birdProbability) : undefined,
      correctedEmotions: Array.isArray(body.correctedEmotions)
        ? body.correctedEmotions.map(String)
        : undefined,
      behaviorNotes: body.behaviorNotes ? String(body.behaviorNotes) : undefined,
      audioBase64: body.audioBase64 ? String(body.audioBase64) : undefined,
      audioFilename: body.audioFilename ? String(body.audioFilename) : undefined,
      audioMime: body.audioMime ? String(body.audioMime) : undefined,
    });
    return c.json({ success: true, entry });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error("feedback/analysis:", detail);
    return c.json({ error: "Failed to save analysis feedback", detail }, 500);
  }
});

Deno.serve(app.fetch);
