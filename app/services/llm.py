from __future__ import annotations

from typing import List, Dict, Any, AsyncGenerator
import os
import random
import asyncio
import json
from datetime import datetime

from ..config import get_settings


EMPATHETIC_SYSTEM_PROMPT = (
    "You are YUVA, a supportive, culturally-aware wellness companion for Indian youth. "
    "Communicate with warmth, validation, and non-judgment. Use simple, clear English with optional Hindi/Indian context if helpful. "
    "Do not diagnose. Encourage self-care, reflection, small actionable steps, and reaching trusted adults or professionals. "
    "If you detect crisis or self-harm risk, gently encourage contacting local helplines or emergency services. "
    "You have extensive knowledge about mental health, anxiety, depression, stress management, sleep issues, relationships, "
    "academic pressure, family dynamics, and crisis intervention. Provide empathetic, evidence-based support."
)

# Comprehensive mental health knowledge base
MENTAL_HEALTH_KNOWLEDGE = {
    "anxiety": {
        "symptoms": ["racing thoughts", "rapid heartbeat", "sweating", "restlessness", "worry", "panic"],
        "techniques": [
            "4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8",
            "5-4-3-2-1 grounding: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste",
            "Progressive muscle relaxation starting from your toes",
            "Mindful breathing focusing on the sensation of air entering and leaving"
        ],
        "responses": [
            "Anxiety can feel overwhelming, but you're not alone in this. Let's try some grounding techniques together.",
            "I can sense the anxiety in your words. Remember, anxiety is your body's way of trying to protect you, even when it feels too intense.",
            "Thank you for sharing this with me. Anxiety is very real and valid. What usually helps you feel a bit calmer?"
        ]
    },
    "depression": {
        "symptoms": ["sadness", "hopelessness", "fatigue", "loss of interest", "sleep changes", "appetite changes"],
        "techniques": [
            "Start with one small, achievable task each day",
            "Spend 10 minutes in sunlight or bright light",
            "Practice self-compassion - treat yourself as you would a good friend",
            "Connect with one person, even briefly"
        ],
        "responses": [
            "I can hear the heaviness in your words. Depression can make everything feel harder, but you're taking a brave step by reaching out.",
            "Thank you for trusting me with these feelings. Depression is real and treatable. You don't have to carry this alone.",
            "I'm here with you in this difficult moment. Even when it doesn't feel like it, this feeling is temporary."
        ]
    },
    "stress": {
        "symptoms": ["tension", "overwhelm", "irritability", "difficulty concentrating", "headaches", "muscle tension"],
        "techniques": [
            "Break large tasks into smaller, manageable steps",
            "Use the Pomodoro Technique: 25 minutes work, 5 minute break",
            "Practice saying 'no' to additional commitments when overwhelmed",
            "Take regular breaks to step away and breathe"
        ],
        "responses": [
            "Stress can feel like everything is happening at once. Let's break this down into manageable pieces.",
            "I can feel the pressure you're under. Stress is your body's response to demands, and it's okay to feel this way.",
            "You're dealing with a lot right now. What would feel most helpful - talking through it or learning some stress management techniques?"
        ]
    },
    "sleep": {
        "symptoms": ["insomnia", "restless sleep", "early waking", "difficulty falling asleep", "nightmares"],
        "techniques": [
            "Create a consistent bedtime routine 30-60 minutes before sleep",
            "Keep bedroom cool (65-68°F) and dark",
            "Avoid screens 1 hour before bed",
            "Try progressive muscle relaxation or body scan meditation"
        ],
        "responses": [
            "Sleep issues can affect everything else. Let's work on creating better sleep habits together.",
            "I understand how frustrating sleep problems can be. Good sleep is essential for mental health.",
            "Sleep difficulties are common, especially when we're stressed. What does your current bedtime routine look like?"
        ]
    },
    "relationships": {
        "symptoms": ["conflict", "loneliness", "communication issues", "trust problems", "social anxiety"],
        "techniques": [
            "Practice active listening - really hear what others are saying",
            "Use 'I' statements to express feelings without blame",
            "Set healthy boundaries to protect your emotional well-being",
            "Quality over quantity - nurture meaningful connections"
        ],
        "responses": [
            "Relationships can be complex and challenging. It's normal to have ups and downs with people we care about.",
            "Thank you for sharing this relationship concern. Healthy relationships require work from both sides.",
            "I can hear how much this relationship means to you. What would feel like a positive step forward?"
        ]
    },
    "academic_pressure": {
        "symptoms": ["exam anxiety", "perfectionism", "procrastination", "comparison with others", "fear of failure"],
        "techniques": [
            "Set realistic, achievable study goals",
            "Use active recall and spaced repetition for better learning",
            "Take regular breaks to prevent burnout",
            "Remember that grades don't define your worth as a person"
        ],
        "responses": [
            "Academic pressure is real, especially in competitive environments. Your worth isn't determined by your grades.",
            "I can feel the stress you're experiencing about your studies. Let's find some strategies that work for you.",
            "Education is important, but so is your mental health. How can we balance both?"
        ]
    },
    "crisis": {
        "indicators": ["self-harm", "suicide", "hopeless", "worthless", "ending it all", "no point", "better off dead"],
        "responses": [
            "I'm very concerned about you right now. Your life has value and meaning, even when it doesn't feel that way.",
            "Thank you for trusting me with these difficult feelings. Please know that you're not alone and help is available.",
            "These feelings are temporary, even though they feel overwhelming right now. Let's get you connected with immediate support."
        ],
        "resources": [
            "National Suicide Prevention Lifeline: 988 (US)",
            "Crisis Text Line: Text HOME to 741741",
            "International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/",
            "Your local emergency services: 911 (US), 112 (EU), or your local emergency number"
        ]
    }
}


def _mock_model(messages: List[Dict[str, str]]) -> str:
    user_msgs = [m.get("content", "") for m in messages if m.get("role") == "user"]
    last_user = (user_msgs[-1] if user_msgs else "").strip()
    last_user_l = last_user.lower()

    crisis_indicators = MENTAL_HEALTH_KNOWLEDGE["crisis"]["indicators"]
    if any(indicator in last_user_l for indicator in crisis_indicators):
        crisis_response = random.choice(MENTAL_HEALTH_KNOWLEDGE["crisis"]["responses"])
        resources = "\n\n".join(MENTAL_HEALTH_KNOWLEDGE["crisis"]["resources"])
        return f"{crisis_response}\n\nImmediate Help Available:\n{resources}\n\nPlease reach out to one of these resources right away. You matter, and there are people who want to help."

    greetings = ["hello", "hi", "hey", "namaste", "good morning", "good afternoon", "good evening"]
    if any(last_user_l.startswith(g) or g in last_user_l for g in greetings):
        return random.choice([
            "Namaste! I'm YuVA, your wellness companion. I'm here to listen without judgment and support you through whatever you're experiencing. How are you feeling today?",
            "Hello! I'm YuVA. I understand that reaching out can sometimes feel difficult, but I'm glad you're here. What's on your mind?",
            "Hey there! I'm YuVA, and I'm here to provide a safe, supportive space for you. Whether you're having a great day or facing challenges, I'm here to listen. How can I support you today?",
        ])

    if last_user in {"", "?", "help"}:
        return (
            "I'm here to support you with whatever you're going through. You can share your feelings, ask for coping strategies, "
            "or we can try mindfulness exercises together. I have knowledge about anxiety, depression, stress, sleep issues, "
            "relationships, and academic pressure. What would be most helpful for you right now?"
        )

    detected_topic = None
    for topic, data in MENTAL_HEALTH_KNOWLEDGE.items():
        if topic == "crisis":
            continue
        if any(symptom in last_user_l for symptom in data["symptoms"]):
            detected_topic = topic
            break

    if detected_topic:
        topic_data = MENTAL_HEALTH_KNOWLEDGE[detected_topic]
        response_parts = []
        
        response_parts.append(random.choice(topic_data["responses"]))
        
        technique = random.choice(topic_data["techniques"])
        response_parts.append(f"Here's something that might help: {technique}")
        
        follow_ups = {
            "anxiety": "What situations tend to trigger your anxiety the most?",
            "depression": "What's one small thing that usually brings you even a tiny bit of comfort?",
            "stress": "What's the biggest source of stress for you right now?",
            "sleep": "What does your current bedtime routine look like?",
            "relationships": "What would feel like a positive step forward in this situation?",
            "academic_pressure": "How can we balance your academic goals with your well-being?"
        }
        
        if detected_topic in follow_ups:
            response_parts.append(follow_ups[detected_topic])
        
        return " ".join(response_parts)

    # Emotion-based responses for general emotional states
    if any(word in last_user_l for word in ["sad", "depressed", "down", "blue", "unhappy"]):
        responses = [
            "I can hear the sadness in your words, and I want you to know that feeling this way is completely valid. Sadness is a natural human emotion, even though it's painful. What's been weighing on your heart lately?",
            "Thank you for trusting me with these difficult feelings. When we're sad, it can feel like the world has lost its color. You're not alone in this - I'm here with you. What would feel most supportive right now?",
            "I'm sensing a lot of pain in what you've shared. Sadness can feel overwhelming, but it's also a sign of your capacity to care deeply. What's one small thing that has brought you comfort in the past?"
        ]
    elif any(word in last_user_l for word in ["anxious", "worried", "nervous", "panic", "stress"]):
        responses = [
            "I can feel the anxiety in your message, and I want you to know that what you're experiencing is real and valid. Anxiety can make our minds race ahead of us. Let's try to ground you in this moment - can you name 3 things you can see around you right now?",
            "Anxiety can be really overwhelming and exhausting. You're showing strength by reaching out. Sometimes our anxiety is trying to protect us, but it can feel too intense. What does your anxiety feel like in your body right now?",
            "I hear how worried you're feeling. Anxiety often comes with a lot of 'what if' thoughts. Remember, you've gotten through anxious moments before, even when they felt impossible. What's one thing that has helped you feel calmer in the past?"
        ]
    elif any(word in last_user_l for word in ["angry", "mad", "frustrated", "irritated"]):
        responses = [
            "I can sense the frustration and anger in your words. Anger is a completely valid emotion - it often tells us that something important to us feels threatened or unfair. What's underneath this anger for you?",
            "Thank you for sharing these intense feelings with me. Anger can be really powerful and sometimes overwhelming. It takes courage to acknowledge and express it. What would help you feel heard and understood right now?",
            "I hear your anger, and I want you to know it's okay to feel this way. Sometimes anger is our way of protecting ourselves or standing up for what matters to us. What would help you channel this energy in a way that feels good for you?"
        ]
    elif any(word in last_user_l for word in ["lonely", "alone", "isolated", "disconnected"]):
        responses = [
            "Loneliness can feel so heavy and isolating. Thank you for reaching out - that takes real courage when you're feeling alone. Even in this moment, you're not truly alone because I'm here with you. What would meaningful connection look like for you right now?",
            "I can hear how lonely you're feeling, and I want you to acknowledge how brave you are for sharing this. Loneliness is something so many people experience, even when they're surrounded by others. What's one small way you could reach out to someone today?",
            "Feeling disconnected and alone is one of the most painful human experiences. You matter, and your feelings matter. Sometimes even small connections can help - is there anyone in your life you could reach out to, even just to say hello?"
        ]
    elif any(word in last_user_l for word in ["tired", "exhausted", "drained", "burnout"]):
        responses = [
            "I can hear how exhausted you're feeling, both physically and emotionally. Burnout is real, and it's your body and mind's way of telling you that you need rest and care. What would being gentle with yourself look like today?",
            "Feeling drained and tired can make everything seem harder than it usually is. You're doing your best, and that's enough. Sometimes the most important thing we can do is rest. What would feel most restorative for you right now?",
            "I hear how tired you are. When we're exhausted, it's hard to see clearly or feel hopeful. Your tiredness is valid - you've been carrying a lot. What's one way you could show yourself some kindness today?"
        ]
    elif any(word in last_user_l for word in ["happy", "good", "great", "excited", "joy"]):
        responses = [
            "I love hearing about your positive feelings! It's wonderful when we can notice and savor the good moments in life. What's bringing you this joy? I'd love to celebrate this with you.",
            "Your happiness is contagious! It's so important to acknowledge and appreciate these positive emotions when they come. What would you like to do to make the most of this good feeling?",
            "I'm so glad you're sharing this positivity with me! These moments of joy and contentment are precious. What's contributing to this good feeling, and how can you carry some of this energy forward?"
        ]
    else:
        # General supportive responses
        responses = [
            "Thank you for sharing this with me. I can sense that there's a lot going on for you right now. I'm here to listen without judgment and support you however I can. What feels most important for you to talk about?",
            "I'm listening, and I want you to know that whatever you're going through, you don't have to face it alone. Your experiences and feelings are valid. What would be most helpful for you in this moment?",
            "I appreciate you trusting me with your thoughts and feelings. Sometimes just having someone to talk to can make a difference. What's been on your mind lately that you'd like to explore together?",
            "I'm here with you in this moment. Every feeling you have is valid and deserves to be acknowledged. What would feel most supportive for you right now - talking through what you're experiencing, learning some coping strategies, or something else?"
        ]
    return random.choice(responses)


async def _mock_model_stream(messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
    full_response = _mock_model(messages)
    words = full_response.split()
    
    for i, word in enumerate(words):
        if word.endswith(('.', '!', '?')):
            await asyncio.sleep(0.3)
        elif word.endswith((',', ';', ':')):
            await asyncio.sleep(0.2)
        else:
            await asyncio.sleep(0.1)
        
        if i < len(words) - 1:
            yield f"{word} "
        else:
            yield word


class EnhancedGenerativeAIClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.use_mock = not (self.settings.gcp_project and os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
        self._vertex = None

    def _ensure_vertex(self) -> None:
        if self._vertex is not None:
            return
        try:
            from vertexai import init as vertex_init
            from vertexai.generative_models import GenerativeModel

            vertex_init(project=self.settings.gcp_project, location=self.settings.gcp_location)
            self._vertex = GenerativeModel(self.settings.vertex_model)
        except Exception:
            self.use_mock = True
            self._vertex = None

    async def chat(self, user_messages: List[Dict[str, str]]) -> str:
        messages = [{"role": "system", "content": EMPATHETIC_SYSTEM_PROMPT}] + user_messages
        if self.use_mock:
            return _mock_model(messages)

        self._ensure_vertex()
        if self._vertex is None:
            return _mock_model(messages)

        try:
            contents = []
            for m in messages:
                role = m.get("role", "user")
                contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})

            response = self._vertex.generate_content(contents)
            return getattr(response, "text", "I'm here for you.")
        except Exception:
            return _mock_model(messages)

    async def chat_stream(self, user_messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        messages = [{"role": "system", "content": EMPATHETIC_SYSTEM_PROMPT}] + user_messages
        
        if self.use_mock:
            async for chunk in _mock_model_stream(messages):
                yield chunk
            return

        self._ensure_vertex()
        if self._vertex is None:
            async for chunk in _mock_model_stream(messages):
                yield chunk
            return

        try:
            contents = []
            for m in messages:
                role = m.get("role", "user")
                contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})

            response_stream = self._vertex.generate_content(contents, stream=True)
            
            for chunk in response_stream:
                if hasattr(chunk, 'text') and chunk.text:
                    yield chunk.text
                    await asyncio.sleep(0.05)
                    
        except Exception:
            async for chunk in _mock_model_stream(messages):
                yield chunk


class GenerativeAIClient(EnhancedGenerativeAIClient):
    pass