# Internal Team Dashboard with AI Assistant

A dashboard for internal teams featuring an AI assistant to help with questions and knowledge management.

## Features

- **AI Assistant**: Ask questions and get AI-powered responses using OpenAI
- **Recent Messages**: View conversation history
- **Knowledge Base**: Save valuable Q&A pairs for future reference
- **Search & Tagging**: Organize and find saved knowledge efficiently
- **Pinned Answers**: Mark important answers for easy access
- **Content Moderation**: Basic filtering for saved content

## Project Structure

```
team-dashboard/
├── client/          # React frontend with Vite
├── server/          # Express.js backend with SQLite
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Set up the server:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. Set up the client:
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Create a `.env` file in the server using the `.env.example` as the template with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

1. Open the dashboard in your browser
2. Ask questions in the AI Assistant text box
3. View responses and conversation history
4. Save valuable answers to the knowledge base
5. Use tags and search to organize knowledge
6. Pin important answers for quick access

## Technologies Used

- **Frontend**: React, Vite, Axios
- **Backend**: Node.js, Express.js, Sequelize
- **Database**: SQLite
- **AI**: OpenAI API
- **Styling**: CSS3

## License

ISC