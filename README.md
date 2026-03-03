# 🛒 Kirana Express v2.0

A modern pre-order grocery store for your village kirana shop.

## 🚀 Deploy to Netlify (Step-by-step)

### Step 1: Upload Files
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"Add new site" → "Deploy manually"**
3. Drag & drop the entire `kirana_final` folder
4. Your site will be live instantly!

### Step 2: Set Environment Variables
Go to **Site Settings → Environment Variables** and add:

| Variable | Value | Description |
|---|---|---|
| `GMAIL_USER` | `your_gmail@gmail.com` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | `xxxx xxxx xxxx xxxx` | Gmail App Password (16 chars) |
| `OWNER_EMAIL` | `chaharanil568@gmail.com` | Where orders are sent |
| `SECRET_CODE` | `ORDER2026` | Secret code for customers |
| `OWNER_PHONE` | `8529488194` | Owner's phone number |
| `STORE_NAME` | `Kirana Express` | Your store name |
| `STORE_ADDRESS` | `Baiman , kiraoli, Agra , Uttar pradesh 283122` | Your store address |

### Step 3: Gmail App Password
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → 2-Step Verification (enable it)
3. App Passwords → Create one → Copy 16-char password
4. Paste it as `GMAIL_APP_PASSWORD` in Netlify

---

## 📁 File Structure

```
kirana_final/
├── index.html              ← Main website (all HTML/CSS/JS)
├── products.json           ← Product catalog (edit to change products)
├── netlify.toml            ← Netlify configuration
├── package.json            ← Dependencies
└── netlify/
    └── functions/
        └── send-order.js   ← Email function (runs on Netlify server)
```

## 🛍️ Adding/Editing Products

Edit `products.json`. Each product looks like this:

```json
{
  "id": 1,
  "name": "Aashirvaad Atta",
  "price": 58,
  "unit": "5 kg",
  "category": "Grains",
  "categories": ["Grains", "Daily Essentials"],
  "image": "https://...",
  "emoji": "🌾",
  "desc": ["Premium wheat", "Soft rotis"]
}
```

## ✅ Features
- 📱 Mobile-first responsive design
- 🛒 Cart with quantity controls (no layout break on mobile)
- 📍 GPS location detection
- 💾 Auto-fills customer details on return visits
- 🔒 Secret code protection against fake orders
- 📧 Beautiful professional email to owner + customer
- 📞 Call button on thank-you popup
- 💬 Special message/modification field
- 🎨 Blinkit-inspired clean UI
- No login, No payment gateway, COD only
