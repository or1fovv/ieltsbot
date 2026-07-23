import Groq from 'groq-sdk';
import config from '../config/env.js';

const groq = new Groq({ apiKey: config.groqApiKey });

// =============================================
// System promptlar
// =============================================

const TOPIC_GENERATION_SYSTEM = `Sen IELTS va CEFR bo'yicha tajribali examiner va o'qituvchisan. Sening vazifang — yangi, qiziqarli, takrorlanmagan test mavzularini yaratish.

Qoidalar:
1. Mavzu haqiqiy IELTS/CEFR imtihon formatiga mos bo'lsin
2. Mavzu aniq, tushunarli va qiziqarli bo'lsin
3. Daraja (level) ga mos murakkablikda bo'lsin
4. FAQAT toza JSON formatda javob qaytar, boshqa hech narsa yozma
5. JSON dan oldin va keyin hech qanday matn bo'lmasin`;

const WRITING_EVALUATION_SYSTEM = `Sen IELTS/CEFR rasmiy examiner sifatida ishlaysan. Foydalanuvchi yozgan essay/writing javobini rasmiy mezonlar asosida baholab, FAQAT quyidagi JSON formatda javob qaytar. Boshqa hech qanday matn yozma, faqat toza JSON:

{
  "band_score": number,
  "cefr_level": "string (A1-C2)",
  "criteria": {
    "task_achievement": {"score": number, "comment": "string (o'zbek tilida)"},
    "coherence_cohesion": {"score": number, "comment": "string (o'zbek tilida)"},
    "lexical_resource": {"score": number, "comment": "string (o'zbek tilida)"},
    "grammar": {"score": number, "comment": "string (o'zbek tilida)"}
  },
  "strengths": ["string (o'zbek tilida, kamida 2 ta)"],
  "errors": [{"original": "string", "correction": "string", "explanation": "string (o'zbek tilida)"}],
  "improved_version": "string (yaxshilangan versiya ingliz tilida)",
  "recommendations": ["string (o'zbek tilida, 2-3 ta amaliy tavsiya)"]
}

band_score: 0.5 qadam bilan, 4.0 dan 9.0 gacha bo'lsin.
Mezonlar 0-9 oralig'ida baholansin.
Xatolarni batafsil ko'rsat.`;

const SPEAKING_EVALUATION_SYSTEM = `Sen IELTS/CEFR rasmiy examiner sifatida ishlaysan. Foydalanuvchining speaking transkriptsiyasini baholab, FAQAT quyidagi JSON formatda javob qaytar. Boshqa hech qanday matn yozma, faqat toza JSON:

{
  "band_score": number,
  "cefr_level": "string (A1-C2)",
  "criteria": {
    "fluency_coherence": {"score": number, "comment": "string (o'zbek tilida)"},
    "lexical_resource": {"score": number, "comment": "string (o'zbek tilida)"},
    "grammar": {"score": number, "comment": "string (o'zbek tilida)"},
    "pronunciation": {"score": number, "comment": "string (o'zbek tilida, transkriptsiya asosida taxminiy)"}
  },
  "strengths": ["string (o'zbek tilida, kamida 2 ta)"],
  "errors": [{"original": "string", "correction": "string", "explanation": "string (o'zbek tilida)"}],
  "improved_version": "string (yaxshilangan versiya ingliz tilida)",
  "recommendations": ["string (o'zbek tilida, 2-3 ta amaliy tavsiya)"]
}

band_score: 0.5 qadam bilan, 4.0 dan 9.0 gacha bo'lsin.`;

// =============================================
// Yordamchi: JSON ajratib olish
// =============================================

function extractJSON(text) {
  // Markdown code block
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return JSON.parse(codeBlock[1].trim());
  // To'g'ridan-to'g'ri JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI javobida JSON topilmadi');
  return JSON.parse(jsonMatch[0]);
}

async function chatCompletion(systemPrompt, userPrompt, maxTokens = 2048) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  });
  return completion.choices[0]?.message?.content || '';
}

// =============================================
// Topic Generation
// =============================================

export async function generateTopic({ type, subtype, levelSystem, level, usedTopics = [] }) {
  const usedList = usedTopics.length > 0
    ? `\n\nQuyidagi mavzulardan FOYDALANMA:\n${usedTopics.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
    : '';

  let formatDescription = '';
  if (type === 'speaking') {
    if (subtype === 'part1') formatDescription = 'IELTS Speaking Part 1: Oddiy, shaxsiy savol. 3-4 ta bog\'liq sub-savol.';
    else if (subtype === 'part2') formatDescription = 'IELTS Speaking Part 2: Cue card. Mavzu + 4 ta bullet point. 1-2 daqiqa.';
    else formatDescription = 'IELTS Speaking Part 3: Abstrakt, chuqur savol. 2-3 ta bog\'liq savol.';
  } else {
    if (subtype === 'task1') formatDescription = 'IELTS Writing Task 1: Grafik/diagramma tavsifi. Kamida 150 so\'z.';
    else formatDescription = 'IELTS Writing Task 2: Essay. Fikr/muammo muhokamasi. Kamida 250 so\'z.';
  }

  const userPrompt = `Yangi ${type === 'speaking' ? 'Speaking' : 'Writing'} test mavzusi yarat.
Format: ${formatDescription}
Daraja tizimi: ${levelSystem.toUpperCase()}
Daraja: ${level}

Faqat JSON formatda javob ber:
{
  "topic_text": "string (ingliz tilida)",
  "instructions": "string (o'zbek tilida)",
  "time_limit_minutes": number,
  "word_limit": number yoki null
}${usedList}`;

  try {
    const text = await chatCompletion(TOPIC_GENERATION_SYSTEM, userPrompt, 1024);
    return extractJSON(text);
  } catch (error) {
    console.error('Topic generation error:', error);
    throw new Error(`Mavzu generatsiyada xato: ${error.message}`);
  }
}

// =============================================
// Writing Evaluation
// =============================================

export async function evaluateWriting({ topicText, answer, subtype, levelSystem, language = 'uz' }) {
  const langInstruction = language === 'uz'
    ? "Barcha izohlar va tavsiyalarni O'ZBEK tilida yoz."
    : language === 'ru'
      ? "Все комментарии на РУССКОМ языке."
      : "Write all comments in ENGLISH.";

  const userPrompt = `Mavzu: ${topicText}
Turi: ${subtype === 'task1' ? 'Writing Task 1' : 'Writing Task 2'}
Daraja tizimi: ${levelSystem.toUpperCase()}

Foydalanuvchi javobi:
---
${answer}
---

${langInstruction}
So'z soni: ${answer.split(/\s+/).length}
${subtype === 'task1' ? 'Min 150 so\'z.' : 'Min 250 so\'z.'}

Faqat JSON qaytar.`;

  try {
    const text = await chatCompletion(WRITING_EVALUATION_SYSTEM, userPrompt, 2048);
    return extractJSON(text);
  } catch (error) {
    console.error('Writing evaluation error:', error);
    throw new Error(`Writing baholashda xato: ${error.message}`);
  }
}

// =============================================
// Speaking Evaluation
// =============================================

export async function evaluateSpeaking({ topicText, transcript, subtype, levelSystem, language = 'uz' }) {
  const langInstruction = language === 'uz'
    ? "Barcha izohlar va tavsiyalarni O'ZBEK tilida yoz."
    : language === 'ru'
      ? "Все комментарии на РУССКОМ языке."
      : "Write all comments in ENGLISH.";

  const userPrompt = `Mavzu: ${topicText}
Turi: Speaking ${subtype.replace('part', 'Part ')}
Daraja tizimi: ${levelSystem.toUpperCase()}

Transkriptsiya:
---
${transcript}
---

${langInstruction}
Eslatma: Bu ovozli javobning matni. Pronunciation bahosini matn asosida taxminiy ber.

Faqat JSON qaytar.`;

  try {
    const text = await chatCompletion(SPEAKING_EVALUATION_SYSTEM, userPrompt, 2048);
    return extractJSON(text);
  } catch (error) {
    console.error('Speaking evaluation error:', error);
    throw new Error(`Speaking baholashda xato: ${error.message}`);
  }
}

// =============================================
// Diagnostik test
// =============================================

export async function generateDiagnosticQuestion(questionNumber, previousAnswers = '') {
  const userPrompt = `Diagnostik test uchun ${questionNumber}-savol yarat (jami 5 ta).

${previousAnswers ? `Oldingi javoblar:\n${previousAnswers}\n` : ''}

JSON formatda:
{
  "question": "string (ingliz tilida)",
  "instruction": "string (o'zbek tilida)",
  "difficulty": "string (A1/A2/B1/B2/C1)",
  "expected_answer_type": "string (short_text/sentence/paragraph)"
}`;

  try {
    const text = await chatCompletion(TOPIC_GENERATION_SYSTEM, userPrompt, 512);
    return extractJSON(text);
  } catch (error) {
    console.error('Diagnostic question error:', error);
    throw new Error(`Diagnostik savol xato: ${error.message}`);
  }
}

export async function evaluateDiagnostic(questionsAndAnswers) {
  const userPrompt = `Quyidagi diagnostik javoblarni baholab, ingliz tili darajasini aniqla:

${questionsAndAnswers.map((qa, i) => `Savol ${i + 1}: ${qa.question}\nJavob: ${qa.answer}`).join('\n\n')}

JSON formatda:
{
  "ielts_level": "string (4.0-9.0, 0.5 qadam)",
  "cefr_level": "string (A1-C2)",
  "summary": "string (o'zbek tilida)",
  "strengths": ["string"],
  "weaknesses": ["string"]
}`;

  try {
    const text = await chatCompletion(TOPIC_GENERATION_SYSTEM, userPrompt, 512);
    return extractJSON(text);
  } catch (error) {
    console.error('Diagnostic evaluation error:', error);
    throw new Error(`Diagnostik baholashda xato: ${error.message}`);
  }
}

export default {
  generateTopic,
  evaluateWriting,
  evaluateSpeaking,
  generateDiagnosticQuestion,
  evaluateDiagnostic,
};
