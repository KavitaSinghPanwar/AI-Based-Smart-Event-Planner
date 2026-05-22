import os
import json
import requests
import random
from datetime import datetime, timedelta

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def get_gemini_api_key():
    return os.environ.get("GEMINI_API_KEY", "")

def call_gemini_api(prompt, system_instruction=""):
    api_key = get_gemini_api_key()
    if not api_key:
        return None
    
    headers = {"Content-Type": "application/json"}
    
    # Simple formatting of content
    contents = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    if system_instruction:
        contents["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }
    
    url = f"{GEMINI_API_URL}?key={api_key}"
    try:
        response = requests.post(url, headers=headers, json=contents, timeout=12)
        if response.status_code == 200:
            res_json = response.json()
            # Extract text from candidate
            text = res_json['candidates'][0]['content']['parts'][0]['text']
            return text
    except Exception as e:
        print(f"Gemini API Error: {e}")
    return None

def parse_json_from_gemini(text):
    """Helper to extract JSON block from Gemini Markdown output"""
    if not text:
        return None
    try:
        # Check if text is wrapped in ```json
        if "```json" in text:
            content = text.split("```json")[1].split("```")[0].strip()
            return json.loads(content)
        elif "```" in text:
            content = text.split("```")[1].split("```")[0].strip()
            return json.loads(content)
        return json.loads(text.strip())
    except Exception as e:
        print(f"Error parsing JSON from Gemini response: {e}. Text: {text}")
        return None


# 1. VENUE RECOMMENDATION
def get_venue_recommendations(event_type, budget, city, crowd_size):
    prompt = f"""
    Recommend 3 suitable event venues in {city} for a {event_type} event.
    The budget is {budget} USD and the crowd size is {crowd_size} people.
    
    Return the response strictly as a JSON object with this exact structure:
    {{
      "venues": [
        {{
          "name": "Venue Name",
          "address": "Street Address, City",
          "capacity": 500,
          "estimated_cost": "Cost description or amount",
          "rating": 4.5,
          "reason": "Why this venue is recommended for this budget and crowd size."
        }}
      ]
    }}
    """
    
    result = call_gemini_api(prompt, "You are a professional event venue finder. Return JSON only.")
    parsed = parse_json_from_gemini(result)
    
    if parsed and "venues" in parsed:
        return parsed
    
    # Fallback/Mock Response
    mock_venues = [
        {
            "name": f"The Grand {city} Hall",
            "address": f"101 Luxury Blvd, {city}",
            "capacity": int(crowd_size) * 2,
            "estimated_cost": f"${float(budget) * 0.4:.0f} USD (Rental)",
            "rating": 4.8,
            "reason": "Excellent facilities with premium acoustics, suitable for elegant scale settings and events."
        },
        {
            "name": f"Metropolitan {event_type} Center",
            "address": f"405 Convention Way, {city}",
            "capacity": int(crowd_size) + 50,
            "estimated_cost": f"${float(budget) * 0.3:.0f} USD (Rental)",
            "rating": 4.5,
            "reason": "Very cost-effective option situated centrally. Features customizable stages and layout setup."
        },
        {
            "name": f"Skyline Vista Gardens",
            "address": f"777 Rooftop Plaza, {city}",
            "capacity": int(crowd_size) + 100,
            "estimated_cost": f"${float(budget) * 0.5:.0f} USD (Rental)",
            "rating": 4.7,
            "reason": "Stunning panoramic outdoor layout, perfect for high profile category gatherings with great catering options."
        }
    ]
    return {"venues": mock_venues}


# 2. CROWD PREDICTION
def predict_crowd_turnout(event_type, category, day_of_week, ticket_price):
    prompt = f"""
    Predict the crowd turnout for a {event_type} event (Category: {category}) held on a {day_of_week} with a ticket price of {ticket_price} USD.
    Provide turnout percentage, expected size (assume a baseline capacity of 500), and insights.
    
    Return the response strictly as a JSON object with this exact structure:
    {{
      "turnout_percentage": 82,
      "predicted_crowd": 410,
      "insights": "Detailed analysis of how ticket price, day of week, and event category affect attendance."
    }}
    """
    
    result = call_gemini_api(prompt, "You are a predictive data analyst for event planning. Return JSON only.")
    parsed = parse_json_from_gemini(result)
    
    if parsed and "predicted_crowd" in parsed:
        return parsed
    
    # Fallback/Mock Response
    price = float(ticket_price) if ticket_price else 0
    base_rate = 85
    
    # Adjust based on price
    if price > 100:
        base_rate -= 25
    elif price > 50:
        base_rate -= 15
    elif price > 0:
        base_rate -= 5
        
    # Adjust based on weekday/weekend
    is_weekend = day_of_week.lower() in ['friday', 'saturday', 'sunday']
    if is_weekend:
        base_rate += 10
    else:
        base_rate -= 10
        
    base_rate = max(10, min(98, base_rate))
    pred_crowd = int(500 * (base_rate / 100.0))
    
    insights = (
        f"Based on ticket pricing of ${price:.2f} and {day_of_week} staging, we expect a {base_rate}% turnout. "
        f"{'Weekends see higher leisure turnouts' if is_weekend else 'Weekday scheduling shifts audience focus towards corporate/educational profiles'}. "
        f"Pricing is {'highly accessible' if price < 40 else 'premium, limiting general admissions but attracting targeted participants'}."
    )
    
    return {
        "turnout_percentage": base_rate,
        "predicted_crowd": pred_crowd,
        "insights": insights
    }


# 3. BUDGET ESTIMATION
def estimate_event_budget(category, crowd_size, location):
    prompt = f"""
    Provide an itemized budget estimation for a {category} event with {crowd_size} attendees in {location}.
    Provide cost breakdown and total estimated cost in USD.
    
    Return the response strictly as a JSON object with this exact structure:
    {{
      "items": [
        {{"category": "Venue & Security", "cost": 5000}},
        {{"category": "Catering & Beverages", "cost": 3000}},
        {{"category": "Marketing & Invites", "cost": 1000}},
        {{"category": "Decor & Setup", "cost": 2000}},
        {{"category": "Audio/Visual & Entertainment", "cost": 2500}}
      ],
      "total_estimated_cost": 13500,
      "savings_tips": "A short list of budget saving opportunities."
    }}
    """
    
    result = call_gemini_api(prompt, "You are a professional financial planner for events. Return JSON only.")
    parsed = parse_json_from_gemini(result)
    
    if parsed and "total_estimated_cost" in parsed:
        return parsed
        
    # Fallback/Mock Response
    size = int(crowd_size) if crowd_size else 100
    cost_per_head = 45
    if category.lower() == 'wedding':
        cost_per_head = 120
    elif category.lower() in ['corporate event', 'seminar']:
        cost_per_head = 75
    elif category.lower() == 'concert':
        cost_per_head = 55
        
    base_cost = size * cost_per_head
    items = [
        {"category": "Venue Rental & Staffing", "cost": int(base_cost * 0.35)},
        {"category": "Catering & Hospitality", "cost": int(base_cost * 0.30)},
        {"category": "Logistics & Equipment (AV/Decor)", "cost": int(base_cost * 0.20)},
        {"category": "Marketing, Registrations & Badges", "cost": int(base_cost * 0.08)},
        {"category": "Permits, Insurance & Contingency", "cost": int(base_cost * 0.07)}
    ]
    total = sum(i['cost'] for i in items)
    
    tips = (
        "1. Secure venue bookings at least 3 months early for early-bird discounts. "
        "2. Leverage digital-only ticket passes to completely eliminate print and distribution costs. "
        "3. Partner with local culinary programs or event production sponsors to cut media setup overheads."
    )
    
    return {
        "items": items,
        "total_estimated_cost": total,
        "savings_tips": tips
    }


# 4. AUTO SCHEDULE GENERATOR
def generate_event_schedule(title, category, date, time, duration_hours):
    prompt = f"""
    Generate an event schedule (itinerary) for a {category} event titled '{title}' on {date}.
    The start time is {time} and it runs for {duration_hours} hours.
    
    Return the response strictly as a JSON object with this exact structure:
    {{
      "schedule": [
        {{"time": "09:00 AM", "activity": "Activity description"}}
      ],
      "notes": "General tips for maintaining the timeline schedule."
    }}
    """
    
    result = call_gemini_api(prompt, "You are a professional event coordinator. Return JSON only.")
    parsed = parse_json_from_gemini(result)
    
    if parsed and "schedule" in parsed:
        return parsed
        
    # Fallback/Mock Response
    start_dt = None
    try:
        start_dt = datetime.strptime(time, "%H:%M")
    except:
        try:
            start_dt = datetime.strptime(time, "%I:%M %p")
        except:
            start_dt = datetime.strptime("10:00", "%H:%M")
            
    hours = float(duration_hours) if duration_hours else 3
    
    schedule = []
    
    # Setup timeline steps based on duration
    intervals = 4
    if hours >= 6:
        intervals = 6
    
    step_minutes = (hours * 60) / intervals
    activities = [
        "Doors Open & Check-In Registration",
        "Keynote Welcome Address & Introductions",
        "Interactive Workshops / Main Exhibition Panel",
        "Networking Break & Refreshments Served",
        "Guest Speakers & Performance Spotlight",
        "Closing Remarks, Photo sessions & Departure"
    ]
    
    for i in range(int(intervals)):
        step_time = start_dt + timedelta(minutes=step_minutes * i)
        activity_text = activities[i % len(activities)]
        schedule.append({
            "time": step_time.strftime("%I:%M %p"),
            "activity": activity_text
        })
        
    # Add final wrap-up
    end_time = start_dt + timedelta(hours=hours)
    schedule.append({
        "time": end_time.strftime("%I:%M %p"),
        "activity": "Official Closing and Hall Vacated"
    })
    
    notes = "Ensure microphone checks are finished 30 minutes before opening. Designate visual signage to prompt guest transitions during breaks."
    
    return {
        "schedule": schedule,
        "notes": notes
    }


# 5. CHATBOT ASSISTANT
def get_chatbot_response(user_message, conversation_history=None):
    if conversation_history is None:
        conversation_history = []
        
    system_instruction = (
        "You are EventAI, an intelligent virtual planner assistant. "
        "Provide expert advice on event planning, category setups (Wedding, Concert, Corporate, College Fest, Seminar), "
        "budget estimation, ticketing, crowd flow, and creative decoration ideas. "
        "Keep answers friendly, clear, professional, and relatively concise. Make formatting clean with bullet points."
    )
    
    # Format message with past history context
    formatted_prompt = ""
    for msg in conversation_history[-6:]:  # Limit history to keep tokens low
        role = "User" if msg.get("isUser") else "Assistant"
        formatted_prompt += f"{role}: {msg.get('text')}\n"
    
    formatted_prompt += f"User: {user_message}\nAssistant:"
    
    result = call_gemini_api(formatted_prompt, system_instruction)
    if result:
        return result
        
    # Fallback Chat responses based on keyword matching
    msg = user_message.lower()
    if "hello" in msg or "hi" in msg:
        return (
            "Hello! I am **EventAI**, your smart event planning assistant. How can I help you today?\n\n"
            "I can help you:\n"
            "* Estimate event budgets\n"
            "* Predict crowd turnout\n"
            "* Recommend local venue spaces\n"
            "* Design event timelines and schedules"
        )
    elif "wedding" in msg:
        return (
            "Weddings are magical but demand detailed coordination. Here are 3 essential steps:\n"
            "1. **Confirm Guest Count & Budget**: Establishes venue limits.\n"
            "2. **Theme & Styling**: Decides flowers, colors, and attire.\n"
            "3. **Vendor Contracts**: Catering, photographers, and audio must be booked at least 6 months ahead."
        )
    elif "budget" in msg or "cost" in msg:
        return (
            "Planning budgets requires factoring in multiple segments. Typically:\n"
            "* **Venue & Catering**: 40% - 50% of the total budget.\n"
            "* **Entertainment & AV**: 15% - 20%.\n"
            "* **Decorations & Layout**: 10% - 15%.\n"
            "* **Emergency contingency**: 5% - 10%.\n\n"
            "Would you like me to run a customized budget estimation for your event details?"
        )
    elif "venue" in msg or "place" in msg:
        return (
            "Finding a venue is highly dependent on your **budget**, **guest headcount**, and **city location**.\n"
            "I recommend checking out our dedicated **AI Planner** section in the sidebar to generate direct suggestions!"
        )
    else:
        return (
            "That sounds like an interesting event requirement! When planning, always keep target audience profiles and scheduling flow in mind.\n\n"
            "Could you share more details like the event type, budget, or target crowd size so I can provide customized tips?"
        )
