import httpx
import hmac
import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import base64

class CashfreePayment:
    """Handle Cashfree INR payments"""
    
    def __init__(self):
        self.client_id = os.getenv("CASHFREE_CLIENT_ID")
        self.client_secret = os.getenv("CASHFREE_CLIENT_SECRET")
        self.env = os.getenv("CASHFREE_ENV", "production")
        self.base_url = "https://api.cashfree.com" if self.env == "production" else "https://sandbox.cashfree.com"
    
    async def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create Cashfree order"""
        url = f"{self.base_url}/pg/orders"
        
        headers = {
            "x-client-id": self.client_id,
            "x-client-secret": self.client_secret,
            "x-api-version": "2023-08-01",
            "Content-Type": "application/json"
        }
        
        payload = {
            "order_id": order_data["order_id"],
            "order_amount": order_data["amount"],
            "order_currency": "INR",
            "customer_details": {
                "customer_id": order_data["user_id"],
                "customer_email": order_data["customer_email"],
                "customer_phone": order_data.get("customer_phone", "9999999999")
            },
            "order_meta": {
                "return_url": f"{os.getenv('FRONTEND_URL')}/payment-success?order_id={order_data['order_id']}",
                "notify_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:8001')}/api/webhooks/cashfree"
            }
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
    
    async def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get Cashfree order status"""
        url = f"{self.base_url}/pg/orders/{order_id}"
        
        headers = {
            "x-client-id": self.client_id,
            "x-client-secret": self.client_secret,
            "x-api-version": "2023-08-01"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    
    def verify_webhook_signature(self, timestamp: str, raw_body: str, signature: str) -> bool:
        """Verify Cashfree webhook signature"""
        try:
            message = timestamp + raw_body
            computed_signature = base64.b64encode(
                hmac.new(
                    self.client_secret.encode(),
                    message.encode(),
                    hashlib.sha256
                ).digest()
            ).decode()
            return hmac.compare_digest(computed_signature, signature)
        except Exception as e:
            print(f"Cashfree signature verification error: {e}")
            return False


class NOWPaymentsHandler:
    """Handle NOWPayments crypto payments"""
    
    def __init__(self):
        self.api_key = os.getenv("NOWPAYMENTS_API_KEY")
        self.ipn_secret = os.getenv("NOWPAYMENTS_IPN_SECRET")
        self.base_url = "https://api.nowpayments.io/v1"
    
    async def create_payment(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create NOWPayments crypto payment"""
        url = f"{self.base_url}/payment"
        
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "price_amount": order_data["amount"],
            "price_currency": "usd",
            "pay_currency": order_data.get("pay_currency", "btc"),
            "order_id": order_data["order_id"],
            "order_description": order_data.get("description", f"Order {order_data['order_id']}"),
            "ipn_callback_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:8001')}/api/webhooks/nowpayments"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
    
    async def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Get NOWPayments payment status"""
        url = f"{self.base_url}/payment/{payment_id}"
        
        headers = {"x-api-key": self.api_key}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    
    def verify_ipn_signature(self, raw_body: str, signature: str) -> bool:
        """Verify NOWPayments IPN signature"""
        try:
            payload = json.loads(raw_body)
            sorted_payload = json.dumps(payload, sort_keys=True, separators=(',', ':'))
            
            computed_signature = hmac.new(
                self.ipn_secret.encode(),
                sorted_payload.encode(),
                hashlib.sha512
            ).hexdigest()
            
            return hmac.compare_digest(computed_signature, signature)
        except Exception as e:
            print(f"NOWPayments signature verification error: {e}")
            return False


class NFTMinter:
    """Handle NFT minting after successful payment"""
    
    @staticmethod
    async def mint_product_nft(db, order_data: Dict[str, Any], payment_data: Dict[str, Any]):
        """Mint NFT for product purchase"""
        try:
            # Create NFT metadata
            nft_metadata = {
                "name": f"THRUSTER Purchase NFT #{order_data['id'][:8]}",
                "description": f"Proof of purchase for order {order_data['id']}",
                "image": "ipfs://QmTHRUSTER_LOGO_HASH",
                "attributes": [
                    {"trait_type": "Order ID", "value": order_data['id']},
                    {"trait_type": "Total Amount", "value": f"${order_data['total']}"},
                    {"trait_type": "Payment Method", "value": payment_data['method']},
                    {"trait_type": "Purchase Date", "value": datetime.now(timezone.utc).isoformat()},
                    {"trait_type": "Items Count", "value": len(order_data['items'])}
                ],
                "external_url": f"https://thruster.app/orders/{order_data['id']}"
            }
            
            # Add item details to metadata
            items_detail = []
            for item in order_data['items']:
                items_detail.append({
                    "name": item['name'],
                    "quantity": item['quantity'],
                    "price": item['price']
                })
            nft_metadata['attributes'].append({
                "trait_type": "Items",
                "value": json.dumps(items_detail)
            })
            
            # Store NFT in database
            nft_doc = {
                "id": f"nft_{order_data['id']}",
                "collection_id": "thruster_purchases",
                "owner_address": order_data.get('wallet_address', 'pending'),
                "metadata": nft_metadata,
                "nft_type": "purchase",
                "order_id": order_data['id'],
                "payment_id": payment_data['id'],
                "status": "minted",
                "minted_at": datetime.now(timezone.utc).isoformat(),
                "tx_hash": payment_data.get('tx_hash', 'pending')
            }
            
            await db.nfts.insert_one(nft_doc)
            print(f"✅ NFT minted for order {order_data['id']}")
            
            return nft_doc
            
        except Exception as e:
            print(f"❌ NFT minting error: {e}")
            return None
    
    @staticmethod
    async def mint_booking_nft(db, order_data: Dict[str, Any], payment_data: Dict[str, Any], booking_details: Dict[str, Any]):
        """Mint NFT for hotel booking"""
        try:
            # Create hotel booking NFT metadata
            nft_metadata = {
                "name": f"Hotel Booking #{order_data['id'][:8]}",
                "description": f"Digital proof of hotel reservation at {booking_details.get('hotel_name', 'Hotel')}",
                "image": booking_details.get('hotel_image', "ipfs://QmTHRUSTER_HOTEL_HASH"),
                "attributes": [
                    {"trait_type": "Hotel", "value": booking_details.get('hotel_name', 'N/A')},
                    {"trait_type": "Location", "value": booking_details.get('location', 'N/A')},
                    {"trait_type": "Room Type", "value": booking_details.get('room_type', 'N/A')},
                    {"trait_type": "Check-in", "value": booking_details.get('check_in', 'N/A')},
                    {"trait_type": "Check-out", "value": booking_details.get('check_out', 'N/A')},
                    {"trait_type": "Nights", "value": booking_details.get('nights', 0)},
                    {"trait_type": "Guests", "value": booking_details.get('guests', 1)},
                    {"trait_type": "Total Amount", "value": f"${order_data['total']}"},
                    {"trait_type": "Booking Date", "value": datetime.now(timezone.utc).isoformat()}
                ],
                "external_url": f"https://thruster.app/bookings/{order_data['id']}"
            }
            
            # Store hotel booking NFT
            nft_doc = {
                "id": f"nft_booking_{order_data['id']}",
                "collection_id": "thruster_hotel_bookings",
                "owner_address": order_data.get('wallet_address', 'pending'),
                "metadata": nft_metadata,
                "nft_type": "hotel_booking",
                "order_id": order_data['id'],
                "payment_id": payment_data['id'],
                "booking_details": booking_details,
                "status": "minted",
                "minted_at": datetime.now(timezone.utc).isoformat(),
                "tx_hash": payment_data.get('tx_hash', 'pending')
            }
            
            await db.nfts.insert_one(nft_doc)
            print(f"✅ Hotel booking NFT minted for order {order_data['id']}")
            
            return nft_doc
            
        except Exception as e:
            print(f"❌ Hotel booking NFT minting error: {e}")
            return None


# Initialize handlers
cashfree = CashfreePayment()
nowpayments = NOWPaymentsHandler()
nft_minter = NFTMinter()
