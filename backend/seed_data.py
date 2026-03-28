import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import uuid

MONGO_URL = "mongodb+srv://ajayte207_db_user:Ajayte207@cluster0.gohrt1h.mongodb.net/?appName=Cluster0"
DB_NAME = "thruster_production"

products = [
    {
        "id": str(uuid.uuid4()),
        "name": "Cyberpunk Headset",
        "description": "Next-gen audio experience with neural interface. Immerse yourself in the future of sound.",
        "price": 299.99,
        "images": [
            "https://images.unsplash.com/photo-1561063775-883a10918c0d?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1545127398-14699f92334b?crop=entropy&cs=srgb&fm=jpg&q=85"
        ],
        "stock": 50,
        "category": "electronics",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Smart Glasses V2",
        "description": "AR-enabled glasses with blockchain integration. See the future, own the data.",
        "price": 499.99,
        "images": [
            "https://images.unsplash.com/photo-1548799767-f168d215106a?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1577803645773-f96470509666?crop=entropy&cs=srgb&fm=jpg&q=85"
        ],
        "stock": 30,
        "category": "electronics",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Neon Backpack Pro",
        "description": "LED-equipped tactical backpack with built-in power bank. Light up the streets.",
        "price": 149.99,
        "images": [
            "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1547949003-9792a18a2601?crop=entropy&cs=srgb&fm=jpg&q=85"
        ],
        "stock": 75,
        "category": "accessories",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Quantum Keyboard",
        "description": "Mechanical gaming keyboard with programmable RGB and haptic feedback.",
        "price": 179.99,
        "images": [
            "https://images.unsplash.com/photo-1595225476474-87563907a212?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?crop=entropy&cs=srgb&fm=jpg&q=85"
        ],
        "stock": 40,
        "category": "electronics",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Holographic Mouse",
        "description": "Wireless mouse with holographic projector for 3D workspace navigation.",
        "price": 89.99,
        "images": [
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1586920740199-67a1fc7a9c18?crop=entropy&cs=srgb&fm=jpg&q=85",
            "https://images.unsplash.com/photo-1563297007-0686b7003af7?crop=entropy&cs=srgb&fm=jpg&q=85"
        ],
        "stock": 100,
        "category": "electronics",
        "created_at": datetime.utcnow().isoformat()
    }
]

services = [
    {
        "id": str(uuid.uuid4()),
        "name": "Smart Contract Audit",
        "description": "Professional security audit for your TON smart contracts. Ensure your code is secure.",
        "price": 999.99,
        "duration": "1-2 weeks",
        "category": "blockchain",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "NFT Collection Design",
        "description": "Custom NFT artwork and collection design. Stand out in the marketplace.",
        "price": 2499.99,
        "duration": "2-4 weeks",
        "category": "design",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "DApp Development",
        "description": "Full-stack decentralized app development on TON. From concept to deployment.",
        "price": 9999.99,
        "duration": "4-8 weeks",
        "category": "development",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Tokenomics Consulting",
        "description": "Expert advice on token design and distribution strategy.",
        "price": 1499.99,
        "duration": "1 week",
        "category": "consulting",
        "created_at": datetime.utcnow().isoformat()
    }
]

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Seeding products...")
    await db.products.delete_many({})
    await db.products.insert_many(products)
    print(f"Added {len(products)} products")
    
    print("Seeding services...")
    await db.services.delete_many({})
    await db.services.insert_many(services)
    print(f"Added {len(services)} services")
    
    client.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
