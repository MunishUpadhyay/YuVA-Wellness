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
    system_msgs = [m.get("content", "") for m in messages if m.get("role") == "system"]
    last_user = (user_msgs[-1] if user_msgs else "").strip()
    last_user_l = last_user.lower()

    # Check if Hinglish mode is requested - look for specific Hinglish instruction
    is_hinglish = any("hinglish" in msg.lower() for msg in system_msgs)

    crisis_indicators = MENTAL_HEALTH_KNOWLEDGE["crisis"]["indicators"]
    if any(indicator in last_user_l for indicator in crisis_indicators):
        crisis_response = random.choice(MENTAL_HEALTH_KNOWLEDGE["crisis"]["responses"])
        resources = "\n\n".join(MENTAL_HEALTH_KNOWLEDGE["crisis"]["resources"])
        if is_hinglish:
            return f"{crisis_response}\n\nTurant madad available hai:\n{resources}\n\nPlease kisi bhi resource se contact karo. Aap important ho, aur log aapki help karna chahte hain."
        return f"{crisis_response}\n\nImmediate Help Available:\n{resources}\n\nPlease reach out to one of these resources right away. You matter, and there are people who want to help."

    greetings = ["hello", "hi", "hey", "namaste", "good morning", "good afternoon", "good evening"]
    if any(last_user_l.startswith(g) or g in last_user_l for g in greetings):
        if is_hinglish:
            return random.choice([
                "Namaste! Main YuVA hun, aapka wellness companion. Main yahan hun bina kisi judgment ke sunne ke liye aur aapko support karne ke liye jo bhi aap experience kar rahe ho. Aaj aap kaisa feel kar rahe hain?",
                "Hello! Main YuVA hun. Main samajh sakti hun ki sometimes reach out karna difficult feel hota hai, but main khushi hun ki aap yahan hain. Aapke mind mein kya chal raha hai?",
                "Hey there! Main YuVA hun, aur main yahan hun aapke liye ek safe, supportive space provide karne ke liye. Chahe aapka din achha ho ya challenges face kar rahe ho, main yahan hun sunne ke liye. Aaj main aapki kaise help kar sakti hun?",
            ])
        return random.choice([
            "Namaste! I'm YuVA, your wellness companion. I'm here to listen without judgment and support you through whatever you're experiencing. How are you feeling today?",
            "Hello! I'm YuVA. I understand that reaching out can sometimes feel difficult, but I'm glad you're here. What's on your mind?",
            "Hey there! I'm YuVA, and I'm here to provide a safe, supportive space for you. Whether you're having a great day or facing challenges, I'm here to listen. How can I support you today?",
        ])

    if last_user in {"", "?", "help"}:
        if is_hinglish:
            return (
                "Main yahan hun aapko support karne ke liye jo bhi aap experience kar rahe ho. Aap apne feelings share kar sakte hain, "
                "coping strategies ke liye puch sakte hain, ya hum saath mein mindfulness exercises try kar sakte hain. Mere paas "
                "anxiety, depression, stress, sleep issues, relationships, aur academic pressure ke baare mein knowledge hai. "
                "Abhi aapke liye sabse helpful kya hoga?"
            )
        return (
            "I'm here to support you with whatever you're going through. You can share your feelings, ask for coping strategies, "
            "or we can try mindfulness exercises together. I have knowledge about anxiety, depression, stress, sleep issues, "
            "relationships, and academic pressure. What would be most helpful for you right now?"
        )

    # Check for Hindi/Hinglish words in user message
    hindi_words = ["stress", "tension", "pareshani", "problem", "dikkat", "mushkil", "anxiety", "ghabrahat", "dar", "khushi", "sad", "udas", "pareshan", "mujhe", "main", "hai", "ho", "kar", "ke", "liye"]
    contains_hindi = any(word in last_user_l for word in hindi_words)
    
    # Use Hinglish only if explicitly requested via system message, not just based on Hindi words
    use_hinglish = is_hinglish

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
        
        if use_hinglish:
            # Hinglish responses for different topics
            hinglish_responses = {
                "anxiety": [
                    "Main aapke message mein anxiety feel kar sakti hun, aur main chahti hun ki aap jaanein ki jo aap experience kar rahe hain wo real aur valid hai. Anxiety hamara mind race kara deti hai. Chaliye aapko is moment mein ground karte hain - kya aap 3 cheezein bata sakte hain jo aap abhi apne around dekh sakte hain?",
                    "Anxiety bahut overwhelming aur exhausting ho sakti hai. Aap strength show kar rahe hain by reaching out. Sometimes hamari anxiety hamein protect karne ki koshish karti hai, but wo too intense feel ho sakti hai. Aapki anxiety aapke body mein kaisi feel hoti hai right now?",
                    "Main sun sakti hun ki aap kitne worried feel kar rahe hain. Anxiety often bahut saare 'what if' thoughts ke saath aati hai. Remember, aapne pehle bhi anxious moments handle kiye hain, even when wo impossible lagte the. Kya koi ek cheez hai jo past mein aapko calmer feel karne mein help ki hai?"
                ],
                "depression": [
                    "Main aapke words mein heaviness sun sakti hun. Depression sab kuch harder feel kara deta hai, but aap brave step le rahe hain by reaching out.",
                    "Thank you for trusting me with these feelings. Depression real hai aur treatable hai. Aapko yeh akele carry nahi karna hai.",
                    "Main yahan hun aapke saath is difficult moment mein. Even when aisa nahi lagta, yeh feeling temporary hai."
                ],
                "stress": [
                    "Stress aisa feel kara sakta hai jaise sab kuch ek saath ho raha hai. Chaliye isko manageable pieces mein break down karte hain.",
                    "Main feel kar sakti hun ki aap kitne pressure mein hain. Stress hamara body ka response hai demands ke liye, aur yeh okay hai aisa feel karna.",
                    "Aap abhi bahut kuch deal kar rahe hain. Kya sabse helpful lagega - iske baare mein talk karna ya kuch stress management techniques seekhna?"
                ]
            }
            
            if detected_topic in hinglish_responses:
                response_parts.append(random.choice(hinglish_responses[detected_topic]))
            else:
                response_parts.append(random.choice(topic_data["responses"]))
        else:
            response_parts.append(random.choice(topic_data["responses"]))
        
        technique = random.choice(topic_data["techniques"])
        if use_hinglish:
            response_parts.append(f"Yeh kuch help kar sakta hai: {technique}")
        else:
            response_parts.append(f"Here's something that might help: {technique}")
        
        follow_ups = {
            "anxiety": "Kya situations aapki anxiety ko sabse zyada trigger karti hain?" if use_hinglish else "What situations tend to trigger your anxiety the most?",
            "depression": "Kya koi ek small cheez hai jo usually aapko thoda sa bhi comfort deti hai?" if use_hinglish else "What's one small thing that usually brings you even a tiny bit of comfort?",
            "stress": "Abhi aapke liye sabse bada stress ka source kya hai?" if use_hinglish else "What's the biggest source of stress for you right now?",
            "sleep": "Aapka current bedtime routine kaisa hai?" if use_hinglish else "What does your current bedtime routine look like?",
            "relationships": "Is situation mein kya positive step forward feel hoga?" if use_hinglish else "What would feel like a positive step forward in this situation?",
            "academic_pressure": "Hum kaise aapke academic goals ko aapki well-being ke saath balance kar sakte hain?" if use_hinglish else "How can we balance your academic goals with your well-being?"
        }
        
        if detected_topic in follow_ups:
            response_parts.append(follow_ups[detected_topic])
        
        return " ".join(response_parts)

    # Emotion-based responses for general emotional states
    if any(word in last_user_l for word in ["sad", "depressed", "down", "blue", "unhappy", "udas"]):
        if use_hinglish:
            responses = [
                "Main aapke words mein sadness sun sakti hun, aur main chahti hun ki aap jaanein ki aisa feel karna completely valid hai. Sadness ek natural human emotion hai, even though yeh painful hai. Aapke heart pe kya baat bhari hai lately?",
                "Thank you for trusting me with these difficult feelings. Jab hum sad hote hain, toh aisa lagta hai jaise duniya ka color kho gaya ho. Aap is mein alone nahi hain - main yahan hun aapke saath. Abhi sabse supportive kya feel hoga?",
                "Main aapne jo share kiya hai usme bahut pain sense kar sakti hun. Sadness overwhelming feel ho sakti hai, but yeh aapki capacity ka sign bhi hai ki aap deeply care karte hain. Kya koi ek small cheez hai jo past mein aapko comfort di hai?"
            ]
        else:
            responses = [
                "I can hear the sadness in your words, and I want you to know that feeling this way is completely valid. Sadness is a natural human emotion, even though it's painful. What's been weighing on your heart lately?",
                "Thank you for trusting me with these difficult feelings. When we're sad, it can feel like the world has lost its color. You're not alone in this - I'm here with you. What would feel most supportive right now?",
                "I'm sensing a lot of pain in what you've shared. Sadness can feel overwhelming, but it's also a sign of your capacity to care deeply. What's one small thing that has brought you comfort in the past?"
            ]
    elif any(word in last_user_l for word in ["anxious", "worried", "nervous", "panic", "stress", "stressed", "tension", "ghabrahat", "pareshan"]):
        if use_hinglish:
            responses = [
                "Main aapke message mein anxiety feel kar sakti hun, aur main chahti hun ki aap jaanein ki jo aap experience kar rahe hain wo real aur valid hai. Anxiety hamara mind race kara deti hai. Chaliye aapko is moment mein ground karte hain - kya aap 3 cheezein bata sakte hain jo aap abhi apne around dekh sakte hain?",
                "Anxiety bahut overwhelming aur exhausting ho sakti hai. Aap strength show kar rahe hain by reaching out. Sometimes hamari anxiety hamein protect karne ki koshish karti hai, but wo too intense feel ho sakti hai. Aapki anxiety aapke body mein kaisi feel hoti hai right now?",
                "Main sun sakti hun ki aap kitne worried feel kar rahe hain. Anxiety often bahut saare 'what if' thoughts ke saath aati hai. Remember, aapne pehle bhi anxious moments handle kiye hain, even when wo impossible lagte the. Kya koi ek cheez hai jo past mein aapko calmer feel karne mein help ki hai?"
            ]
        else:
            responses = [
                "I can feel the anxiety in your message, and I want you to know that what you're experiencing is real and valid. Anxiety can make our minds race ahead of us. Let's try to ground you in this moment - can you name 3 things you can see around you right now?",
                "Anxiety can be really overwhelming and exhausting. You're showing strength by reaching out. Sometimes our anxiety is trying to protect us, but it can feel too intense. What does your anxiety feel like in your body right now?",
                "I hear how worried you're feeling. Anxiety often comes with a lot of 'what if' thoughts. Remember, you've gotten through anxious moments before, even when they felt impossible. What's one thing that has helped you feel calmer in the past?"
            ]
    elif any(word in last_user_l for word in ["happy", "good", "great", "excited", "joy", "khushi", "achha"]):
        if use_hinglish:
            responses = [
                "Mujhe aapke positive feelings ke baare mein sunna bahut achha lag raha hai! Jab hum life ke good moments ko notice aur savor kar sakte hain toh yeh wonderful hota hai. Kya aapko yeh joy de raha hai? Main aapke saath celebrate karna chahti hun.",
                "Aapki happiness contagious hai! Jab yeh positive emotions aate hain toh unhe acknowledge aur appreciate karna bahut important hai. Aap is good feeling ka sabse zyada kaise fayda uthana chahte hain?",
                "Main bahut glad hun ki aap yeh positivity mere saath share kar rahe hain! Yeh joy aur contentment ke moments precious hote hain. Kya is good feeling mein contribute kar raha hai, aur aap is energy ko aage kaise carry kar sakte hain?"
            ]
        else:
            responses = [
                "I love hearing about your positive feelings! It's wonderful when we can notice and savor the good moments in life. What's bringing you this joy? I'd love to celebrate this with you.",
                "Your happiness is contagious! It's so important to acknowledge and appreciate these positive emotions when they come. What would you like to do to make the most of this good feeling?",
                "I'm so glad you're sharing this positivity with me! These moments of joy and contentment are precious. What's contributing to this good feeling, and how can you carry some of this energy forward?"
            ]
    else:
        # General supportive responses
        if use_hinglish:
            responses = [
                "Thank you for sharing yeh mere saath. Main sense kar sakti hun ki aapke liye abhi bahut kuch chal raha hai. Main yahan hun bina judgment ke sunne ke liye aur jo bhi way mein kar sakun aapko support karne ke liye. Aapke liye sabse important kya hai talk karne ke liye?",
                "Main sun rahi hun, aur main chahti hun ki aap jaanein ki jo bhi aap experience kar rahe hain, aapko iska face akele nahi karna hai. Aapke experiences aur feelings valid hain. Is moment mein aapke liye sabse helpful kya hoga?",
                "Main appreciate karti hun ki aap apne thoughts aur feelings mere saath trust kar rahe hain. Sometimes sirf kisi se talk karna difference make kar sakta hai. Lately aapke mind mein kya hai jo aap explore karna chahte hain together?"
            ]
        else:
            responses = [
                "Thank you for sharing this with me. I can sense that there's a lot going on for you right now. I'm here to listen without judgment and support you however I can. What feels most important for you to talk about?",
                "I'm listening, and I want you to know that whatever you're going through, you don't have to face it alone. Your experiences and feelings are valid. What would be most helpful for you in this moment?",
                "I appreciate you trusting me with your thoughts and feelings. Sometimes just having someone to talk to can make a difference. What's been on your mind lately that you'd like to explore together?"
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