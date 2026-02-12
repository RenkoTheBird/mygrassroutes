import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';
import fs from 'fs';
import dotenv from 'dotenv';
import { initDatabase, dbQuery, convertQuery, isDatabaseAvailable, getPool } from './src/database/db.js';
import { 
  securityHeaders, 
  createRateLimiter, 
  authRateLimiter, 
  paymentRateLimiter,
  validateInput,
  validationRules 
} from './server/middleware/security.js';
import { verifyFirebaseToken } from './server/middleware/auth.js';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Trust proxy for Railway (needed for rate limiting to work correctly behind reverse proxy)
// Set to 1 to only trust the first proxy (Railway's reverse proxy)
// This is more secure than 'true' which trusts all proxies
app.set('trust proxy', 1);

// Define PORT
const PORT = process.env.PORT || 3001;

// Initialize Stripe only if secret key is provided
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Initialize database (PostgreSQL)
let dbInitialized = false;

// Start server function
function startServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Server running on http://localhost:${PORT}`);
    console.log(`[SERVER] Network access: http://${getLocalIP()}:${PORT}`);
    console.log(`[SERVER] API endpoints available at http://localhost:${PORT}/api`);
    if (!stripe) {
      console.warn(`[SERVER] WARNING: Stripe is not configured. Payment features will not work.`);
    }
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[SERVER] ERROR: Port ${PORT} is already in use. Please stop the other process or change the PORT environment variable.`);
    } else {
      console.error(`[SERVER] ERROR: Failed to start server:`, err);
    }
    process.exit(1);
  });
}

// Async initialization function
(async function initializeServer() {
  try {
    dbInitialized = await initDatabase();
    if (dbInitialized) {
      console.log('[SERVER] Database initialized successfully');
    } else {
      console.warn('[SERVER] WARNING: Database not initialized. Some endpoints may not work.');
      console.warn('[SERVER] To fix: Add a PostgreSQL service in Railway and link it to your web service');
    }
    
    // Start the server even if database initialization failed
    startServer();
  } catch (error) {
    console.error('[SERVER] ERROR: Failed to initialize server:', error);
    process.exit(1);
  }
})();

// ==================== SECURITY MIDDLEWARE ====================
// Apply security headers first
app.use(securityHeaders);

// Configure CORS with stricter production settings
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin requests)
    // Same-origin requests don't send an Origin header
    if (!origin) {
      console.log('[CORS] Allowing request with no origin (same-origin or non-browser)');
      return callback(null, true);
    }
    
    console.log('[CORS] Checking origin:', origin);
    
    // In production, allow requests from the production domain
    const allowedOrigins = [
      'https://www.mygrassroutes.com',
      'https://mygrassroutes.com',
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    
    // Also allow any Railway domains (for testing and deployment)
    // Railway uses various domain patterns: *.railway.app, *.up.railway.app, etc.
    if (origin.includes('railway.app') || origin.includes('railway.xyz')) {
      console.log('[CORS] Allowing Railway domain:', origin);
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('[CORS] Allowing known origin:', origin);
      callback(null, true);
    } else {
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        console.log('[CORS] Development mode - allowing origin:', origin);
        callback(null, true);
      } else {
        // In production, reject unknown origins
        console.error('[CORS] Rejecting origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Body parser with size limits to prevent DoS attacks
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded payload size

// Global Questions Counter API endpoints (defined BEFORE rate limiter to exclude them)
// Get the current questions answered count
app.get('/api/global-counter/count', async (req, res) => {
  if (!isDatabaseAvailable()) {
    return res.status(503).json({ 
      error: 'Database is not available',
      message: 'Please configure DATABASE_URL environment variable.'
    });
  }
  
  try {
    const result = await dbQuery.get(
      'SELECT count FROM global_questions_counter ORDER BY id DESC LIMIT 1'
    );
    
    const count = result ? result.count : 0;
    res.json({ count });
  } catch (error) {
    console.error('[API] Error getting counter:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Increment the global questions answered counter
app.post('/api/global-counter/increment', 
  verifyFirebaseToken(true), // Require authentication
  validateInput([validationRules.userId, validationRules.lessonIdBody, validationRules.questionCount]),
  async (req, res) => {
  if (!isDatabaseAvailable()) {
    return res.status(503).json({ 
      error: 'Database is not available',
      message: 'Please configure DATABASE_URL environment variable.'
    });
  }
  
  try {
    const { userId, lessonId, questionCount } = req.body;
    
    if (!userId || !lessonId || questionCount === undefined || questionCount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid parameters',
        message: 'userId, lessonId, and questionCount (positive number) are required'
      });
    }
    
    const lessonIdStr = String(lessonId);
    const timestamp = Date.now();
    const completionId = `${userId}_${lessonIdStr}_${Math.floor(timestamp / 1000)}`;
    
    // Check if this completion was already processed
    const existingCompletion = await dbQuery.get(
      'SELECT id FROM question_completions WHERE completion_id = $1',
      [completionId]
    );
    
    if (existingCompletion) {
      console.log('[API] Completion already processed, skipping:', completionId);
      return res.json({ success: true, message: 'Already processed', count: null });
    }
    
    // Use a transaction to ensure atomicity
    const pgPool = getPool();
    if (!pgPool) {
      return res.status(503).json({ error: 'Database pool not available' });
    }
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      
      // Mark this completion as processed
      await client.query(
        'INSERT INTO question_completions (completion_id, user_id, lesson_id, question_count) VALUES ($1, $2, $3, $4)',
        [completionId, userId, lessonIdStr, questionCount]
      );
      
      // Increment the counter
      const result = await client.query(
        'UPDATE global_questions_counter SET count = count + $1, last_updated = CURRENT_TIMESTAMP RETURNING count',
        [questionCount]
      );
      
      await client.query('COMMIT');
      
      const newCount = result.rows[0].count;
      console.log('[API] Counter incremented by', questionCount, 'to', newCount);
      
      res.json({ success: true, count: newCount });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[API] Error incrementing counter:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Apply rate limiting (after counter routes to exclude them)
const generalRateLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes
app.use('/api', generalRateLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Stripe Checkout endpoint with rate limiting and validation
app.post('/create-checkout-session', 
  paymentRateLimiter,
  validateInput([validationRules.paymentAmount, validationRules.currency]),
  async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' 
      });
    }

    const { amount, currency = 'usd' } = req.body;

    // Validate amount (minimum $1)
    if (!amount || amount < 100) { // Stripe uses cents
      return res.status(400).json({ error: 'Amount must be at least $1.00' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Donation to mygrassroutes',
              description: 'Support civic education and engagement',
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/pathway?payment=success`,
      cancel_url: `${req.headers.origin}/pathway?payment=cancelled`,
    });

    // Return both id and url for compatibility
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Database API endpoints
// Create mock data for units/sections/lessons
// and use the actual questions table for questions

// Mock data for units (since they don't exist in the database)
const mockUnits = [
  {
    id: 1,
    title: "Grassroots Movements",
    description: "Change starts from the ground up. Learn how people like you have shifted laws, won rights, and sparked revolutions.",
    color: "#ef4444",
    position_x: 20,
    position_y: 15
  },
  {
    id: 2,
    title: "The Media",
    description: "See how news shapes narratives — and how you can spot bias, influence coverage, and make your voice heard.",
    color: "#f97316",
    position_x: 35,
    position_y: 25
  },
  {
    id: 3,
    title: "Politics in Our Lives",
    description: "Politics touches every part of your daily experience — school, housing, internet access. Learn to trace the impact.",
    color: "#eab308",
    position_x: 50,
    position_y: 20
  },
  {
    id: 4,
    title: "Politics in History",
    description: "Discover the real stories of how change was made. From civil rights to the suffrage movement, history is a playbook.",
    color: "#22c55e",
    position_x: 65,
    position_y: 30
  },
  {
    id: 5,
    title: "Bureaucracy",
    description: "Paperwork and policy aren't sexy — but they're powerful. This unit shows you how decisions get made behind the scenes.",
    color: "#3b82f6",
    position_x: 80,
    position_y: 25
  },
  {
    id: 6,
    title: "Political Science",
    description: "Get grounded in systems thinking, ideology, power structures — without the boring lecture hall.",
    color: "#8b5cf6",
    position_x: 30,
    position_y: 45
  },
  {
    id: 7,
    title: "The Role of the Citizen",
    description: "Here's where it gets personal. Learn your rights, your responsibilities, and your many ways to act — right now.",
    color: "#ec4899",
    position_x: 70,
    position_y: 50
  }
];

app.get('/api/units', (req, res) => {
  try {
    res.json(mockUnits);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

app.get('/api/sections/:unitId', 
  validateInput([validationRules.unitId]),
  (req, res) => {
  try {
    const { unitId } = req.params;
    const unit = parseInt(unitId);
    console.log(`[SERVER] Fetching sections for unit ${unit} at ${new Date().toISOString()}`);
    
    // Define section templates for each unit
    const sectionTemplates = {
      1: { // Grassroots Movements
        sections: [
          { section_number: 1, title: "The nature of a movement", description: "What makes a movement successful" },
          { section_number: 2, title: "Defining real change", description: "The search for sustainability" },
          { section_number: 3, title: "Protests", description: "Uniting to complain or dissent" },
          { section_number: 4, title: "Interest groups", description: "Uniting with organization" },
          { section_number: 5, title: "Boycotts", description: "Protesting through avoidance" },
          { section_number: 6, title: "Petitions", description: "Little actions add up" },
          { section_number: 7, title: "Starting your own movement", description: "Take action for change" }
        ]
      },
      2: { // The Media
        sections: [
          { section_number: 1, title: "Media Literacy", description: "Understanding how media works" },
          { section_number: 2, title: "Bias Recognition", description: "Identifying different types of bias" },
          { section_number: 3, title: "Fact Checking", description: "Verifying information accuracy" },
          { section_number: 4, title: "Social Media", description: "Navigating digital platforms" },
          { section_number: 5, title: "Media Creation", description: "Creating your own content" },
          { section_number: 6, title: "Media Strategy", description: "Using media for your cause" },
          { section_number: 7, title: "Digital Citizenship", description: "Responsible online engagement" }
        ]
      },
      3: { // Politics in Our Lives
        sections: [
          { section_number: 1, title: "Local Politics", description: "Understanding municipal government" },
          { section_number: 2, title: "Education Policy", description: "How schools are governed" },
          { section_number: 3, title: "Housing & Zoning", description: "Community development decisions" },
          { section_number: 4, title: "Transportation", description: "Public transit and infrastructure" },
          { section_number: 5, title: "Environmental Policy", description: "Local environmental decisions" },
          { section_number: 6, title: "Public Safety", description: "Police and emergency services" },
          { section_number: 7, title: "Community Services", description: "Libraries, parks, and recreation" }
        ]
      },
      4: { // Politics in History
        sections: [
          { section_number: 1, title: "Civil Rights Era", description: "The fight for equality" },
          { section_number: 2, title: "Women's Rights", description: "The suffrage and feminist movements" },
          { section_number: 3, title: "Labor Rights", description: "Workers organizing for better conditions" },
          { section_number: 4, title: "Anti-War Movements", description: "Citizens opposing military conflicts" },
          { section_number: 5, title: "Environmental Activism", description: "Protecting our planet" },
          { section_number: 6, title: "Immigration Rights", description: "Fighting for immigrant communities" },
          { section_number: 7, title: "Lessons Learned", description: "What history teaches us" }
        ]
      },
      5: { // Bureaucracy
        sections: [
          { section_number: 1, title: "Understanding Agencies", description: "How government departments work" },
          { section_number: 2, title: "Regulatory Process", description: "How rules are made and enforced" },
          { section_number: 3, title: "Public Records", description: "Accessing government information" },
          { section_number: 4, title: "Permits & Licenses", description: "Navigating regulatory requirements" },
          { section_number: 5, title: "Public Comment", description: "Having your voice heard" },
          { section_number: 6, title: "Appeals Process", description: "Challenging government decisions" },
          { section_number: 7, title: "Transparency", description: "Promoting government openness" }
        ]
      },
      6: { // Political Science
        sections: [
          { section_number: 1, title: "Government Systems", description: "Different approaches to governance" },
          { section_number: 2, title: "Political Theory", description: "Understanding political philosophies" },
          { section_number: 3, title: "Power & Authority", description: "How power is distributed" },
          { section_number: 4, title: "Elections", description: "How voting systems work" },
          { section_number: 5, title: "Political Parties", description: "Role of parties in democracy" },
          { section_number: 6, title: "Interest Groups", description: "How organizations influence policy" },
          { section_number: 7, title: "International Relations", description: "How nations interact" }
        ]
      },
      7: { // The Role of the Citizen
        sections: [
          { section_number: 1, title: "Rights & Responsibilities", description: "What citizenship means" },
          { section_number: 2, title: "Voting & Elections", description: "Making your voice count" },
          { section_number: 3, title: "Community Service", description: "Serving your community" },
          { section_number: 4, title: "Public Participation", description: "Engaging in civic life" },
          { section_number: 5, title: "Advocacy", description: "Speaking up for causes" },
          { section_number: 6, title: "Leadership", description: "Taking on leadership roles" },
          { section_number: 7, title: "Building Democracy", description: "Strengthening democratic institutions" }
        ]
      }
    };
    
    // Get the section template for this unit, or default to Unit 1
    const unitTemplate = sectionTemplates[unit] || sectionTemplates[1];
    
    // Create sections with proper IDs and positioning
    const sections = unitTemplate.sections.map((section, index) => ({
      id: (unit - 1) * 7 + section.section_number, // Unique ID across all units
      unit_id: unit,
      section_number: section.section_number,
      title: section.title,
      description: section.description,
      position_x: 15 + (index * 10), // Spread sections horizontally
      position_y: 10 + (index * 2)    // Slight vertical variation
    }));
    
    console.log(`[SERVER] Returning ${sections.length} sections for unit ${unit}`);
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

app.get('/api/lessons/:sectionId', 
  validateInput([validationRules.sectionId]),
  (req, res) => {
  try {
    const { sectionId } = req.params;
    const sectionNum = parseInt(sectionId);
    console.log(`[SERVER] /api/lessons/${sectionId} - Fetching lessons (parsed as sectionNum: ${sectionNum})`);
    
    // Determine which unit this section belongs to
    // Assuming 7 sections per unit: sections 1-7 = Unit 1, sections 8-14 = Unit 2, etc.
    const unitId = Math.ceil(sectionNum / 7);
    const sectionInUnit = ((sectionNum - 1) % 7) + 1;
    
    // Map section number to letter (1=a, 2=b, 3=c, 4=d, 5=e, 6=f, 7=g)
    const sectionLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const sectionLetter = sectionLetters[sectionInUnit - 1] || 'a';
    
    // Create lessons with unique IDs that include section information
    // Each section gets 6 lessons with IDs: (sectionNum-1)*6 + 1 to (sectionNum-1)*6 + 6
    const baseId = (sectionNum - 1) * 6;
    
    // Define lesson templates for each unit and section
    const lessonTemplates = {
      1: { // Grassroots Movements
        a: { // The nature of a movement
          A: { title: 'The power of the desk', description: 'Create change from where you sit' },
          B: { title: 'Change throughout history', description: 'How change became a means of reform' },
          C: { title: 'Change today', description: 'How change is built through community today' },
          D: { title: 'Join a cause, or create it?', description: 'Understand where your wants stand' },
          E: { title: 'Understand your core idea', description: 'Learn to pitch and spread your ideas' },
          F: { title: 'Contacting representatives', description: 'The importance of local politics' }
        },
        b: { // Defining real change
          A: { title: 'Sustained change', description: 'Distinguishing between symbolic and substantive change' },
          B: { title: 'Laws', description: 'Change, codified' },
          C: { title: 'Opinion', description: 'Change, baked into society' },
          D: { title: 'The Parties', description: 'How they define our beliefs' },
          E: { title: 'Money', description: 'Corporate power and its influence' },
          F: { title: 'Normalcy', description: 'Building change that lasts' }
        },
        c: { // Protests
          A: { title: 'First Amendment: Protests', description: 'The legality of protests' },
          B: { title: 'To what end?', description: 'Defining your protest\'s goals' },
          C: {title: 'Rights as a protestor', description: 'Understanding your rights and responsibilities' },
          D: { title: 'Projecting your image', description: 'Shape what the media sees' },
          E: { title: 'Fourth Amendment: Warrants', description: 'What police need to start a search' },
          F: { title: 'Fourth Amendment: Searches', description: 'What police can do during a search' }
        },
        d: { // Interest groups
          A: { title: 'What is an interest?', description: 'Organized rallying around a cause' },
          B: { title: 'Types of interest groups', description: 'And how they affect policy' },
          C: { title: 'Joining an interest group', description: 'Should you get involved?' },
          D: { title: 'Grassroots interests', description: 'Transitioning from sparks to organized flame' },
          E: { title: 'Benefits & downsides', description: 'Slow yet powerful lobbying' },
          F: { title: 'Influence', description: 'Understanding the group\'s effectiveness' }
        },
        e: { // Boycotts
          A: { title: 'Organization', description: 'Individual choices for collective impact' },
          B: { title: 'Purchases', description: 'Boycotts through not buying something' },
          C: { title: 'Avoidance', description: 'Boycotts through not using something' },
          D: { title: 'Impact', description: 'The actual effect of a boycott' },
          E: { title: 'Sustainability', description: 'Maintaining pressure' },
          F: { title: 'Spread', description: 'Spreading the word' }
        },
        f: { // Petitions
          A: { title: 'First Amendment: Petitions', description: 'The legality of petitions' },
          B: { title: 'Requirements', description: 'Petition requirements and processes' },
          C: { title: 'Restrictions', description: 'What a petition can\'t do' },
          D: { title: 'Ballot', description: 'Collecting signatures and spreading awareness' },
          E: { title: 'Online', description: 'Collecting signatures online' },
          F: { title: 'Nuances', description: 'Every petition has an impact' }
        },
        g: { // Starting your own movement
          A: { title: 'What\'s in a name?', description: 'Unite your movement under a moniker' },
          B: { title: 'The initial spread', description: 'Recruiting allies and supporters' },
          C: { title: 'Reaching your base', description: 'Find like-minded individuals in your community' },
          D: { title: 'The political swing', description: 'Develop awareness of the other side' },
          E: { title: 'Creating opening change', description: 'Bring your movement into the limelight' },
          F: { title: 'Sustaining momentum', description: 'Keep your movement strong over time' }
        }
      },
      2: { // The Media
        a: { // Media Literacy
          A: { title: 'Understanding Media', description: 'How media shapes our worldview' },
          B: { title: 'Media Consumption Patterns', description: 'How we consume news and information' },
          C: { title: 'Critical Media Analysis', description: 'Questioning what you see and hear' },
          D: { title: 'Media Ownership', description: 'Who controls the media we consume' },
          E: { title: 'Media Influence', description: 'How media affects public opinion' },
          F: { title: 'Digital Media Landscape', description: 'Navigating the modern media environment' }
        },
        b: { // Bias Recognition
          A: { title: 'Types of Media Bias', description: 'Understanding different forms of bias' },
          B: { title: 'Political Bias', description: 'Recognizing partisan perspectives in media' },
          C: { title: 'Commercial Bias', description: 'How advertising influences content' },
          D: { title: 'Cultural Bias', description: 'Recognizing cultural assumptions in media' },
          E: { title: 'Confirmation Bias', description: 'How we seek information that confirms our views' },
          F: { title: 'Overcoming Bias', description: 'Strategies for consuming balanced media' }
        },
        c: { // Fact Checking
          A: { title: 'The Importance of Facts', description: 'Why accurate information matters' },
          B: { title: 'Fact-Checking Tools', description: 'Resources for verifying information' },
          C: { title: 'Source Evaluation', description: 'Assessing the credibility of sources' },
          D: { title: 'Misinformation vs Disinformation', description: 'Understanding different types of false information' },
          E: { title: 'Fact-Checking Process', description: 'Step-by-step verification methods' },
          F: { title: 'Teaching Others', description: 'Helping others develop fact-checking skills' }
        },
        d: { // Social Media
          A: { title: 'Social Media\'s Role', description: 'How social platforms shape public discourse' },
          B: { title: 'Algorithm Influence', description: 'How algorithms determine what you see' },
          C: { title: 'Echo Chambers', description: 'Understanding filter bubbles and confirmation bias' },
          D: { title: 'Viral Content', description: 'How information spreads on social media' },
          E: { title: 'Social Media Activism', description: 'Using platforms for social change' },
          F: { title: 'Digital Citizenship', description: 'Responsible behavior in online spaces' }
        },
        e: { // Media Creation
          A: { title: 'Creating Your Message', description: 'Crafting compelling content for your cause' },
          B: { title: 'Visual Storytelling', description: 'Using images and videos effectively' },
          C: { title: 'Writing for Impact', description: 'Creating written content that resonates' },
          D: { title: 'Podcasting and Audio', description: 'Using audio content to reach audiences' },
          E: { title: 'Building Your Audience', description: 'Growing your media presence' },
          F: { title: 'Ethics in Media Creation', description: 'Creating content responsibly' }
        },
        f: { // Media Strategy
          A: { title: 'Media Campaign Planning', description: 'Developing comprehensive media strategies' },
          B: { title: 'Press Relations', description: 'Working with journalists and media outlets' },
          C: { title: 'Crisis Communication', description: 'Managing media during difficult times' },
          D: { title: 'Social Media Strategy', description: 'Leveraging social platforms for your cause' },
          E: { title: 'Measuring Media Impact', description: 'Tracking the effectiveness of your media efforts' },
          F: { title: 'Adapting Your Strategy', description: 'Adjusting your approach based on results' }
        },
        g: { // Digital Citizenship
          A: { title: 'Digital Rights', description: 'Understanding your rights in digital spaces' },
          B: { title: 'Privacy and Security', description: 'Protecting yourself online' },
          C: { title: 'Online Harassment', description: 'Recognizing and responding to digital abuse' },
          D: { title: 'Digital Divide', description: 'Understanding unequal access to technology' },
          E: { title: 'Technology and Democracy', description: 'How tech affects civic participation' },
          F: { title: 'Future of Digital Citizenship', description: 'Preparing for tomorrow\'s digital world' }
        }
      },
      3: { // Politics in Our Lives
        a: { // Local Politics
          A: { title: 'City Council Basics', description: 'Understanding municipal government structure' },
          B: { title: 'Mayor\'s Role', description: 'How mayors shape local policy' },
          C: { title: 'Local Elections', description: 'Participating in municipal democracy' },
          D: { title: 'City Budget Process', description: 'How local governments allocate resources' },
          E: { title: 'Public Meetings', description: 'Attending and participating in local government' },
          F: { title: 'Local Advocacy', description: 'Influencing local policy decisions' }
        },
        b: { // Education Policy
          A: { title: 'School Board Power', description: 'How school boards shape education' },
          B: { title: 'Education Funding', description: 'Understanding how schools are financed' },
          C: { title: 'Curriculum Decisions', description: 'Who decides what students learn' },
          D: { title: 'Teacher Rights', description: 'Understanding educator protections and responsibilities' },
          E: { title: 'Student Rights', description: 'Legal protections for students' },
          F: { title: 'Parent Involvement', description: 'How parents can influence education policy' }
        },
        c: { // Housing & Zoning
          A: { title: 'Zoning Basics', description: 'Understanding how land use is regulated' },
          B: { title: 'Housing Policy', description: 'How governments address housing needs' },
          C: { title: 'Affordable Housing', description: 'Strategies for creating accessible housing' },
          D: { title: 'Development Process', description: 'How new construction gets approved' },
          E: { title: 'Community Input', description: 'Having your voice heard in development decisions' },
          F: { title: 'Gentrification', description: 'Understanding neighborhood change and displacement' }
        },
        d: { // Transportation
          A: { title: 'Public Transit', description: 'How cities plan and fund public transportation' },
          B: { title: 'Infrastructure Investment', description: 'Building and maintaining transportation systems' },
          C: { title: 'Traffic Management', description: 'How cities address congestion and safety' },
          D: { title: 'Alternative Transportation', description: 'Supporting biking, walking, and other options' },
          E: { title: 'Environmental Impact', description: 'How transportation affects the environment' },
          F: { title: 'Accessibility', description: 'Ensuring transportation serves all community members' }
        },
        e: { // Environmental Policy
          A: { title: 'Local Environmental Issues', description: 'Understanding environmental challenges in your community' },
          B: { title: 'Air Quality', description: 'How cities address air pollution' },
          C: { title: 'Water Management', description: 'Protecting and managing water resources' },
          D: { title: 'Waste Management', description: 'How communities handle waste and recycling' },
          E: { title: 'Green Spaces', description: 'The importance of parks and natural areas' },
          F: { title: 'Climate Action', description: 'Local responses to climate change' }
        },
        f: { // Public Safety
          A: { title: 'Police and Community', description: 'Building relationships between police and residents' },
          B: { title: 'Crime Prevention', description: 'Community-based approaches to safety' },
          C: { title: 'Emergency Services', description: 'How cities provide emergency response' },
          D: { title: 'Public Health', description: 'Protecting community health and safety' },
          E: { title: 'Mental Health Services', description: 'Addressing mental health in public safety' },
          F: { title: 'Community Policing', description: 'Alternative approaches to law enforcement' }
        },
        g: { // Community Services
          A: { title: 'Public Libraries', description: 'The role of libraries in community life' },
          B: { title: 'Parks and Recreation', description: 'Providing spaces for community activities' },
          C: { title: 'Social Services', description: 'Supporting vulnerable community members' },
          D: { title: 'Cultural Programs', description: 'Supporting arts and culture in communities' },
          E: { title: 'Senior Services', description: 'Meeting the needs of older residents' },
          F: { title: 'Youth Programs', description: 'Supporting young people in the community' }
        }
      },
      4: { // Politics in History
        a: { // Civil Rights Era
          A: { title: 'Jim Crow Laws', description: 'Understanding legal segregation and discrimination' },
          B: { title: 'Brown v. Board', description: 'The landmark case that changed education' },
          C: { title: 'Montgomery Bus Boycott', description: 'How Rosa Parks sparked a movement' },
          D: { title: 'March on Washington', description: 'The power of peaceful mass demonstration' },
          E: { title: 'Civil Rights Act', description: 'Legislative victories for equality' },
          F: { title: 'Voting Rights Act', description: 'Protecting the right to vote for all citizens' }
        },
        b: { // Women's Rights
          A: { title: 'Seneca Falls Convention', description: 'The beginning of organized women\'s rights' },
          B: { title: 'Suffrage Movement', description: 'The long fight for women\'s right to vote' },
          C: { title: '19th Amendment', description: 'Achieving women\'s suffrage in America' },
          D: { title: 'Second Wave Feminism', description: 'The women\'s liberation movement of the 1960s-70s' },
          E: { title: 'Equal Rights Amendment', description: 'The ongoing fight for constitutional equality' },
          F: { title: 'Modern Feminism', description: 'Contemporary women\'s rights movements' }
        },
        c: { // Labor Rights
          A: { title: 'Industrial Revolution', description: 'How industrialization changed work and workers' },
          B: { title: 'Early Labor Unions', description: 'The birth of organized labor in America' },
          C: { title: 'Labor Strikes', description: 'How workers used collective action to demand rights' },
          D: { title: 'New Deal Labor Laws', description: 'Government protection for workers\' rights' },
          E: { title: 'Post-War Labor', description: 'Labor movements in the mid-20th century' },
          F: { title: 'Modern Labor Issues', description: 'Contemporary challenges facing workers' }
        },
        d: { // Anti-War Movements
          A: { title: 'Vietnam War Opposition', description: 'How citizens organized against the Vietnam War' },
          B: { title: 'Draft Resistance', description: 'Individual and collective refusal to serve' },
          C: { title: 'Student Protests', description: 'How young people led anti-war movements' },
          D: { title: 'Media Coverage', description: 'How news coverage influenced public opinion' },
          E: { title: 'Political Impact', description: 'How anti-war movements affected elections' },
          F: { title: 'Lessons for Today', description: 'Applying anti-war movement strategies to modern conflicts' }
        },
        e: { // Environmental Activism
          A: { title: 'Earth Day Origins', description: 'How Earth Day launched environmental awareness' },
          B: { title: 'Environmental Laws', description: 'Legislative victories for environmental protection' },
          C: { title: 'Grassroots Environmentalism', description: 'Community-based environmental action' },
          D: { title: 'Climate Change Awareness', description: 'The evolution of climate activism' },
          E: { title: 'Environmental Justice', description: 'Addressing environmental racism and inequality' },
          F: { title: 'Modern Environmental Movements', description: 'Contemporary climate and environmental activism' }
        },
        f: { // Immigration Rights
          A: { title: 'Immigration History', description: 'Understanding America\'s immigration story' },
          B: { title: 'Immigration Laws', description: 'How immigration policy has evolved' },
          C: { title: 'Immigrant Rights Movements', description: 'Organizing for immigrant communities' },
          D: { title: 'Refugee Protection', description: 'Supporting those fleeing persecution' },
          E: { title: 'DACA and Dreamers', description: 'Fighting for undocumented youth' },
          F: { title: 'Modern Immigration Battles', description: 'Contemporary immigration rights struggles' }
        },
        g: { // Lessons Learned
          A: { title: 'Patterns of Change', description: 'Common elements in successful social movements' },
          B: { title: 'Leadership Strategies', description: 'Different approaches to movement leadership' },
          C: { title: 'Coalition Building', description: 'How movements work together for change' },
          D: { title: 'Media and Movements', description: 'The role of media in social change' },
          E: { title: 'Timing and Opportunity', description: 'Understanding when movements succeed' },
          F: { title: 'Applying History', description: 'Using historical lessons in modern activism' }
        }
      },
      5: { // Bureaucracy
        a: { // Understanding Agencies
          A: { title: 'Government Structure', description: 'How federal agencies are organized' },
          B: { title: 'Agency Missions', description: 'Understanding what different agencies do' },
          C: { title: 'Bureaucratic Culture', description: 'How government agencies operate internally' },
          D: { title: 'Agency Independence', description: 'Balancing autonomy with accountability' },
          E: { title: 'Interagency Cooperation', description: 'How agencies work together' },
          F: { title: 'Reforming Bureaucracy', description: 'Efforts to improve government efficiency' }
        },
        b: { // Regulatory Process
          A: { title: 'Rule Making', description: 'How government regulations are created' },
          B: { title: 'Public Comment', description: 'How citizens can influence regulations' },
          C: { title: 'Regulatory Impact', description: 'Understanding the effects of regulations' },
          D: { title: 'Enforcement', description: 'How regulations are implemented and monitored' },
          E: { title: 'Regulatory Reform', description: 'Efforts to streamline government rules' },
          F: { title: 'Industry Influence', description: 'How businesses interact with regulators' }
        },
        c: { // Public Records
          A: { title: 'Freedom of Information', description: 'Your right to access government information' },
          B: { title: 'FOIA Process', description: 'How to request government documents' },
          C: { title: 'Transparency Laws', description: 'Laws that promote government openness' },
          D: { title: 'Open Data', description: 'Government efforts to make data publicly available' },
          E: { title: 'Privacy vs Transparency', description: 'Balancing openness with privacy protection' },
          F: { title: 'Using Public Records', description: 'How to analyze and use government data' }
        },
        d: { // Permits & Licenses
          A: { title: 'Permit Types', description: 'Understanding different kinds of permits' },
          B: { title: 'Application Process', description: 'How to apply for permits and licenses' },
          C: { title: 'Regulatory Requirements', description: 'Standards you must meet for permits' },
          D: { title: 'Timeline Expectations', description: 'Understanding processing times' },
          E: { title: 'Appeals Process', description: 'What to do if your application is denied' },
          F: { title: 'Compliance Monitoring', description: 'Ongoing requirements after approval' }
        },
        e: { // Public Comment
          A: { title: 'Comment Periods', description: 'When and how to submit public comments' },
          B: { title: 'Effective Comments', description: 'Writing comments that make an impact' },
          C: { title: 'Public Hearings', description: 'Participating in government hearings' },
          D: { title: 'Community Organizing', description: 'Mobilizing others to participate' },
          E: { title: 'Follow-up Actions', description: 'What to do after submitting comments' },
          F: { title: 'Measuring Impact', description: 'Tracking how your input affects decisions' }
        },
        f: { // Appeals Process
          A: { title: 'Appeal Rights', description: 'Understanding your right to challenge decisions' },
          B: { title: 'Administrative Appeals', description: 'Challenging agency decisions within government' },
          C: { title: 'Judicial Review', description: 'Taking government decisions to court' },
          D: { title: 'Legal Representation', description: 'When and how to get legal help' },
          E: { title: 'Evidence Gathering', description: 'Building a strong case for appeal' },
          F: { title: 'Alternative Dispute Resolution', description: 'Other ways to resolve conflicts' }
        },
        g: { // Transparency
          A: { title: 'Government Transparency', description: 'Why transparency matters in democracy' },
          B: { title: 'Whistleblower Protection', description: 'Protecting those who expose wrongdoing' },
          C: { title: 'Open Meetings', description: 'Your right to attend government meetings' },
          D: { title: 'Financial Disclosure', description: 'Understanding government spending and conflicts of interest' },
          E: { title: 'Technology and Transparency', description: 'How technology can improve government openness' },
          F: { title: 'Advocating for Transparency', description: 'How to push for more open government' }
        }
      },
      6: { // Political Science
        a: { // Government Systems
          A: { title: 'Democracy vs Authoritarianism', description: 'Comparing different forms of government' },
          B: { title: 'Federal vs Unitary', description: 'Understanding different government structures' },
          C: { title: 'Presidential vs Parliamentary', description: 'Comparing executive branch arrangements' },
          D: { title: 'Separation of Powers', description: 'How governments divide authority' },
          E: { title: 'Checks and Balances', description: 'How different branches limit each other\'s power' },
          F: { title: 'Constitutional Design', description: 'How constitutions shape government behavior' }
        },
        b: { // Political Theory
          A: { title: 'Classical Political Thought', description: 'Foundational ideas about government and society' },
          B: { title: 'Modern Political Theory', description: 'Contemporary ideas about politics and power' },
          C: { title: 'Liberalism and Conservatism', description: 'Understanding major political ideologies' },
          D: { title: 'Socialism and Capitalism', description: 'Different approaches to economic organization' },
          E: { title: 'Political Philosophy', description: 'Deep questions about justice, rights, and authority' },
          F: { title: 'Applied Political Theory', description: 'How theory influences real-world politics' }
        },
        c: { // Power & Authority
          A: { title: 'Sources of Power', description: 'Understanding where political power comes from' },
          B: { title: 'Power Structures', description: 'How power is distributed in society' },
          C: { title: 'Authority vs Power', description: 'Distinguishing between legitimate and illegitimate power' },
          D: { title: 'Power Dynamics', description: 'How power relationships shape political outcomes' },
          E: { title: 'Resistance to Power', description: 'How people challenge and resist authority' },
          F: { title: 'Power and Change', description: 'How power relationships evolve over time' }
        },
        d: { // Elections
          A: { title: 'Electoral Systems', description: 'Different ways of conducting elections' },
          B: { title: 'Voting Methods', description: 'How votes are cast and counted' },
          C: { title: 'Campaign Strategies', description: 'How candidates compete for votes' },
          D: { title: 'Voter Behavior', description: 'Understanding how people make voting decisions' },
          E: { title: 'Electoral Reform', description: 'Efforts to improve democratic participation' },
          F: { title: 'Election Integrity', description: 'Ensuring fair and honest elections' }
        },
        e: { // Political Parties
          A: { title: 'Party Systems', description: 'How political parties organize democracy' },
          B: { title: 'Party Organization', description: 'How political parties are structured' },
          C: { title: 'Party Platforms', description: 'How parties develop and communicate their positions' },
          D: { title: 'Party Competition', description: 'How parties compete for power' },
          E: { title: 'Third Parties', description: 'The role of minor parties in democracy' },
          F: { title: 'Party Reform', description: 'Efforts to improve political party systems' }
        },
        f: { // Interest Groups
          A: { title: 'Interest Group Types', description: 'Different kinds of organized advocacy' },
          B: { title: 'Lobbying Strategies', description: 'How interest groups influence policy' },
          C: { title: 'Group Formation', description: 'How interest groups organize and mobilize' },
          D: { title: 'Coalition Building', description: 'How groups work together for common goals' },
          E: { title: 'Interest Group Influence', description: 'Measuring the impact of organized advocacy' },
          F: { title: 'Regulating Interest Groups', description: 'Laws governing lobbying and advocacy' }
        },
        g: { // International Relations
          A: { title: 'State Sovereignty', description: 'Understanding national independence and authority' },
          B: { title: 'International Law', description: 'Rules governing relations between nations' },
          C: { title: 'Diplomacy', description: 'How nations communicate and negotiate' },
          D: { title: 'International Organizations', description: 'How countries work together globally' },
          E: { title: 'Global Governance', description: 'Addressing problems that cross national borders' },
          F: { title: 'Foreign Policy', description: 'How nations pursue their interests abroad' }
        }
      },
      7: { // The Role of the Citizen
        a: { // Rights & Responsibilities
          A: { title: 'Constitutional Rights', description: 'Understanding your fundamental rights as a citizen' },
          B: { title: 'Civic Responsibilities', description: 'What citizens owe their community and country' },
          C: { title: 'Rights vs Responsibilities', description: 'Balancing individual freedoms with community needs' },
          D: { title: 'Rights in Practice', description: 'How rights are protected and enforced' },
          E: { title: 'Expanding Rights', description: 'How rights have evolved throughout history' },
          F: { title: 'Defending Rights', description: 'How citizens protect their rights and freedoms' }
        },
        b: { // Voting & Elections
          A: { title: 'The Right to Vote', description: 'Understanding voting as a fundamental democratic right' },
          B: { title: 'Voter Registration', description: 'How to register and maintain your voting status' },
          C: { title: 'Election Types', description: 'Different kinds of elections and what they decide' },
          D: { title: 'Informed Voting', description: 'How to research candidates and issues' },
          E: { title: 'Voting Barriers', description: 'Understanding obstacles to voting and how to overcome them' },
          F: { title: 'Election Integrity', description: 'Ensuring fair and honest elections' }
        },
        c: { // Community Service
          A: { title: 'Service Opportunities', description: 'Different ways to serve your community' },
          B: { title: 'Volunteer Organizations', description: 'Finding and joining service groups' },
          C: { title: 'Skills-Based Service', description: 'Using your talents to help others' },
          D: { title: 'Service Learning', description: 'Combining service with education' },
          E: { title: 'Long-term Commitment', description: 'Building sustained relationships through service' },
          F: { title: 'Measuring Impact', description: 'Understanding how your service makes a difference' }
        },
        d: { // Public Participation
          A: { title: 'Public Meetings', description: 'Attending and participating in government meetings' },
          B: { title: 'Public Comment', description: 'Having your voice heard in policy decisions' },
          C: { title: 'Citizen Advisory Boards', description: 'Serving on government advisory committees' },
          D: { title: 'Public Hearings', description: 'Participating in formal government hearings' },
          E: { title: 'Community Forums', description: 'Engaging in informal community discussions' },
          F: { title: 'Digital Participation', description: 'Using technology to engage with government' }
        },
        e: { // Advocacy
          A: { title: 'Advocacy Basics', description: 'Understanding how to advocate for causes you care about' },
          B: { title: 'Issue Research', description: 'Learning about problems and potential solutions' },
          C: { title: 'Building Coalitions', description: 'Working with others to amplify your voice' },
          D: { title: 'Policy Advocacy', description: 'Influencing government decisions and policies' },
          E: { title: 'Media Advocacy', description: 'Using media to advance your cause' },
          F: { title: 'Grassroots Advocacy', description: 'Building support from the ground up' }
        },
        f: { // Leadership
          A: { title: 'Civic Leadership', description: 'Understanding leadership in democratic contexts' },
          B: { title: 'Leading by Example', description: 'How personal behavior influences others' },
          C: { title: 'Inclusive Leadership', description: 'Leading in ways that include diverse voices' },
          D: { title: 'Collaborative Leadership', description: 'Working with others to achieve common goals' },
          E: { title: 'Ethical Leadership', description: 'Leading with integrity and moral principles' },
          F: { title: 'Developing Leaders', description: 'Helping others develop their leadership potential' }
        },
        g: { // Building Democracy
          A: { title: 'Democratic Institutions', description: 'Understanding the structures that support democracy' },
          B: { title: 'Democratic Culture', description: 'Building habits and values that support democracy' },
          C: { title: 'Democratic Education', description: 'Teaching others about democracy and citizenship' },
          D: { title: 'Democratic Innovation', description: 'Finding new ways to strengthen democracy' },
          E: { title: 'Global Democracy', description: 'Supporting democracy around the world' },
          F: { title: 'Future of Democracy', description: 'Preparing democracy for tomorrow\'s challenges' }
        }
      }
    };
    
    // Get the lesson template for this unit and section, or default to Unit 1, Section A
    const unitTemplate = lessonTemplates[unitId] || lessonTemplates[1];
    const sectionTemplate = unitTemplate[sectionLetter] || unitTemplate.a;
    
    const lessons = [
      { id: baseId + 1, section_id: sectionId, unit_id: unitId, lesson_letter: 'A', ...sectionTemplate.A, duration_minutes: 15, order_index: 1, section_letter: sectionLetter },
      { id: baseId + 2, section_id: sectionId, unit_id: unitId, lesson_letter: 'B', ...sectionTemplate.B, duration_minutes: 20, order_index: 2, section_letter: sectionLetter },
      { id: baseId + 3, section_id: sectionId, unit_id: unitId, lesson_letter: 'C', ...sectionTemplate.C, duration_minutes: 25, order_index: 3, section_letter: sectionLetter },
      { id: baseId + 4, section_id: sectionId, unit_id: unitId, lesson_letter: 'D', ...sectionTemplate.D, duration_minutes: 15, order_index: 4, section_letter: sectionLetter },
      { id: baseId + 5, section_id: sectionId, unit_id: unitId, lesson_letter: 'E', ...sectionTemplate.E, duration_minutes: 20, order_index: 5, section_letter: sectionLetter },
      { id: baseId + 6, section_id: sectionId, unit_id: unitId, lesson_letter: 'F', ...sectionTemplate.F, duration_minutes: 30, order_index: 6, section_letter: sectionLetter }
    ];
    console.log(`[SERVER] Returning ${lessons.length} lessons for sectionId: ${sectionId}`);
    res.json(lessons);
  } catch (error) {
    console.error('[SERVER] Error fetching lessons:', error);
    console.error('[SERVER] Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch lessons', details: error.message });
  }
});

app.get('/api/lesson/:lessonId', 
  validateInput([validationRules.lessonId]),
  (req, res) => {
  try {
    const { lessonId } = req.params;
    // Return mock lesson data
    const lesson = {
      id: parseInt(lessonId),
      section_id: 1,
      unit_id: 1,
      lesson_letter: 'A',
      title: 'What is Grassroots Organizing?',
      description: 'Understanding the fundamental principles',
      duration_minutes: 15,
      order_index: 1
    };
    res.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

app.get('/api/questions/:lessonId', 
  validateInput([validationRules.lessonId]),
  async (req, res) => {
  if (!isDatabaseAvailable()) {
    return res.status(503).json({ 
      error: 'Database is not available',
      message: 'Please configure DATABASE_URL environment variable. Add a PostgreSQL service in Railway and link it to your web service.'
    });
  }
  try {
    const { lessonId } = req.params;
    // Map lessonId to module pattern
    // Unit 1 has 7 sections (a-g) with 6 lessons each (1-6)
    // Lesson IDs are now unique: 1-6 for section a, 7-12 for section b, etc.
    // We need to reverse the mapping to get the correct section and lesson
    
    const lessonNum = parseInt(lessonId);
    
    // Reverse the mapping: lessonId = (sectionNum-1)*6 + lessonIndex
    // So: sectionNum = Math.floor((lessonNum-1)/6) + 1
    // And: lessonIndex = ((lessonNum-1) % 6) + 1
    const sectionNum = Math.floor((lessonNum - 1) / 6) + 1;
    const lessonIndex = ((lessonNum - 1) % 6) + 1;
    
    // Map section number to letter (1=a, 2=b, 3=c, 4=d, 5=e, 6=f, 7=g)
    const sectionLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const sectionLetter = sectionLetters[sectionNum - 1] || 'a';
    
    const modulePattern = `1-${sectionLetter}-${lessonIndex}`;
    
    const { query: querySql, params } = convertQuery('SELECT * FROM questions WHERE module = ?', [modulePattern]);
    const questions = await dbQuery.all(querySql, params);
    
    // Transform questions to match expected format
    const transformedQuestions = questions.map((question, index) => {
      const questionType = mapQuestionType(question.type);
      let options = null;
      
      // Parse options with error handling
      // PostgreSQL returns JSONB as objects
      if (question.answers) {
        try {
          options = typeof question.answers === 'string' ? JSON.parse(question.answers) : question.answers;
        } catch (e) {
          console.error(`Error parsing options for question ${index + 1}:`, e.message);
          // Try to fix common JSON issues
          try {
            // Fix the specific issue with "Parks," -> "Parks"
            let fixedAnswers = question.answers.replace(/",\s*"/g, '","').replace(/\[\s*"/g, '["').replace(/"\s*\]/g, '"]');
            // Fix trailing commas in array elements
            fixedAnswers = fixedAnswers.replace(/"\s*,\s*"/g, '","');
            options = JSON.parse(fixedAnswers);
          } catch (e2) {
            console.error(`Failed to fix JSON for question ${index + 1}:`, e2.message);
            // As a last resort, try to extract options manually
            try {
              const match = question.answers.match(/\[(.*?)\]/);
              if (match) {
                const optionsStr = match[1];
                options = optionsStr.split(',').map(opt => opt.trim().replace(/^"|"$/g, ''));
              } else {
                options = [];
              }
            } catch (e3) {
              console.error(`Failed to extract options manually for question ${index + 1}:`, e3.message);
              options = [];
            }
          }
        }
      }
      
      const cleanCorrectAnswer = question.correct_answer ? question.correct_answer.replace(/^"|"$/g, '') : '';
      
      return {
        id: index + 1,
        lesson_id: parseInt(lessonId),
        question_text: question.text ? question.text.replace(/^"|"$/g, '') : '',
        question_type: questionType,
        correct_answer: convertCorrectAnswerToOptionKey(cleanCorrectAnswer, options, questionType),
        options: options,
        explanation: question.comments ? question.comments.replace(/^"|"$/g, '') : 'No explanation available.',
        source: question.source ? question.source.replace(/^"|"$/g, '') : 'No source available.',
        order_index: index + 1
      };
    });
    
    res.json(transformedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

app.get('/api/question/:questionId', 
  validateInput([validationRules.questionId]),
  async (req, res) => {
  if (!isDatabaseAvailable()) {
    return res.status(503).json({ 
      error: 'Database is not available',
      message: 'Please configure DATABASE_URL environment variable. Add a PostgreSQL service in Railway and link it to your web service.'
    });
  }
  try {
    const { questionId } = req.params;
    // This endpoint is not currently used, but if needed, it would need to be updated
    // to map questionId to the appropriate module and question index
    const { query: querySql, params } = convertQuery('SELECT * FROM questions WHERE module = ? LIMIT 1 OFFSET ?', ['1-a-1', parseInt(questionId) - 1]);
    const question = await dbQuery.get(querySql, params);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Transform question to match expected format
    const questionType = mapQuestionType(question.type);
    const options = question.answers ? JSON.parse(question.answers) : null;
    const cleanCorrectAnswer = question.correct_answer ? question.correct_answer.replace(/^"|"$/g, '') : '';
    
    const transformedQuestion = {
      id: parseInt(questionId),
      lesson_id: 1,
      question_text: question.text ? question.text.replace(/^"|"$/g, '') : '',
      question_type: questionType,
      correct_answer: convertCorrectAnswerToOptionKey(cleanCorrectAnswer, options, questionType),
      options: options,
      explanation: question.comments ? question.comments.replace(/^"|"$/g, '') : 'No explanation available.',
      source: question.source ? question.source.replace(/^"|"$/g, '') : 'No source available.',
      order_index: parseInt(questionId)
    };
    
    res.json(transformedQuestion);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// New endpoint for lesson content
app.get('/api/lesson-content/:lessonId', 
  validateInput([validationRules.lessonId]),
  async (req, res) => {
  if (!isDatabaseAvailable()) {
    return res.status(503).json({ 
      error: 'Database is not available',
      message: 'Please configure DATABASE_URL environment variable. Add a PostgreSQL service in Railway and link it to your web service.'
    });
  }
  try {
    const { lessonId } = req.params;
    const lessonNum = parseInt(lessonId);
    
    // Get lesson content from database
    const { query: querySql, params } = convertQuery(`
      SELECT * FROM lesson_content 
      WHERE lesson_id = ? 
      ORDER BY content_order ASC
    `, [lessonNum]);
    const content = await dbQuery.all(querySql, params);
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching lesson content:', error);
    res.status(500).json({ error: 'Failed to fetch lesson content' });
  }
});

// Helper function to map question types
function mapQuestionType(dbType) {
  switch (dbType) {
    case 'tf':
      return 'true_false';
    case 'mc':
      return 'multiple_choice';
    case 'fill_in':
      return 'fill_blank';
    case 'select':
    case 'select_all':
      return 'select_all';
    default:
      return 'multiple_choice';
  }
}

// Helper function to convert text-based correct answers to option keys
function convertCorrectAnswerToOptionKey(correctAnswer, options, questionType) {
  if (questionType === 'multiple_choice' && options && Array.isArray(options)) {
    const index = options.findIndex(option => option === correctAnswer);
    if (index !== -1) {
      return String.fromCharCode(65 + index); // A, B, C, D, etc.
    }
  } else if (questionType === 'select_all' && options && Array.isArray(options)) {
    // For select_all questions, convert array of correct answers to option keys
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.map(answer => {
        const index = options.findIndex(option => option === answer);
        return index !== -1 ? String.fromCharCode(65 + index) : answer;
      }).join(',');
    } else if (typeof correctAnswer === 'string') {
      // Handle JSON string format
      try {
        const answers = JSON.parse(correctAnswer);
        if (Array.isArray(answers)) {
          return answers.map(answer => {
            const index = options.findIndex(option => option === answer);
            return index !== -1 ? String.fromCharCode(65 + index) : answer;
          }).join(',');
        }
      } catch (e) {
        // If it's not JSON, treat as single answer
        const index = options.findIndex(option => option === correctAnswer);
        return index !== -1 ? String.fromCharCode(65 + index) : correctAnswer;
      }
    }
  }
  return correctAnswer; // Return as-is for other question types
}


// Get all sources grouped by unit, section, and lesson
app.get('/api/sources', async (req, res) => {
  if (!isDatabaseAvailable()) {
    return res.status(503).json({ 
      error: 'Database is not available',
      message: 'Please configure DATABASE_URL environment variable. Add a PostgreSQL service in Railway and link it to your web service.'
    });
  }
  try {
    // Get all questions with their sources
    let allQuestions = [];
    try {
      // Fix: Use single quotes for string literals and properly check for NULL/empty values
      // PostgreSQL uses LENGTH() function, but for compatibility we'll use TRIM() and check length
      const { query: querySql, params } = convertQuery(
        'SELECT DISTINCT module, source FROM questions WHERE source IS NOT NULL AND source != ? AND source != ? AND LENGTH(TRIM(source)) > 0',
        ['', 'No source available.']
      );
      allQuestions = await dbQuery.all(querySql, params);
    } catch (sqlError) {
      console.error('[API] SQL Error:', sqlError);
      // Try without WHERE clause to see what data exists
      const { query: querySql, params } = convertQuery('SELECT module, source FROM questions', []);
      allQuestions = await dbQuery.all(querySql, params);
      console.log('[API] Unfiltered query returned:', allQuestions.length, 'rows');
    }
    
    console.log('[API] Fetching sources, found questions:', allQuestions.length);
    
    // Organize sources by unit, section, lesson
    const sourcesByUnit = {};
    
    allQuestions.forEach(question => {
      // Clean the source string (remove quotes)
      const cleanSource = question.source ? question.source.replace(/^"|"$/g, '').trim() : '';
      
      // Skip if source is empty or invalid
      if (!cleanSource || cleanSource === '' || cleanSource === 'No source available.') {
        return;
      }
      
      // Parse module (format: unit-section-lesson, e.g., "1-a-1")
      const parts = question.module.split('-');
      if (parts.length === 3) {
        const unitNum = parts[0];
        const sectionLetter = parts[1];
        const lessonNum = parts[2];
        
        // Initialize unit if it doesn't exist
        if (!sourcesByUnit[unitNum]) {
          sourcesByUnit[unitNum] = {};
        }
        
        // Initialize section if it doesn't exist
        if (!sourcesByUnit[unitNum][sectionLetter]) {
          sourcesByUnit[unitNum][sectionLetter] = {};
        }
        
        // Initialize lesson if it doesn't exist
        if (!sourcesByUnit[unitNum][sectionLetter][lessonNum]) {
          sourcesByUnit[unitNum][sectionLetter][lessonNum] = [];
        }
        
        // Add source if not already in the list
        if (!sourcesByUnit[unitNum][sectionLetter][lessonNum].includes(cleanSource)) {
          sourcesByUnit[unitNum][sectionLetter][lessonNum].push(cleanSource);
        }
      }
    });
    
    console.log('[API] Returning sources:', JSON.stringify(sourcesByUnit, null, 2));
    res.json(sourcesByUnit);
  } catch (error) {
    console.error('[API] Error fetching sources:', error);
    console.error('[API] Error stack:', error.stack);
    res.status(500).json({ error: `Failed to fetch sources: ${error.message}` });
  }
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Serve static files from the dist directory in production (after API routes)
if (isProduction) {
  const distPath = path.join(__dirname, 'dist');
  const indexHtmlPath = path.join(distPath, 'index.html');
  
  // Check if dist directory exists
  try {
    const distExists = fs.existsSync(distPath);
    const indexExists = fs.existsSync(indexHtmlPath);
    
    if (!distExists) {
      console.error(`[SERVER] ERROR: dist directory not found at ${distPath}`);
      console.error('[SERVER] Make sure npm run build completed successfully');
    } else if (!indexExists) {
      console.error(`[SERVER] ERROR: index.html not found at ${indexHtmlPath}`);
      console.error('[SERVER] Make sure npm run build completed successfully');
    } else {
      console.log(`[SERVER] ✓ dist directory found at ${distPath}`);
      console.log(`[SERVER] ✓ index.html found`);
    }
  } catch (error) {
    console.error('[SERVER] Error checking dist directory:', error);
  }
  
  // Configure express.static with proper MIME types for SVG files
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
    }
  }));
  console.log(`[SERVER] Serving static files from: ${distPath}`);
  
  // Serve React app for all non-API routes (catch-all for client-side routing)
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/create-checkout-session')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(indexHtmlPath, (err) => {
      if (err) {
        console.error('[SERVER] Error serving index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
} else {
  // Root endpoint - helpful error message in development
  app.get('/', (req, res) => {
    res.status(404).json({ 
      error: 'This is the backend API server. Please use the frontend URL instead.',
      message: 'The frontend should be accessed through the Vite development server.',
      endpoints: [
        '/health - Health check',
        '/api/sources - Get sources',
        '/api/units - Get units',
        '/api/lessons/:unitId/:sectionId - Get lessons',
        '/create-checkout-session - Stripe checkout'
      ]
    });
  });
}


function getLocalIP() {
  for (const name of Object.keys(networkInterfaces())) {
    for (const iface of networkInterfaces()[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
