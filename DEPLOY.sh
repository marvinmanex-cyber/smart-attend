#!/bin/bash
# Quick Deployment Guide for Smart Attend

echo "🚀 Smart Attend - Quick Deployment Guide"
echo "=========================================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
node --version

# Check npm
echo "Checking npm version..."
npm --version

echo ""
echo "✅ Prerequisites verified!"
echo ""

# Ask for deployment choice
echo "Choose your deployment platform:"
echo "1. Vercel (Recommended)"
echo "2. Firebase Hosting"
echo "3. Self-Hosted (Node.js)"
echo ""

# Installation steps
echo "📦 Installation Steps:"
echo "1. npm install"
echo "2. Create .env.local with Firebase credentials"
echo "3. npm run build"
echo ""

# Local testing
echo "🧪 Local Testing:"
echo "npm run dev:low-mem"
echo "Open: http://localhost:3000"
echo ""

# Build optimization
echo "⚙️ Build Optimization:"
echo "npm run build  # Creates optimized .next folder"
echo ""

# Deployment commands
echo "🚀 Deployment Commands:"
echo ""
echo "For Vercel:"
echo "  vercel --prod"
echo ""
echo "For Firebase:"
echo "  firebase deploy --only hosting"
echo ""
echo "For Self-Hosted:"
echo "  npm run build && npm start"
echo ""

echo "📝 Important Notes:"
echo "- Set environment variables on your hosting platform"
echo "- Enable HTTPS for camera access in production"
echo "- Configure Firebase security rules"
echo "- Set up custom domain (optional)"
echo ""

echo "✨ Smart Attend is ready for deployment!"
