#!/bin/bash

# Gemini APIキーをここに入力
GEMINI_API_KEY="YOUR_API_KEY_HERE"

# APIテスト
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" \
  -H 'Content-Type: application/json' \
  -H "X-goog-api-key: $GEMINI_API_KEY" \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "労災二次健診について簡単に説明してください"
          }
        ]
      }
    ]
  }' | python3 -m json.tool