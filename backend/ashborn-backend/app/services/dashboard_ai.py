
import json
from openai import OpenAI

client = OpenAI()


def generate_dashboard_data(goal: str, rank: str, discipline_score: int, alignment_score: int):
    """
    Generate initial dashboard data for a newly onboarded user.

    Returns:
    {
        tasks: [],
        objective: {},
        alignment_percent: number,
        system_logs: []
    }
    """

    SYSTEM_PROMPT = """
You are a system engine for a progression-based life system.

You analyze a user's declared goal and generate:

1. Daily tasks aligned with the goal
2. A primary objective
3. Alignment percentage
4. System log messages

Rules:
- Tasks should be realistic actions toward the goal
- XP should represent effort level
- System messages should sound analytical and system-like
- Return STRICT JSON

JSON format:
{
  "tasks": [
    {"label": "task", "xp": number}
  ],
  "objective": {
    "title": "string",
    "target": number,
    "progress": number
  },
  "alignment_percent": number,
  "system_logs": ["message"]
}

Return JSON only.
"""

    user_context = {
        "goal": goal,
        "rank": rank,
        "discipline_score": discipline_score,
        "alignment_score": alignment_score
    }

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(user_context)}
        ],
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content

    try:
        parsed = json.loads(content)
    except Exception as e:
        print("Dashboard AI parse error:", e)
        print("Raw response:", content)

        # fallback safe structure
        return {
            "tasks": [
                {"label": "Work toward your goal", "xp": 10}
            ],
            "objective": {
                "title": goal,
                "target": 100,
                "progress": 0
            },
            "alignment_percent": alignment_score,
            "system_logs": [
                "SYSTEM INITIALIZED.",
                "PLAYER DATA REGISTERED."
            ]
        }

    return parsed