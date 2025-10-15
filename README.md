# Domain Chat

A ChatGPT-like web application with industry-specific knowledge base using RAG (Retrieval-Augmented Generation). Built with Next.js 14, Supabase, and OpenAI.

## Features

### Core Features (MVP)
- **Authentication**: Email/password and magic link authentication
- **Chat Interface**: ChatGPT-style UI with streaming responses, code/markdown rendering, copy functionality, stop generation, and regenerate
- **Industry Profiles**: Admin can create/edit industry-specific AI profiles with custom system prompts, temperature, and top_k settings
- **RAG Integration**: Toggle knowledge base on/off per chat session
- **Document Management**: Upload PDFs, DOCX, TXT, MD files, add URLs, or paste text content
- **Vector Search**: Semantic search with citations and industry scoping
- **Admin Panel**: Complete CRUD operations for industry profiles and data sources

### Technical Features
- **Next.js 14** with App Router and TypeScript
- **Supabase** for authentication, database, storage, and pgvector
- **OpenAI** for chat completions and embeddings
- **LangChain** for document processing and RAG orchestration
- **shadcn/ui** components with dark mode support
- **Row Level Security (RLS)** for data isolation
- **Streaming responses** with Server-Sent Events (SSE)

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL with pgvector extension
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4o-mini, text-embedding-3-small
- **Document Processing**: LangChain, pdf-parse, mammoth
- **Deployment**: Vercel + Supabase

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd domain-chat
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database to get your service role key
4. Enable the pgvector extension in your Supabase dashboard:
   - Go to Database > Extensions
   - Search for "vector" and enable it

### 3. Database Schema

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the contents of supabase-schema.sql and run it in Supabase SQL editor
```

This will create:
- User profiles table
- Industry profiles table
- Data sources table
- Document chunks table with vector embeddings
- Chat sessions and messages tables
- Row Level Security policies
- Vector similarity search function

### 4. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
CHAT_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For Users

1. **Sign Up/In**: Visit `/auth` to create an account or sign in
2. **Start Chatting**: Go to `/` to start a new chat session
3. **Select Industry**: Choose an industry profile for context-specific responses
4. **Toggle RAG**: Enable/disable knowledge base for each chat
5. **Chat Features**:
   - Streaming responses
   - Copy messages
   - Stop generation
   - Regenerate responses
   - Citations from knowledge base

### For Admins

1. **Access Admin Panel**: Visit `/admin` (requires admin role)
2. **Manage Industry Profiles**:
   - Create new industry profiles
   - Edit system prompts, temperature, top_k settings
   - Delete profiles
3. **Manage Data Sources**:
   - Upload PDF, DOCX, TXT, MD files
   - Add URLs for web scraping
   - Paste text content directly
   - View processing status

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Chat
- `POST /api/chat` - Send message and get streaming response

### Industry Profiles
- `GET /api/industry-profiles` - List all profiles
- `POST /api/industry-profiles` - Create new profile
- `PUT /api/industry-profiles/[id]` - Update profile
- `DELETE /api/industry-profiles/[id]` - Delete profile

### Data Sources
- `GET /api/data-sources?industry_id=[id]` - List sources for industry
- `POST /api/data-sources` - Create new data source
- `POST /api/ingest` - Process and ingest document content

## Database Schema

### Tables

- **profiles**: User profiles extending Supabase auth.users
- **industry_profiles**: Industry-specific AI configurations
- **data_sources**: Document sources (files, URLs, text)
- **document_chunks**: Processed document chunks with embeddings
- **chat_sessions**: User chat sessions
- **chat_messages**: Individual chat messages

### Key Features

- **Vector Search**: Uses pgvector for semantic similarity search
- **RLS Policies**: Ensures users only see their own data
- **Automatic Embeddings**: Documents are automatically chunked and embedded
- **Citations**: Responses include source citations when using RAG

## Deployment

### Vercel Deployment

1. **Connect Repository**: Connect your GitHub repository to Vercel
2. **Environment Variables**: Add all environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically deploy on push to main branch

### Supabase Production Setup

1. **Create Production Project**: Create a new Supabase project for production
2. **Run Schema**: Execute the SQL schema in production database
3. **Update Environment**: Update production environment variables
4. **Configure Auth**: Set up authentication providers if needed

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
OPENAI_API_KEY=your_openai_api_key
CHAT_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_secret
```

## Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin panel
│   └── page.tsx           # Main chat interface
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── ChatInterface.tsx  # Main chat component
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client
│   ├── openai.ts          # OpenAI client
│   ├── langchain.ts       # LangChain utilities
│   └── document-processor.ts # Document processing
└── middleware.ts          # Next.js middleware
```

### Key Components

- **ChatInterface**: Main chat UI with streaming, controls, and message display
- **AuthProvider**: Authentication context and user management
- **AdminPanel**: Industry profiles and data sources management
- **Document Processor**: Handles PDF, DOCX, text processing and chunking

## Testing

### Manual Testing Checklist

- [ ] User registration and login works
- [ ] Non-admin users cannot access `/admin`
- [ ] Admin can create/edit industry profiles
- [ ] Admin can upload documents and process them
- [ ] Chat interface streams responses correctly
- [ ] RAG toggle works (shows different responses)
- [ ] Citations appear when RAG is enabled
- [ ] Stop generation works
- [ ] Regenerate response works
- [ ] Vector search returns relevant results

### Acceptance Tests

1. **Authentication**: Sign up/in works; non-admin blocked from `/admin`
2. **Industry Management**: Create industry, upload PDF, ask question, receive answer with citation
3. **RAG Toggle**: Toggle RAG off returns general answer with note
4. **Streaming**: SSE streaming visible in UI; "Stop" halts generation
5. **Deployment**: Build functions on Vercel with Supabase

## Troubleshooting

### Common Issues

1. **Vector Search Not Working**: Ensure pgvector extension is enabled in Supabase
2. **Authentication Errors**: Check Supabase URL and keys are correct
3. **Document Processing Fails**: Verify file formats are supported (PDF, DOCX, TXT, MD)
4. **OpenAI API Errors**: Check API key and rate limits
5. **Build Errors**: Ensure all environment variables are set

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` and checking browser console and server logs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the Supabase and OpenAI documentation
3. Open an issue on GitHub

---

**Built with ❤️ using Next.js, Supabase, and OpenAI**