import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  role: string;
  businessName?: string;
  workArea?: string;
  skills: string[];
  backgroundText?: string;
}

interface GeneratedProfile {
  aboutText: string;
  summary: string;
  skills: string[];
}

export async function generateProfileWithAI(
  profileData: ProfileData,
  style: "simple" | "detailed" = "simple"
): Promise<GeneratedProfile> {
  const stylePrompt = style === "detailed" 
    ? "כתוב טקסט מפורט ומקיף עם פרטים רבים על הניסיון והמומחיות"
    : "כתוב טקסט קצר, ברור ומקצועי";

  const prompt = `אתה עוזר כתיבה מקצועי בעברית. צור פרופיל עבודה מקצועי בעברית עבור:

שם: ${profileData.firstName} ${profileData.lastName}
תחום עבודה: ${profileData.role}
${profileData.businessName ? `שם העסק: ${profileData.businessName}` : ''}
${profileData.workArea ? `אזור עבודה: ${profileData.workArea}` : ''}
כישורים קיימים: ${profileData.skills.join(', ')}
${profileData.backgroundText ? `רקע נוסף: ${profileData.backgroundText}` : ''}

${stylePrompt}

החזר את התשובה בפורמט JSON עם השדות הבאים:
{
  "aboutText": "פסקה מקצועית על העובד (3-4 משפטים)",
  "summary": "תיאור קצר בשורה אחת",
  "skills": ["מערך של 4-6 כישורים/שירותים מקצועיים"]
}

חשוב: כתוב בעברית בלבד, בגוף ראשון, בטון מקצועי וידידותי.`;

  try {
    const openai = getOpenAIClient();
    console.log("Sending request to OpenAI with model: gpt-4.1");
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content) as GeneratedProfile;
    return parsed;
  } catch (error) {
    console.error("Error generating profile with AI:", error);
    throw new Error("Failed to generate profile with AI");
  }
}
