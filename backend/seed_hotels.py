import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import uuid

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "thruster_db"

hotels = [
    {
        "id": str(uuid.uuid4()),
        "name": "Cyber Palace Hotel",
        "description": "Luxury 5-star hotel in the heart of the city with futuristic amenities. Features rooftop infinity pool, AI-powered room service, and holographic entertainment systems.",
        "price_per_night": 299.99,
        "location": "Neo Tokyo District, Japan",
        "room_type": "Deluxe Suite",
        "amenities": ["WiFi", "Pool", "Gym", "Restaurant", "Spa", "AI Butler"],
        "images": ["https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "rating": 4.8,
        "available_rooms": 15,
        "category": "luxury",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Neon Dreams Resort",
        "description": "Beachfront resort with cyberpunk aesthetics. Private beach access, underwater restaurant, and neon-lit infinity pools.",
        "price_per_night": 399.99,
        "location": "Miami Beach, USA",
        "room_type": "Ocean View Suite",
        "amenities": ["Beach Access", "Pool", "Spa", "Restaurant", "Bar", "Water Sports"],
        "images": ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "rating": 4.9,
        "available_rooms": 8,
        "category": "luxury",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Tech Hub Boutique",
        "description": "Modern boutique hotel perfect for digital nomads. High-speed fiber internet, coworking spaces, and smart rooms.",
        "price_per_night": 149.99,
        "location": "Silicon Valley, USA",
        "room_type": "Smart Studio",
        "amenities": ["High-Speed WiFi", "Coworking Space", "Tech Lounge", "Cafe", "Meeting Rooms"],
        "images": ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "rating": 4.6,
        "available_rooms": 25,
        "category": "business",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Aurora Sky Tower",
        "description": "Ultra-modern skyscraper hotel with panoramic city views. Features sky bar, rooftop helipad, and virtual reality gaming lounge.",
        "price_per_night": 499.99,
        "location": "Dubai, UAE",
        "room_type": "Penthouse Suite",
        "amenities": ["City View", "Sky Bar", "Helipad Access", "VR Gaming", "Concierge", "Fine Dining"],
        "images": ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "rating": 5.0,
        "available_rooms": 5,
        "category": "luxury",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Electric Dreams Inn",
        "description": "Affordable yet stylish hotel with neon-themed decor. Perfect for budget travelers who love the cyberpunk aesthetic.",
        "price_per_night": 79.99,
        "location": "Bangkok, Thailand",
        "room_type": "Standard Room",
        "amenities": ["WiFi", "Cafe", "24/7 Reception", "Laundry", "Bike Rental"],
        "images": ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?crop=entropy&cs=srgb&fm=jpg&q=85"],
        "rating": 4.3,
        "available_rooms": 40,
        "category": "budget",
        "created_at": datetime.utcnow().isoformat()
    }
]

async def seed_hotels():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Seeding hotel bookings...")
    await db.services.delete_many({})
    await db.services.insert_many(hotels)
    print(f"Added {len(hotels)} hotels")
    
    client.close()
    print("Hotel database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_hotels())
