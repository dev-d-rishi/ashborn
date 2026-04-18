import os
from openai import OpenAI

# Initialize client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are an elite strategic evaluator AI inside a high-performance life operating system.

A user has declared a life goal.
Your task is to generate exactly 4 highly intelligent, REAL-WORLD evaluation questions
that measure the user's CURRENT POSITION relative to that goal.

These questions must NOT be motivational or generic.
They must feel like a serious capability assessment.

DO NOT generate psychological or identity questions.
Those are handled separately by the system.

Your 4 questions must strictly follow this structure:

1. CURRENT CAPABILITY
   - Measure the user's actual present skill, strength, knowledge, or status
   - Must be measurable or comparable

2. RESOURCES / ACCESS
   - Tools, environment, money, mentors, infrastructure, network
   - What advantage or limitation exists

3. GAP / REALITY CHECK
   - How far user is from elite level in that domain
   - Forces honest self-assessment

4. EXECUTION / STRATEGY
   - What system, plan, or structure user is currently following
   - Reveals seriousness vs fantasy

Rules:
- Questions must be domain-specific to the user's goal
- Avoid generic productivity questions
- Avoid repeating psychological questions
- Make questions feel like an elite coach or analyst is asking
- Prefer measurable answers
- Use types: text, number, choice, slider

Output STRICT JSON format:
{
  "questions": [
    {
      "id": 1,
      "type": "number | text | choice | slider",
      "question": "...",
      "options": ["..."]
    }
  ]
}

Return ONLY JSON. No explanation. No markdown.
"""


def generate_dynamic_questions(goal: str):
    """
    Calls OpenAI and generates 4 goal-specific evaluation questions
    Compatible with older OpenAI SDK versions
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"User goal: {goal}\nReturn ONLY valid JSON."}
        ],
        response_format={"type": "json_object"}
    )

    import json

    content = response.choices[0].message.content
    try:
        parsed = json.loads(content)
    except Exception as e:
        print("AI RAW RESPONSE:", content)
        print("JSON PARSE ERROR:", e)
        return []

    # Debug print to inspect structure
    print("AI PARSED RESPONSE:", parsed)

    # If model didn't wrap inside "questions", attempt fallback
    if isinstance(parsed, list):
        return parsed

    if "questions" in parsed:
        return parsed["questions"]

    # Unexpected structure
    print("Unexpected AI response structure")
    return []


def evaluate_user_answers(goal: str, answers: list):
    """
    Sends user answers to OpenAI judge and returns:
    - discipline_score (0-100)
    - alignment_score (0-100)
    - rank (E, D, C, B, A, S)
    - verdict (short AI system message)
    """

    EVAL_SYSTEM_PROMPT = """
You are an elite performance evaluation system.

You analyze a user's goal and their answers to a deep evaluation.
Your job is to judge them like a cold, intelligent system — not a motivational coach.

Return a psychological + execution assessment.

You must calculate:
1. discipline_score (0-100)
2. alignment_score (0-100)
3. rank based on discipline:
   0-29 = E
   30-49 = D
   50-64 = C
   65-79 = B
   80-89 = A
   90-100 = S
4. verdict (short 2-3 line system evaluation message)

Rules:
- Be analytical, calm, and slightly intimidating
- No motivational fluff
- No emojis
- Sound like an elite system analyzing a player

Return STRICT JSON:
{
  "discipline_score": number,
  "alignment_score": number,
  "rank": "E|D|C|B|A|S",
  "verdict": "text"
}

Return ONLY JSON.
"""

    import json

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": EVAL_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"User goal: {goal}\nUser answers: {json.dumps(answers)}"
            }
        ],
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content

    try:
        parsed = json.loads(content)
    except Exception as e:
        print("EVALUATION RAW:", content)
        print("PARSE ERROR:", e)
        return {
            "discipline_score": 0,
            "alignment_score": 0,
            "rank": "E",
            "verdict": "Evaluation failed"
        }

    print("AI EVALUATION:", parsed)

    return parsed

SYSTEM_EVALUATION_PROMPT = """
You are an elite strategic evaluator AI inside a high-performance life operating system.

A user has declared a life goal.
Your task is to generate 8 to 10 highly intelligent, REAL-WORLD evaluation questions
that deeply measure the user's CURRENT POSITION relative to that goal.

Your questions must fall into these categories:
1. DISCIPLINE
2. PHYSICAL STATE
3. MINDSET
4. HABITS

Rules:
- Questions must be domain-specific to the user's goal.
- Make questions feel like an elite coach or analyst is asking.
- Use types: text, number, choice, slider.

Output STRICT JSON format:
{
  "questions": [
    {
      "id": 1,
      "type": "number | text | choice | slider",
      "question": "...",
      "options": ["...", "..."] 
    }
  ]
}

Return ONLY JSON. No explanation. No markdown.
"""

def generate_system_evaluation_questions(goal: str):
    """
    Calls OpenAI and generates 8-10 goal-specific evaluation questions for the system generator.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_EVALUATION_PROMPT},
            {"role": "user", "content": f"User goal: {goal}\nReturn ONLY valid JSON."}
        ],
        response_format={"type": "json_object"}
    )

    import json
    content = response.choices[0].message.content
    try:
        parsed = json.loads(content)
        if "questions" in parsed:
            return parsed["questions"]
        return parsed if isinstance(parsed, list) else []
    except Exception as e:
        print("AI JSON PARSE ERROR:", e)
        return []


def generate_daily_protocol(goal: str, discipline_score: int, alignment_score: int, consistency: float = 100.0, streak: int = 1):
    """
    Generate 5-7 daily tasks with XP based on user profile, dynamically adapting to laziness/streak.
    """
    lazy_modifier = ""
    if consistency < 50 or streak == 0:
        lazy_modifier = "LAZINESS DETECTED/MOMENTUM BROKEN. User execution is failing. Generate lower-friction (easier) tasks to rebuild momentum but use harsh, aggressive task labels and designate a RECOVERY focus_area."

    PROTOCOL_PROMPT = f"""
You are the central intelligence of a high-performance life operating system.
A user needs their daily protocol (5-7 tasks) to achieve their goal.
You are given their goal, discipline score, and alignment score.

CONTEXT MODIFIER: {lazy_modifier}

Design tasks that:
1. Build their discipline if it is low.
2. Advance their goal directly.
3. Adapt difficulty to context modifiers.
4. Include 1 physical or mental foundation task.

Requirements:
- Task label must be actionable and concise.
- Assign XP to each task (e.g., 10, 20, 50) based on difficulty. Total XP should be ~100-200.
- Provide a 'focus_area' for the day (e.g., 'Core Infrastructure', 'Mental Endurance').

Return STRICT JSON:
{
  "focus_area": "String",
  "tasks": [
    {
      "label": "String",
      "xp": number
    }
  ]
}
"""
    import json
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": PROTOCOL_PROMPT},
            {
                "role": "user",
                "content": f"Goal: {goal}\nDiscipline: {discipline_score}\nAlignment: {alignment_score}\nConsistency: {consistency}%\nStreak: {streak}"
            }
        ],
        response_format={"type": "json_object"}
    )
    
    content = response.choices[0].message.content
    try:
        parsed = json.loads(content)
        return parsed
    except Exception as e:
        print("PROTOCOL PARSE ERROR:", e)
        return {"focus_area": "Basic Alignment", "tasks": []}


def generate_daily_feedback(completed: int, uncompleted: int, new_discipline: int, new_alignment: int, rank: str):
    """
    Generate System Evaluation for End Of Day Protocol.
    """
    FEEDBACK_PROMPT = """
You are the central intelligence of a high-performance life operating system.
Analyze the user's daily performance.

Provide STRICT JSON output:
{
  "system_message": "General system verdict (2-3 sentences)",
  "feedback": "Specific feedback on completion rate",
  "warnings": "Warnings regarding missed targets or slipping discipline",
  "improvement_suggestions": "Bullet points for tomorrow's protocol optimization"
}

Sound calculated, slightly intimidating, but analytical.
"""
    import json
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": FEEDBACK_PROMPT},
            {
                "role": "user",
                "content": f"Completed: {completed}\nMissed: {uncompleted}\nDiscipline: {new_discipline}\nAlignment: {new_alignment}\nRank: {rank}"
            }
        ],
        response_format={"type": "json_object"}
    )
    
    content = response.choices[0].message.content
    try:
        parsed = json.loads(content)
        return parsed
    except Exception as e:
        print("FEEDBACK PARSE ERROR:", e)
        return {
            "system_message": "EOD evaluation processed.",
            "feedback": "Data recorded.",
            "warnings": "None.",
            "improvement_suggestions": "Continue protocol execution."
        }


def evaluate_system_submitted_answers(goal: str, answers: list):
    """
    Sends user answers to OpenAI judge and returns:
    - discipline_score (0-100)
    - alignment_score (0-100)
    - rank (E, D, C, B, A, S)
    - system_message (short AI system message / verdict)
    """

    SYSTEM_EVAL_PROMPT = """
You are an elite performance evaluation system.

You analyze a user's goal and their answers to a deep evaluation.
Your job is to judge them like a cold, intelligent system — not a motivational coach.

Return a psychological + execution assessment.

You must calculate:
1. discipline_score (0-100)
2. alignment_score (0-100)
3. rank based on discipline:
   0-29 = E
   30-49 = D
   50-64 = C
   65-79 = B
   80-89 = A
   90-100 = S
4. system_message (short 2-3 line system evaluation message)

Rules:
- Be analytical, calm, and slightly intimidating
- No motivational fluff
- No emojis
- Sound like an elite system analyzing a player

Return STRICT JSON:
{
  "discipline_score": number,
  "alignment_score": number,
  "rank": "E|D|C|B|A|S",
  "system_message": "text"
}

Return ONLY JSON.
"""
    import json
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_EVAL_PROMPT},
            {
                "role": "user",
                "content": f"User goal: {goal}\nUser answers: {json.dumps(answers)}"
            }
        ],
        response_format={"type": "json_object"}
    )
    
    content = response.choices[0].message.content
    try:
        parsed = json.loads(content)
        return parsed
    except Exception as e:
        print("PARSE ERROR:", e)
        return {
            "discipline_score": 0,
            "alignment_score": 0,
            "rank": "E",
            "system_message": "Evaluation failed"
        }
