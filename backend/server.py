from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
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
import json
import resend

# =========================
# LOAD ENV
# =========================

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.getenv("MONGO_URL")
db_name = os.getenv("DB_NAME")

if not mongo_url:
    raise Exception("MONGO_URL missing")

if not db_name:
    raise Exception("DB_NAME missing")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# =========================
# APP
# =========================

app = FastAPI()
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080")
)

resend.api_key= os.getenv("RESEND_API_KEY")

# =========================
# LOGGER
# =========================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# =========================
# MODELS
# =========================

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


class WalletUpdate(BaseModel):
    wallet_address: str


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    images: List[str] = []
    stock: int = 0
    category: str = ""
    sizes: List[str] = ["S", "M", "L", "XL"]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    duration: str = ""
    category: str = ""
    images: List[str] = []
    latitude: Optional[float] = None
    longitude: Optional[float] = None
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


class HotelBookingRequest(BaseModel):
    hotel_id: str
    hotel_name: str
    check_in: str
    check_out: str
    guests: int
    nights: int
    room_type: str
    total: float
    location: Optional[str] = None
    hotel_image: Optional[str] = None


# =========================
# UTILS
# =========================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed.encode("utf-8")
    )


def create_access_token(data: dict) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


# =========================
# EMAIL
# =========================

async def send_welcome_email(user_email: str):
    try:
        resend.Emails.send({
            "from": "Thruster <info@thruster.in>",
            "to": [user_email],
            "subject": "Welcome to Thruster 🚀",
            "html": """
            <div style="font-family:Arial;padding:30px;background:#f8f9fb;">
                <div style="max-width:650px;margin:auto;background:white;padding:40px;border-radius:14px;">
                    <h1>Welcome to Thruster 🚀</h1>

                    <p>Your account has been successfully created.</p>

                    <p>
                        Thruster is India's blockchain-powered commerce platform.
                    </p>

                    <a href="https://thruster.in"
                       style="
                        display:inline-block;
                        margin-top:20px;
                        background:#111;
                        color:white;
                        padding:14px 28px;
                        border-radius:10px;
                        text-decoration:none;
                        font-weight:bold;
                       ">
                        Explore Platform
                    </a>
                </div>
            </div>
            """
        })

        logger.info(f"Welcome email sent to {user_email}")

    except Exception as e:
        logger.error(f"Resend Error: {e}")


# =========================
# AUTH
# =========================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:

    try:
        token = credentials.credentials

        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user_data = await db.users.find_one(
            {"id": user_id},
            {"_id": 0}
        )

        if not user_data:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return User(**user_data)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


# =========================
# AUTH ROUTES
# =========================

@api_router.post("/auth/register")
async def register(user_data: UserRegister):

    existing = await db.users.find_one({
        "email": user_data.email
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = User(
        email=user_data.email,
        wallet_address=user_data.wallet_address
    )

    user_doc = user.model_dump()

    user_doc["password_hash"] = hash_password(
        user_data.password
    )

    await db.users.insert_one(user_doc)

    await send_welcome_email(user.email)

    token = create_access_token({
        "sub": user.id,
        "email": user.email
    })

    return {
        "token": token,
        "user": user
    }


@api_router.post("/auth/login")
async def login(credentials: UserLogin):

    user_data = await db.users.find_one(
        {"email": credentials.email},
        {"_id": 0}
    )

    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        credentials.password,
        user_data["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": user_data["id"],
        "email": user_data["email"]
    })

    return {
        "token": token,
        "user": User(**user_data)
    }


@api_router.get("/auth/me")
async def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


@api_router.patch("/auth/update-wallet")
async def update_wallet(
    wallet_data: WalletUpdate,
    current_user: User = Depends(get_current_user)
):

    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "wallet_address": wallet_data.wallet_address
            }
        }
    )

    return {
        "message": "Wallet updated successfully"
    }


# =========================
# PRODUCTS
# =========================

@api_router.get("/products")
async def get_products(category: Optional[str] = None):

    query = {}

    if category:
        query["category"] = category

    products = await db.products.find(
        query,
        {"_id": 0}
    ).to_list(100)

    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):

    product = await db.products.find_one(
        {"id": product_id},
        {"_id": 0}
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product

@api_router.post("/products")
async def create_product(
    product: Product,
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    await db.products.insert_one(
        product.model_dump()
    )

    return product


# =========================
# SERVICES
# =========================

@api_router.get("/services")
async def get_services(category: Optional[str] = None):

    query = {}

    if category:
        query["category"] = category

    services = await db.services.find(
        query,
        {"_id": 0}
    ).to_list(100)

    return services

@api_router.get("/services/{service_id}")
async def get_service(service_id: str):

    service = await db.services.find_one(
        {"id": service_id},
        {"_id": 0}
    )

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found"
        )

    return service

@api_router.post("/services")
async def create_service(
    service: Service,
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    await db.services.insert_one(
        service.model_dump()
    )

    return service


# =========================
# CART
# =========================

@api_router.post("/cart")
async def add_to_cart(
    item: CartItem,
    current_user: User = Depends(get_current_user)
):

    cart = await db.carts.find_one(
        {"user_id": current_user.id},
        {"_id": 0}
    )

    if not cart:
        cart = {
            "user_id": current_user.id,
            "items": []
        }

    existing_item = next(
        (
            i for i in cart["items"]
            if i["item_id"] == item.item_id
        ),
        None
    )

    if existing_item:
        existing_item["quantity"] += item.quantity
    else:
        cart["items"].append(item.model_dump())

    await db.carts.update_one(
        {"user_id": current_user.id},
        {
            "$set": {
                "items": cart["items"]
            }
        },
        upsert=True
    )

    return cart


@api_router.get("/cart")
async def get_cart(
    current_user: User = Depends(get_current_user)
):

    cart = await db.carts.find_one(
        {"user_id": current_user.id},
        {"_id": 0}
    )

    if not cart:
        return {
            "user_id": current_user.id,
            "items": []
        }

    return cart


# =========================
# ORDERS
# =========================

@api_router.post("/orders")
async def create_order(
    shipping_address: ShippingAddress,
    current_user: User = Depends(get_current_user)
):

    cart = await db.carts.find_one(
        {"user_id": current_user.id},
        {"_id": 0}
    )

    if not cart or not cart.get("items"):
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    total = sum(
        item["price"] * item["quantity"]
        for item in cart["items"]
    )

    order = Order(
        user_id=current_user.id,
        items=[
            CartItem(**item)
            for item in cart["items"]
        ],
        total=total,
        shipping_address=shipping_address
    )

    await db.orders.insert_one(
        order.model_dump()
    )

    await db.carts.delete_one({
        "user_id": current_user.id
    })

    return order


# =========================
# HOTEL BOOKING
# =========================

@api_router.post("/orders/hotel-booking")
async def create_hotel_booking(
    booking: HotelBookingRequest,
    current_user: User = Depends(get_current_user)
):

    order = Order(
        user_id=current_user.id,
        items=[
            CartItem(
                item_id=booking.hotel_id,
                item_type="hotel_booking",
                name=booking.hotel_name,
                price=booking.total,
                quantity=1
            )
        ],
        total=booking.total
    )

    order_doc = order.model_dump()

    order_doc["booking_details"] = {
        "hotel_name": booking.hotel_name,
        "location": booking.location,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guests": booking.guests,
        "nights": booking.nights,
        "room_type": booking.room_type,
        "hotel_image": booking.hotel_image
    }

    await db.orders.insert_one(order_doc)

    return order


# =========================
# PAYMENT STATUS
# =========================

@api_router.get("/payments/{payment_id}/status")
async def get_payment_status(
    payment_id: str,
    current_user: User = Depends(get_current_user)
):

    payment = await db.payments.find_one(
        {"id": payment_id},
        {"_id": 0}
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment


# =========================
# NFTS
# =========================

@api_router.get("/nfts")
async def get_nfts(
    current_user: User = Depends(get_current_user)
):

    nfts = await db.nfts.find(
        {
            "owner_address":
            current_user.wallet_address
        },
        {"_id": 0}
    ).to_list(100)

    return nfts


# =========================
# REWARDS
# =========================

@api_router.get("/rewards")
async def get_rewards(
    current_user: User = Depends(get_current_user)
):

    rewards = await db.rewards.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).to_list(100)

    total = sum(
        r.get("amount", 0)
        for r in rewards
        if r.get("status") == "completed"
    )

    return {
        "rewards": rewards,
        "total": total
    }


# =========================
# ADMIN
# =========================

@api_router.get("/admin/stats")
async def get_admin_stats(
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return {
        "total_users":
            await db.users.count_documents({}),

        "total_orders":
            await db.orders.count_documents({}),

        "total_products":
            await db.products.count_documents({}),

        "pending_orders":
            await db.orders.count_documents({
                "status": "pending"
            })
    }


# =========================
# ROOT APP ROUTE
# =========================

@app.get("/")
async def home():
    return {
        "message": "Thruster Backend Running 🚀"
    }
# ROOT
# =========================

@api_router.get("/")
async def root():
    return {
        "message": "Thruster API",
        "status": "online"
    }


# =========================
# STARTUP
# =========================

@app.on_event("startup")
async def startup_db():

    await db.users.create_index(
        "email",
        unique=True
    )

    await db.orders.create_index(
        "user_id"
    )

    await db.payments.create_index(
        "payment_provider_id"
    )

    await db.nfts.create_index(
        "owner_address"
    )

    logger.info("Database indexes created")


# =========================
# SHUTDOWN
# =========================

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# =========================
# ROUTER
# =========================

app.include_router(api_router)

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "https://ecommerce-dapp-i9u9.vercel.app",
        "https://www.thruster.in",
        "http://localhost:3000",
        "http://localhost:19006"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
