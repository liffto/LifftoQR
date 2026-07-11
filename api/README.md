# QR API

A lightweight FastAPI backend scaffold with layered architecture for controllers, services, repositories, and schemas.

## Application Setup

### Prerequisites

- Python 3.10+
- pip

### Installation

1. Clone the repository and navigate to the `api` directory:

```bash
cd api
```

2. A virtual environment is already created at `venv/`. Activate it:

```bash
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

3. Install dependencies:

```bash
pip3 install -r requirements.txt
```

### Run with Uvicorn directly

```bash
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```


The server starts at `http://localhost:8000`.

Interactive API docs are available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Test

```bash
source venv/bin/activate
pytest -q
```


4. end points 

POST /api/v1/locations
{
  "name": "Location: tiruppur",
  "url": "",
  "slug": "loc001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "lat": 12.0,
    "lng": 12.0,
    "label": "tiruppur"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/social-media

{
  "name": "Instagram: @karthik",
  "url": "https://www.zenmatrix.com",
  "slug": "soc001",
  "dynamic": true,
  "qr_type": "Dynamic QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "platform": "instagram",
    "handle": "karthik",
    "url": "www.zenmatrix.com"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/google-reviews

{
  "name": "Review: Karthik",
  "url": "https://www.google.com",
  "slug": "gr001",
  "dynamic": true,
  "qr_type": "Dynamic QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "url": "www.google.com",
    "businessName": "Karthik"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/pdfs

{
  "name": "PDF: sample",
  "url": "https://ww.pdflink.com",
  "slug": "pdf001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "url": "ww.pdflink.com"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/videos

{
  "name": "Video: sample",
  "url": "https://www.vediolink.com",
  "slug": "vid001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "url": "www.vediolink.com"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/audios

{
  "name": "Audio: Tamil",
  "url": "https://www.audio.com",
  "slug": "aud001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "url": "www.audio.com",
    "title": "Tamil"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/apps

{
  "name": "App: Karthik",
  "url": "https://yourapp.com",
  "slug": "app001",
  "dynamic": true,
  "qr_type": "Dynamic QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "iosUrl": "apps.apple.com",
    "androidUrl": "play.google.com",
    "fallbackUrl": "yourapp.com",
    "name": "Karthik"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/link-trees

{
  "name": "Links: Link tree",
  "url": "https://google.com",
  "slug": "lt001",
  "dynamic": true,
  "qr_type": "Dynamic QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "title": "Link tree",
    "links": [
      { "label": "link1", "url": "https://google.com" },
      { "label": "link2", "url": "https://zenmatrix.com" }
    ]
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/coupons

{
  "name": "Coupon: Marrage (sav20)",
  "url": "",
  "slug": "cpn001",
  "dynamic": true,
  "qr_type": "Dynamic QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "title": "Marrage",
    "code": "sav20",
    "expiry": "2026-07-24",
    "description": "20 % discount",
    "url": "www.karthik.in"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/invitations

{
  "name": "Invitation: marrage",
  "url": "https://www.welcome.com",
  "slug": "inv001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "title": "marrage",
    "url": "www.welcome.com"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/feedbacks

{
  "name": "Feedback: zenmatrix.in",
  "url": "https://www.zenmatrix.in?karthik=sddd",
  "slug": "fb001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "url": "www.zenmatrix.in",
    "prefillKey": "karthik",
    "prefillValue": "sddd"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}


POST /api/v1/events

{
  "name": "Event: Team Meeting",
  "url": "",
  "slug": "evt001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "title": "Team Meeting",
    "location": "Tiruppur Office",
    "start": "2026-07-20T10:00",
    "end": "2026-07-20T11:30",
    "all_day": false,
    "description": "Monthly review meeting"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/whatsapp

{
  "name": "WhatsApp: Karthik",
  "url": "",
  "slug": "wa001",
  "dynamic": true,
  "qr_type": "Dynamic QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "country_code": "91",
    "phone": "9876543210",
    "message": "Hi, I scanned your QR"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/phones
{
  "name": "Phone: Karthik",
  "url": "",
  "slug": "ph001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "phone": "+919876543210"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}


POST /api/v1/sms


{
  "name": "SMS: Support",
  "url": "",
  "slug": "sms001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "number": "+919876543210",
    "message": "Hello, I need help"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/emails

{
  "name": "Email: Karthik",
  "url": "",
  "slug": "em001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "to": "karthik@example.com",
    "subject": "Hello from QR",
    "body": "I scanned your email QR code."
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/vcards

{
  "name": "vCard: Karthik Eswaran",
  "url": "",
  "slug": "vc001",
  "dynamic": true,
  "qr_type": "Dynamic QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "photo": null,
    "logo": null,
    "first_name": "Karthik",
    "last_name": "Eswaran",
    "org": "Zenmatrix",
    "title": "Chartered Accountant",
    "phone": "+919876543210",
    "work_phone": "+914212345678",
    "email": "karthik@zenmatrix.com",
    "url": "https://www.zenmatrix.com",
    "street": "Main Street",
    "city": "Tiruppur",
    "state": "Tamil Nadu",
    "zip": "641601",
    "country": "India",
    "note": "Scan to save contact"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/wifis

{
  "name": "WiFi: Office",
  "url": "",
  "slug": "wifi001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "ssid": "Office-WiFi",
    "auth": "WPA",
    "hidden": false,
    "password": "MySecretPass123"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/texts

{
  "name": "Text: Welcome",
  "url": "https://example.com/text",
  "slug": "txt001",
  "dynamic": false,
  "qr_type": "Static QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "text": "Welcome to Zenmatrix. Thank you for scanning!"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}

POST /api/v1/websites

{
  "name": "Website: Zenmatrix",
  "url": "https://www.zenmatrix.com",
  "slug": "web001",
  "dynamic": true,
  "qr_type": "Dynamic QR",
  "folder": "Untitled",
  "status": true,
  "scans": 0,
  "content": {
    "url": "https://www.zenmatrix.com"
  },
  "template": {
    "logo": null,
    "logo_size": 0.4,
    "frame": "none",
    "frame_text": "SCAN ME",
    "body_pattern": "square",
    "body_gradient": false,
    "body_color_1": "#000000",
    "body_color_2": "#000000",
    "corner_style": 0,
    "corner_gradient": false,
    "corner_color_1": "#000000",
    "corner_color_2": "#000000",
    "background": "#FFFFFF"
  }
}
