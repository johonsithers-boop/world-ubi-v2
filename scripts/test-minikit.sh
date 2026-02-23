#!/bin/bash

# World UBI Coin - MiniKit Testing Setup
# This script helps you set up testing in the World App

echo "================================================"
echo "  World UBI Coin - MiniKit Testing Setup"
echo "================================================"
echo ""

# Check if ngrok is installed
if command -v ngrok &> /dev/null; then
    TUNNEL_CMD="ngrok"
    echo "[✓] ngrok is installed"
elif command -v zrok &> /dev/null; then
    TUNNEL_CMD="zrok"
    echo "[✓] zrok is installed"
else
    echo "[!] No tunnel tool found."
    echo "    Install one of these to test in World App:"
    echo ""
    echo "    Option 1 - ngrok (recommended):"
    echo "      brew install ngrok  # macOS"
    echo "      snap install ngrok  # Linux"
    echo "      Or visit: https://ngrok.com/download"
    echo ""
    echo "    Option 2 - zrok (free, no signup):"
    echo "      curl -sSf https://get.zrok.io | bash"
    echo ""
    exit 1
fi

# Get the App ID from .env.local
APP_ID=$(grep "NEXT_PUBLIC_APP_ID" .env.local 2>/dev/null | cut -d '=' -f2)

if [ -z "$APP_ID" ]; then
    echo "[!] NEXT_PUBLIC_APP_ID not found in .env.local"
    echo "    Please set your App ID from the Worldcoin Developer Portal"
    exit 1
fi

echo "[✓] App ID: $APP_ID"
echo ""

# Start the dev server in background
echo "[*] Starting Next.js dev server..."
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Start tunnel
echo ""
echo "[*] Starting tunnel..."
if [ "$TUNNEL_CMD" = "ngrok" ]; then
    ngrok http 3000 &
    TUNNEL_PID=$!
else
    zrok share public http://localhost:3000 &
    TUNNEL_PID=$!
fi

sleep 3

echo ""
echo "================================================"
echo "  Testing Instructions"
echo "================================================"
echo ""
echo "1. Copy the HTTPS URL from the tunnel output above"
echo ""
echo "2. Go to the Worldcoin Developer Portal:"
echo "   https://developer.worldcoin.org/"
echo ""
echo "3. Update your Mini App's URL to the tunnel URL"
echo ""
echo "4. Generate a QR code to test:"
echo "   https://worldcoin.org/mini-app?app_id=$APP_ID"
echo ""
echo "5. Scan the QR code with your phone camera"
echo ""
echo "6. Open in World App and test your mini app!"
echo ""
echo "================================================"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user to stop
wait $DEV_PID
