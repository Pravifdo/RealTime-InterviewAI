const mongoose = require('mongoose');
const dotenv = require('dotenv');
const InterviewTemplate = require('./src/models/InterviewTemplate');

dotenv.config();

const sampleTemplates = [
  {
    roomId: 'template-1',
    title: 'Frontend Developer Interview',
    questions: [
      {
        question: 'What is React and why is it popular?',
        expectedKeywords: ['javascript', 'library', 'component', 'ui', 'virtual dom', 'facebook'],
        category: 'Technical',
        difficulty: 'Easy',
        order: 0
      },
      {
        question: 'Explain the difference between let, const, and var in JavaScript.',
        expectedKeywords: ['scope', 'hoisting', 'block', 'reassign', 'temporal dead zone'],
        category: 'Technical',
        difficulty: 'Medium',
        order: 1
      },
      {
        question: 'What is a closure in JavaScript?',
        expectedKeywords: ['function', 'scope', 'variable', 'lexical', 'inner', 'outer'],
        category: 'Technical',
        difficulty: 'Medium',
        order: 2
      },
      {
        question: 'What are React Hooks and why were they introduced?',
        expectedKeywords: ['state', 'lifecycle', 'functional', 'component', 'usestate', 'useeffect'],
        category: 'Technical',
        difficulty: 'Medium',
        order: 3
      },
      {
        question: 'Explain the concept of promises in JavaScript.',
        expectedKeywords: ['asynchronous', 'callback', 'resolve', 'reject', 'pending', 'then', 'catch'],
        category: 'Technical',
        difficulty: 'Medium',
        order: 4
      }
    ],
    status: 'ready'
  },
  {
    roomId: 'template-2',
    title: 'Backend Developer Interview',
    questions: [
      {
        question: 'What is Node.js and how is it different from traditional web servers?',
        expectedKeywords: ['javascript', 'runtime', 'v8', 'event', 'loop', 'non-blocking', 'asynchronous'],
        category: 'Technical',
        difficulty: 'Medium',
        order: 0
      },
      {
        question: 'Explain REST API and its principles.',
        expectedKeywords: ['http', 'get', 'post', 'put', 'delete', 'stateless', 'resource', 'endpoint'],
        category: 'Technical',
        difficulty: 'Easy',
        order: 1
      },
      {
        question: 'What is MongoDB and when would you use it over SQL databases?',
        expectedKeywords: ['nosql', 'document', 'json', 'flexible', 'schema', 'scalable', 'collection'],
        category: 'Technical',
        difficulty: 'Medium',
        order: 2
      },
      {
        question: 'Explain middleware in Express.js.',
        expectedKeywords: ['function', 'request', 'response', 'next', 'pipeline', 'authentication'],
        category: 'Technical',
        difficulty: 'Medium',
        order: 3
      },
      {
        question: 'What is JWT and how does it work?',
        expectedKeywords: ['token', 'authentication', 'json', 'signature', 'header', 'payload', 'secret'],
        category: 'Technical',
        difficulty: 'Medium',
        order: 4
      }
    ],
    status: 'ready'
  },
  {
    roomId: 'template-3',
    title: 'Full Stack Developer Interview',
    questions: [
      {
        question: 'What is the MERN stack?',
        expectedKeywords: ['mongodb', 'express', 'react', 'node', 'javascript', 'fullstack'],
        category: 'General',
        difficulty: 'Easy',
        order: 0
      },
      {
        question: 'Explain the difference between authentication and authorization.',
        expectedKeywords: ['identity', 'login', 'permission', 'access', 'token', 'role'],
        category: 'Technical',
        difficulty: 'Easy',
        order: 1
      },
      {
        question: 'What is CORS and why is it important?',
        expectedKeywords: ['cross-origin', 'security', 'browser', 'http', 'header', 'policy'],
        category: 'Technical',
        difficulty: 'Medium',
        order: 2
      },
      {
        question: 'Explain WebSocket and when to use it.',
        expectedKeywords: ['real-time', 'bidirectional', 'connection', 'socket', 'persistent', 'chat'],
        category: 'Technical',
        difficulty: 'Hard',
        order: 3
      }
    ],
    status: 'ready'
  }
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing templates
    await InterviewTemplate.deleteMany({});
    console.log('🗑️  Cleared existing templates');

    // Insert sample templates
    const inserted = await InterviewTemplate.insertMany(sampleTemplates);
    console.log(`✅ Inserted ${inserted.length} templates`);

    // Display template IDs
    console.log('\n📋 Template IDs:');
    inserted.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.title}`);
      console.log(`      ID: ${template._id}`);
      console.log(`      Questions: ${template.questions.length}`);
      console.log('');
    });

    console.log('✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
