from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

# Replace with your actual API key
API_KEY = "AIzaSyBkZFmHF3JjZCP4C1fxgYsjfSz6JdVBWZs"
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

@app.route('/topic', methods=['POST'])
def receive_topic():
    data = request.get_json()
    topic = data.get('topic', '')
    print(f"[Module 1] Received topic: {topic}")
    return jsonify({"message": f"Topic '{topic}' received successfully."})


@app.route('/explanation', methods=['POST'])
def explain_topic():
    data = request.get_json()
    topic = data.get('topic', '')

    def get_response(level):
        prompt = (
            f"Explain the computer science topic '{topic}' in 4-5 bullet points. "
            f"The explanation should be designed for a {level} learner. "
            f"Each bullet point should focus on a key concept and be clear and concise."
        )

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "candidateCount": 1,
                "topP": 1
            }
        }

        try:
            response = requests.post(f"{API_URL}?key={API_KEY}", headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            if "candidates" in result and len(result["candidates"]) > 0 and "content" in result["candidates"][0] and "parts" in result["candidates"][0]["content"] and len(result["candidates"][0]["content"]["parts"]) > 0 and "text" in result["candidates"][0]["content"]["parts"][0]:
                return result["candidates"][0]["content"]["parts"][0]["text"]
            else:
                print(f"[Error] Unexpected API response for {level} level: {result}")
                return f"Error processing API response for {level} level."
        except requests.exceptions.RequestException as e:
            print(f"[Error] API failed for {level} level: {e}")
            return f"Error generating explanation for {level} level."
        except KeyError as e:
            print(f"[Error] Key error in API response for {level} level: {e}, Response: {result}")
            return f"Error processing API response for {level} level."
        except Exception as e:
            print(f"[Error] An unexpected error occurred for {level} level: {e}")
            return f"Error generating explanation for {level} level."

    beginner = get_response("beginner")
    intermediate = get_response("intermediate")
    advanced = get_response("advanced")

    return jsonify({
        "beginner": beginner,
        "intermediate": intermediate,
        "advanced": advanced
    })


@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.get_json()
    topic = data.get('topic', '')

    def get_quiz(level):
        prompt = (
            f"Generate 3 to 5 multiple choice questions (MCQs) on the topic '{topic}' "
            f"for a {level} learner. Format as JSON like:\n"
            "[\n"
            "  {\n"
            '    "question": "What is...",\n'
            '    "options": {"A": "...", "B": "...", "C": "...", "D": "..."},'
            '    "answer": "B"\n'
            "  }\n"
            "]"
        )

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "candidateCount": 1,
                "topP": 1
            }
        }

        try:
            response = requests.post(f"{API_URL}?key={API_KEY}", headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            text = result["candidates"][0]["content"]["parts"][0]["text"].strip()

            print(f"[Debug] Raw quiz text for {level}:\n{text}")

            # Remove potential leading ```json and ```
            if text.startswith("```json"):
                text = text[len("```json"):].lstrip()
            elif text.startswith("```"):
                text = text[len("```"):].lstrip()

            # Remove potential trailing ```
            if text.endswith("```"):
                text = text[:-len("```")].rstrip()

            try:
                quiz = json.loads(text)
                return quiz
            except json.JSONDecodeError as e:
                print(f"[Error] JSON decoding failed for {level} level after cleanup: {e}")
                print(f"[Error] Faulty JSON string after cleanup: {text}")
                return []

        except requests.exceptions.RequestException as e:
            print(f"[Error] Quiz generation failed for {level} level (request error): {e}")
            return []
        except KeyError as e:
            print(f"[Error] Quiz generation failed for {level} level (key error in response): {e}, Response: {result}")
            return []
        except Exception as e:
            print(f"[Error] Quiz generation failed for {level} level (other error): {e}")
            return []

    beginner_quiz = get_quiz("beginner")
    intermediate_quiz = get_quiz("intermediate")
    advanced_quiz = get_quiz("advanced")

    return jsonify({
        "beginner": beginner_quiz,
        "intermediate": intermediate_quiz,
        "advanced": advanced_quiz
    })
@app.route('/evaluate_answers', methods=['POST'])
def evaluate_answers():
    data = request.get_json()
    questions = data.get('questions', [])
    answers = data.get('answers', {})

    feedback_list = []

    for i, q in enumerate(questions):
        user_ans_key = answers.get(str(i)) or answers.get(i)
        correct_ans_key = q.get("answer")
        correct_text = q["options"].get(correct_ans_key, "")
        user_text = q["options"].get(user_ans_key, "Not answered")

        prompt = (
            f"Evaluate the following answer to a multiple-choice question on the topic '{q['question']}'.\n\n"
            f"Question: {q['question']}\n"
            f"Correct Answer: {correct_text} ({correct_ans_key})\n"
            f"User Selected: {user_text} ({user_ans_key})\n\n"
            "Evaluate based on:\n"
            "- Correctness (Is it correct or not?)\n"
            "- Technical Depth (Is the answer showing understanding?)\n"
            "- Clarity (Is the answer clear?)\n"
            "Then provide 1-2 sentence feedback.\n\n"
            "Format as JSON:\n"
            '{ "correctness": "...", "depth": "...", "clarity": "...", "comment": "..." }'
        )

        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "candidateCount": 1,
                "topP": 1
            }
        }

        try:
            response = requests.post(f"{API_URL}?key={API_KEY}", headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            raw_text = result["candidates"][0]["content"]["parts"][0]["text"]

            if raw_text.startswith("```json"):
                raw_text = raw_text[len("```json"):].strip()
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3].strip()

            feedback_json = json.loads(raw_text)
            feedback_list.append(feedback_json)
        except Exception as e:
            print(f"[Error] Evaluation failed for question {i}: {e}")
            feedback_list.append({
                "correctness": "Error",
                "depth": "Error",
                "clarity": "Error",
                "comment": "Failed to evaluate answer."
            })

    return jsonify({"feedback": feedback_list})
@app.route('/knowledge_profile', methods=['OPTIONS', 'POST'])
def knowledge_profile():
    # CORS preflight response for OPTIONS
    if request.method == 'OPTIONS':
        return '', 200  # Send an empty response with a 200 OK status for OPTIONS requests.

    # Handle POST request
    data = request.get_json()
    feedback_list = data.get('feedback', [])
    questions = data.get('questions', [])

    topics_mastered = []
    needs_improvement = []
    tips = []
    skill_scores = {"correctness": 0, "depth": 0, "clarity": 0}
    count = len(feedback_list)

    for i, feedback in enumerate(feedback_list):
        question = questions[i]["question"]
        comment = feedback.get("comment", "")
        tips.append(f"- {comment}")

        # Categorize based on correctness
        if feedback.get("correctness", "").lower() == "correct":
            topics_mastered.append(question)
        else:
            needs_improvement.append(question)

        # Score accumulation (1 if positive, 0 otherwise)
        skill_scores["correctness"] += 1 if feedback.get("correctness", "").lower() == "correct" else 0
        skill_scores["depth"] += 1 if feedback.get("depth", "").lower() in ["good", "high", "strong"] else 0
        skill_scores["clarity"] += 1 if feedback.get("clarity", "").lower() in ["clear", "high", "strong"] else 0

    # Normalize skill scores to percentage
    for key in skill_scores:
        skill_scores[key] = round((skill_scores[key] / count) * 100, 1)

    return jsonify({
        "topics_mastered": topics_mastered,
        "needs_improvement": needs_improvement,
        "tips": tips,
        "skills_chart": skill_scores
    })



if __name__ == '__main__':
    app.run(debug=True)