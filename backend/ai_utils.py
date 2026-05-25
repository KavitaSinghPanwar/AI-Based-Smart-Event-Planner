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
    msg = user_message.lower().strip()
    
    if any(k in msg for k in ["hello", "hi", "hey", "greetings"]):
        return (
            "Hello! I am **EventAI**, your smart event planning assistant. How can I help you today? 👋\n\n"
            "I can help you with:\n"
            "* 💰 **Budget Estimation** & savings tips\n"
            "* 📈 **Crowd Turnout Prediction**\n"
            "* 📍 **Venue Recommendations** for any city\n"
            "* 📅 **Event Schedules** & itineraries\n\n"
            "What kind of event are we planning today?"
        )
        
    elif any(k in msg for k in ["bts", "concert", "music", "band", "singer", "performance", "show"]):
        return (
            "🎵 **Planning a Concert or Live Music Event**:\n\n"
            "Organizing a large-scale performance or concert (like a BTS concert!) requires robust coordination. Here is a starter checklist:\n\n"
            "1. **Crowd & Safety First**:\n"
            "   * Plan barricades, zone divisions (VIP, general admission), and emergency exits.\n"
            "   * Coordinate with local city security and medical teams.\n"
            "2. **Acoustics & Stage Production**:\n"
            "   * Sound checks, professional line-array speakers, stage lighting, and large LED display screens are critical.\n"
            "3. **Ticketing & QR Passes**:\n"
            "   * Use digital passes with QR codes for fast scanning at the gates (which our platform supports!).\n"
            "4. **F&B and Merchandise**:\n"
            "   * Separate merchandise stalls and beverage counters to optimize queue times.\n\n"
            "Do you want me to estimate a budget or generate a timeline for this concert?"
        )
        
    elif any(k in msg for k in ["wedding", "marriage", "reception"]):
        return (
            "💍 **Planning a Wedding**:\n\n"
            "Weddings are highly personal and require meticulous styling and coordination. Key milestones to focus on:\n\n"
            "* **Phase 1: Guest List & Venue** (6-12 months ahead)\n"
            "  * Finalize the headcount; this directly dictates your venue selection (banquet hall, outdoor garden, beach).\n"
            "* **Phase 2: Themes & Decor** (3-6 months ahead)\n"
            "  * Lock in color palettes, floral centerpieces, backdrop stage, and lighting layout.\n"
            "* **Phase 3: Vendor Booking & Catering**\n"
            "  * Confirm photographers, makeup artists, DJs/live music, and catering menus early.\n\n"
            "Would you like venue recommendations or a sample timeline for a wedding?"
        )
        
    elif any(k in msg for k in ["fest", "college", "university", "competition", "cult", "cultural"]):
        return (
            "🎓 **Planning a College Fest / Cultural Event**:\n\n"
            "College fests are high-energy events that rely heavily on student coordination and sponsorships. Essential tips:\n\n"
            "* **Engagement Activities**: Arrange a mix of technical tournaments, gaming zones, and a main cultural stage (fashion show, band wars).\n"
            "* **Sponsorship Packages**: Define tiered sponsorship slots (Gold, Silver, Platinum) offering logo placements on banners and social media promotions.\n"
            "* **Volunteer Management**: Divide tasks into committees (Security, Stage, Hospitality, Registrations).\n\n"
            "Would you like me to generate a schedule or crowd prediction for your next fest?"
        )
        
    elif any(k in msg for k in ["seminar", "conference", "corporate", "business", "workshop", "webinar"]):
        return (
            "💼 **Planning a Corporate Seminar or Conference**:\n\n"
            "Corporate events demand polished execution, punctuality, and clear value for attendees. Checklist:\n\n"
            "* **Audio/Visual Setup**: Ensure reliable slide presentation displays, clip-on microphones, and high-speed Wi-Fi access.\n"
            "* **Itinerary**: Schedule regular breaks (every 90-120 minutes) for coffee, networking, and restroom visits.\n"
            "* **Registration**: Use smooth QR-code check-ins at reception desk to avoid entry delays.\n\n"
            "Would you like an estimated budget or a structured timeline schedule for this corporate seminar?"
        )
        
    elif any(k in msg for k in ["birthday", "party", "anniversary", "celebration", "social"]):
        return (
            "🎉 **Planning a Social Party or Celebration**:\n\n"
            "Let's make this celebration memorable! Here are a few creative planning ideas:\n\n"
            "* **Custom Theme**: Select a theme (Retro, Neon Glow, Masquerade, Garden Party) to tie decorations and activities together.\n"
            "* **Interactive Food Stalls**: Instead of standard buffet catering, use live counters (e.g. customized pasta bar, slider stations).\n"
            "* **Entertainment & Photo-Booth**: Set up a custom photobooth backdrop with props to encourage guests to share photos online.\n\n"
            "Tell me the location and expected guest count, and I can suggest venues!"
        )
        
    elif any(k in msg for k in ["budget", "cost", "price", "money", "expensive"]):
        return (
            "💰 **Event Budget Management Tips**:\n\n"
            "To keep costs under control without compromising on quality:\n\n"
            "* **Split Allocations**: 40-50% for Venue/Food, 15-20% for AV & Tech, 15% for Styling/Decor, 10% for Marketing, and 10% for Emergency Reserves.\n"
            "* **Vendor Negotiation**: Request itemized quotes and book off-peak dates if flexible.\n"
            "* **Sponsors**: Partner with local food/media brands to reduce direct costs in exchange for marketing visibility.\n\n"
            "You can use our **AI Planner** tools in the sidebar to get detailed budget estimations!"
        )
        
    elif any(k in msg for k in ["venue", "place", "location", "hall", "ground"]):
        return (
            "📍 **Selecting the Right Venue**:\n\n"
            "The perfect venue checks all these boxes:\n\n"
            "1. **Accessibility**: Easy parking and public transport options for attendees.\n"
            "2. **Capacity**: Never book a venue that fits fewer than your expected crowd size. (Ensure at least a 10% buffer).\n"
            "3. **Amenities**: Confirm if AV gear, tables, chairs, and restrooms are included in the pricing.\n\n"
            "Use our **AI Planner** in the sidebar to generate curated venue recommendations!"
        )
        
    elif any(k in msg for k in ["ticket", "book", "pass", "seat"]):
        return (
            "🎫 **Ticketing & Booking Management**:\n\n"
            "Our platform has built-in ticket reservation. Here is how it helps:\n\n"
            "* **Real-time availability**: Tracks remaining ticket allocations against crowd capacity automatically.\n"
            "* **QR code ticketing**: Registered users receive a customized booking containing a scannable QR ticket.\n"
            "* **Analytics**: Real-time sales data displays directly on the Admin/Organizer dashboard.\n\n"
            "Go to the **Event Hub** to browse events and book tickets!"
        )
        
    elif any(k in msg for k in ["help", "feature", "what can you do"]):
        return (
            "💡 **What I Can Do For You**:\n\n"
            "As your **EventAI Planner Assistant**, I can assist with:\n\n"
            "1. 🎤 **Concerts, Festivals & Seminars**: Step-by-step setup guides.\n"
            "2. 🗺️ **Venue Selection**: Key elements to check for any city.\n"
            "3. 💵 **Budget Planning**: Standard allocation rules and optimization tips.\n"
            "4. 📅 **Itinerary Design**: Sample timetables to streamline execution.\n\n"
            "Feel free to ask questions like: *'How do I plan a wedding?'* or *'What is a standard concert budget split?'*"
        )
        
    else:
        # Dynamic fallback responses to make it feel natural and not repetitive
        responses = [
            (
                "That sounds like an exciting event plan! 🚀\n\n"
                "To give you the most accurate advice, could you share:\n"
                "* **Event Type** (e.g. Wedding, Concert, Conference, Birthday Party)\n"
                "* **Location/City**\n"
                "* **Estimated Guest Count**\n\n"
                "I can then draft a custom checklist or budget breakdown for you!"
            ),
            (
                "Interesting concept! I can help you organize and structure this event.\n\n"
                "Would you like to:\n"
                "* 📅 Generate a step-by-step timeline schedule?\n"
                "* 💰 Estimate itemized costs?\n"
                "* 📍 Get ideas for theme decorations?\n\n"
                "Tell me a bit more about what you're imagining!"
            ),
            (
                "I'd love to help you plan that event! 🌟\n\n"
                "To help us get started, what is your primary focus right now? Are we selecting a venue, setting a ticket price, or organizing the speaker/itinerary flow?"
            )
        ]
        # Choose a response based on the hash of the message to be stable yet varied across different inputs
        idx = sum(ord(c) for c in msg) % len(responses)
        return responses[idx]
