# Team Dashboard Server

Express.js backend for the Internal Team Dashboard with AI Assistant.

## Features

- RESTful API for AI assistant and knowledge base
- OpenAI integration for chat functionality
- SQLite database with Sequelize ORM
- Rate limiting and security middleware
- Content moderation for saved answers

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
DB_PATH=./database.sqlite
CONTENT_MODERATION_ENABLED=true
```

## API Endpoints

### Messages
- `POST /api/messages` - Send message to AI assistant
- `GET /api/messages` - Get recent messages

### Knowledge Base
- `GET /api/knowledge-base` - Get knowledge base items (with search/filter)
- `POST /api/knowledge-base` - Save new knowledge base item
- `PUT /api/knowledge-base/:id` - Update knowledge base item
- `DELETE /api/knowledge-base/:id` - Delete knowledge base item

### Tags
- `GET /api/tags` - Get all available tags

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm start
```