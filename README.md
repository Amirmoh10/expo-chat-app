# Expo Chat App with OpenAI Streaming

A modern chat application built with Expo (React Native) that utilizes OpenAI's API with streaming responses. This app demonstrates how to implement real-time chat with GPT models using Expo's fetch streaming capabilities.

## Features

- [x] Real-time streaming responses from OpenAI's GPT models
- [x] Clean, intuitive chat interface
- [x] Secure API key storage using AsyncStorage
- [x] API key management (add/delete)

## Technologies Used

- **Expo SDK 52+**: For cross-platform mobile development
- **React Native**: Core UI framework
- **OpenAI API**: For generating AI responses
- **Expo Fetch with Streaming**: For handling streaming responses from the API
- **AsyncStorage**: For persisting the API key

## Prerequisites

- Node.js (v16 or newer)
- Expo Go app (for testing on physical devices)
- OpenAI API key ([Get one here](https://platform.openai.com/account/api-keys))

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/expo-chat-app.git
   cd expo-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Setup

You'll need an OpenAI API key to use this app:

1. Sign up or log in at [OpenAI](https://platform.openai.com/)
2. Navigate to [API Keys](https://platform.openai.com/account/api-keys) and create a new secret key
3. When you first run the app, you'll be prompted to enter this key
4. The key will be securely stored for future use (you can reset it from the app if needed)

## Running the App

1. Start the Expo development server:

   ```bash
   npx expo start
   ```

2. Use the Expo Go app on your device to scan the QR code, or:
   - Press `i` to open in iOS simulator
   - Press `a` to open in Android emulator

## How It Works

The app uses Expo's implementation of the Fetch API with streaming enabled to connect to OpenAI's completion API. When you send a message:

1. Your message is displayed in the chat
2. The app connects to OpenAI's API with streaming enabled
3. As text chunks arrive, they are parsed and gradually displayed in real-time

## Code Structure

- `App.tsx`: Main application component and UI
- `utils.tsx`: Utility functions for handling chat logic and API calls
- Styles are included in the components for simplicity
