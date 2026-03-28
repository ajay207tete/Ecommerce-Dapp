from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import uuid
import jwt
import bcrypt
import hmac
import hashlib
import json
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    wallet_address: Optional[str] = None
    role: str = "user"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    wallet_address: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    images: List[str] = []
    stock: int = 0
    category: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    duration: str = ""
    category: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CartItem(BaseModel):
    item_id: str
    item_type: str
    name: str
    price: float
    quantity: int = 1


class ShippingAddress(BaseModel):
    full_name: str
    address: str
    city: str
    postal_code: str
    country: str
    phone: Optional[str] = None


class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem]
    total: float
    status: str = "pending"
    payment_id: Optional[str] = None
    shipping_address: Optional[ShippingAddress] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    amount: float
    currency: str = "usd"
    method: str
    status: str = "pending"
    tx_hash: Optional[str] = None
    pay_address: Optional[str] = None
    pay_amount: Optional[float] = None
    payment_provider_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Reward(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    reward_type: str
    amount: float = 0
    description: str = ""
    status: str = "pending"
    earned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NFT(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    collection_id: str
    owner_address: str
    metadata: Dict[str, Any]
    status: str = "pending"
    tx_hash: Optional[str] = None
    minted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SocialTask(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    task_type: str
    task_url: str
    reward_amount: float
    status: str = "pending"
    completed_at: Optional[datetime] = None


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_data = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user_data)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        wallet_address=user_data.wallet_address
    )
    
    user_doc = user.model_dump()
    user_doc['password_hash'] = hash_password(user_data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"sub": user.id, "email": user.email})
    return {"token": token, "user": user}


@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_data = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_data or not verify_password(credentials.password, user_data['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user_data['id'], "email": user_data['email']})
    user = User(**user_data)
    return {"token": token, "user": user}


@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@api_router.get("/products")
async def get_products(category: Optional[str] = None):
    query = {"category": category} if category else {}
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@api_router.post("/products")
async def create_product(product: Product, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    product_doc = product.model_dump()
    product_doc['created_at'] = product_doc['created_at'].isoformat()
    await db.products.insert_one(product_doc)
    return product


@api_router.get("/services")
async def get_services(category: Optional[str] = None):
    query = {"category": category} if category else {}
    services = await db.services.find(query, {"_id": 0}).to_list(100)
    return services


@api_router.post("/services")
async def create_service(service: Service, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    service_doc = service.model_dump()
    service_doc['created_at'] = service_doc['created_at'].isoformat()
    await db.services.insert_one(service_doc)
    return service


@api_router.post("/cart")
async def add_to_cart(item: CartItem, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    
    if not cart:
        cart = {"user_id": current_user.id, "items": []}
    
    existing_item = next((i for i in cart['items'] if i['item_id'] == item.item_id), None)
    if existing_item:
        existing_item['quantity'] += item.quantity
    else:
        cart['items'].append(item.model_dump())
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": cart['items']}},
        upsert=True
    )
    return cart


@api_router.get("/cart")
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart:
        return {"user_id": current_user.id, "items": []}
    return cart


@api_router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    cart['items'] = [i for i in cart['items'] if i['item_id'] != item_id]
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": cart['items']}}
    )
    return cart


@api_router.post("/orders")
async def create_order(shipping_address: ShippingAddress, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart or not cart.get('items'):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    total = sum(item['price'] * item['quantity'] for item in cart['items'])
    
    order = Order(
        user_id=current_user.id,
        items=[CartItem(**item) for item in cart['items']],
        total=total,
        shipping_address=shipping_address
    )
    
    order_doc = order.model_dump()
    order_doc['created_at'] = order_doc['created_at'].isoformat()
    await db.orders.insert_one(order_doc)
    
    await db.carts.delete_one({"user_id": current_user.id})
    
    return order


@api_router.get("/orders")
async def get_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user.id}, {"_id": 0}).to_list(100)
    return orders


@api_router.post("/payments/create-inr")
async def create_inr_payment(order_id: str, current_user: User = Depends(get_current_user)):
    """Create Cashfree INR payment"""
    from payment_handler import cashfree
    
    order = await db.orders.find_one({"id": order_id, "user_id": current_user.id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    try:
        # Create Cashfree order
        cashfree_data = await cashfree.create_order({
            "order_id": order_id,
            "amount": order['total'],
            "user_id": current_user.id,
            "customer_email": current_user.email
        })
        
        # Store payment in database
        payment = Payment(
            order_id=order_id,
            amount=order['total'],
            currency="INR",
            method="cashfree",
            status="created",
            payment_provider_id=cashfree_data.get("cf_order_id"),
            pay_address=cashfree_data.get("payment_session_id")
        )
        
        payment_doc = payment.model_dump()
        payment_doc['created_at'] = payment_doc['created_at'].isoformat()
        await db.payments.insert_one(payment_doc)
        
        return {
            "payment_id": payment.id,
            "payment_session_id": cashfree_data.get("payment_session_id"),
            "order_id": order_id,
            "amount": order['total'],
            "currency": "INR"
        }
    except Exception as e:
        logger.error(f"Cashfree payment error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment creation failed: {str(e)}")


@api_router.post("/payments/create-crypto")
async def create_crypto_payment(order_id: str, pay_currency: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user.id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    api_key = os.getenv("NOWPAYMENTS_API_KEY")
    if not api_key or api_key == "YOUR_NOWPAYMENTS_API_KEY":
        raise HTTPException(status_code=503, detail="Payment service not configured")
    
    headers = {"x-api-key": api_key, "Content-Type": "application/json"}
    payload = {
        "price_amount": order['total'],
        "price_currency": "usd",
        "pay_currency": pay_currency,
        "order_id": order_id,
        "order_description": f"Order {order_id}",
        "ipn_callback_url": f"{os.getenv('FRONTEND_URL')}/api/webhooks/nowpayments"
    }
    
    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.post(
                "https://api.nowpayments.io/v1/payment",
                json=payload,
                headers=headers,
                timeout=30.0
            )
            if response.status_code != 201:
                raise HTTPException(status_code=response.status_code, detail="Payment creation failed")
            
            payment_data = response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")
    
    payment = Payment(
        order_id=order_id,
        amount=order['total'],
        method="crypto",
        currency=pay_currency,
        pay_address=payment_data.get("pay_address"),
        pay_amount=payment_data.get("pay_amount"),
        payment_provider_id=payment_data.get("payment_id")
    )
    
    payment_doc = payment.model_dump()
    payment_doc['created_at'] = payment_doc['created_at'].isoformat()
    await db.payments.insert_one(payment_doc)
    
    return payment


@api_router.get("/payments/{payment_id}/status")
async def get_payment_status(payment_id: str, current_user: User = Depends(get_current_user)):
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@api_router.post("/webhooks/nowpayments")
async def nowpayments_webhook(request: Request):
    body = await request.body()
    received_signature = request.headers.get("x-nowpayments-sig")
    
    if not received_signature:
        raise HTTPException(status_code=400, detail="Missing signature")
    
    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    sorted_payload = json.dumps(payload, sort_keys=True, separators=(',', ':'))
    ipn_secret = os.getenv("NOWPAYMENTS_IPN_SECRET", "")
    
    if ipn_secret and ipn_secret != "YOUR_NOWPAYMENTS_IPN_SECRET":
        computed_signature = hmac.new(
            ipn_secret.encode(),
            sorted_payload.encode(),
            hashlib.sha512
        ).hexdigest()
        
        if not hmac.compare_digest(computed_signature, received_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    payment_provider_id = payload.get("payment_id")
    status = payload.get("payment_status")
    
    await db.payments.update_one(
        {"payment_provider_id": payment_provider_id},
        {
            "$set": {
                "status": status,
                "tx_hash": payload.get("outcome_amount"),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if status == "finished":
        payment = await db.payments.find_one({"payment_provider_id": payment_provider_id}, {"_id": 0})
        if payment:
            await db.orders.update_one(
                {"id": payment['order_id']},
                {"$set": {"status": "paid", "payment_id": payment['id']}}
            )
    
    return {"status": "received"}


@api_router.get("/rewards")
async def get_rewards(current_user: User = Depends(get_current_user)):
    rewards = await db.rewards.find({"user_id": current_user.id}, {"_id": 0}).to_list(100)
    total = sum(r.get('amount', 0) for r in rewards if r.get('status') == 'completed')
    return {"rewards": rewards, "total": total}


@api_router.post("/rewards/claim")
async def claim_reward(reward_id: str, current_user: User = Depends(get_current_user)):
    reward = await db.rewards.find_one({"id": reward_id, "user_id": current_user.id}, {"_id": 0})
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    if reward['status'] != 'pending':
        raise HTTPException(status_code=400, detail="Reward already claimed")
    
    await db.rewards.update_one(
        {"id": reward_id},
        {"$set": {"status": "completed"}}
    )
    
    return {"message": "Reward claimed successfully"}


@api_router.get("/nfts")
async def get_nfts(current_user: User = Depends(get_current_user)):
    nfts = await db.nfts.find({"owner_address": current_user.wallet_address}, {"_id": 0}).to_list(100)
    return nfts


@api_router.post("/nfts/mint")
async def mint_nft(metadata: Dict[str, Any], current_user: User = Depends(get_current_user)):
    if not current_user.wallet_address:
        raise HTTPException(status_code=400, detail="Wallet not connected")
    
    nft = NFT(
        collection_id="thruster_collection_1",
        owner_address=current_user.wallet_address,
        metadata=metadata
    )
    
    nft_doc = nft.model_dump()
    nft_doc['minted_at'] = nft_doc['minted_at'].isoformat()
    await db.nfts.insert_one(nft_doc)
    
    return nft


@api_router.get("/tasks")
async def get_tasks(current_user: User = Depends(get_current_user)):
    tasks = await db.social_tasks.find({"user_id": current_user.id}, {"_id": 0}).to_list(100)
    return tasks


@api_router.post("/tasks/complete")
async def complete_task(task_id: str, current_user: User = Depends(get_current_user)):
    task = await db.social_tasks.find_one({"id": task_id, "user_id": current_user.id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task['status'] == 'completed':
        raise HTTPException(status_code=400, detail="Task already completed")
    
    await db.social_tasks.update_one(
        {"id": task_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    reward = Reward(
        user_id=current_user.id,
        reward_type="social_task",
        amount=task['reward_amount'],
        description=f"Completed task: {task['task_type']}",
        status="completed"
    )
    
    reward_doc = reward.model_dump()
    reward_doc['earned_at'] = reward_doc['earned_at'].isoformat()
    await db.rewards.insert_one(reward_doc)
    
    return {"message": "Task completed", "reward": reward}


@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_products = await db.products.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_products": total_products,
        "pending_orders": pending_orders
    }


@api_router.get("/")
async def root():
    return {"message": "Thruster API", "status": "online"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
