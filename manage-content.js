#!/usr/bin/env node

/**
 * Unified script to manage lesson content and questions in the PostgreSQL database
 * Usage: 
 *   node manage-content.js --help                                   # Show help
 *   
 *   # Lesson Content Management
 *   node manage-content.js content view [--lesson-id <id>]          # View lesson content
 *   node manage-content.js content add --lesson-id <id>             # Add lesson content
 *   node manage-content.js content edit --id <id>                   # Edit lesson content item
 *   node manage-content.js content delete --id <id>                 # Delete lesson content item
 *   
 *   # Question Management
 *   node manage-content.js questions view [--module <pattern>]      # View questions
 *   node manage-content.js questions add                             # Add a new question
 *   node manage-content.js questions edit --id <id>                 # Edit a question
 *   node manage-content.js questions delete --id <id>               # Delete a question
 * 
 * Requires DATABASE_URL environment variable to be set
 */

import pg from 'pg';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.error('Set it in your .env file or environment variables');
  process.exit(1);
}

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// ==================== LESSON CONTENT FUNCTIONS ====================

// View lesson content
async function viewLessonContent(lessonId = null) {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM lesson_content';
    let params = [];
    
    if (lessonId) {
      query += ' WHERE lesson_id = $1';
      params.push(lessonId);
    }
    
    query += ' ORDER BY lesson_id, content_order';
    
    const result = await client.query(query, params);
    const content = result.rows;
    
    if (content.length === 0) {
      console.log('\nNo lesson content found.');
      if (lessonId) {
        console.log(`Lesson ID: ${lessonId}`);
      }
      return content;
    }
    
    console.log(`\n=== Found ${content.length} content item(s) ===\n`);
    
    content.forEach((item, index) => {
      console.log(`--- Content Item ${index + 1} (id: ${item.id}) ---`);
      console.log(`Lesson ID: ${item.lesson_id}`);
      console.log(`Type: ${item.content_type}`);
      console.log(`Order: ${item.content_order}`);
      console.log(`Title: ${item.title || '(none)'}`);
      console.log(`Content: ${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}`);
      console.log('');
    });
    
    return content;
  } finally {
    client.release();
  }
}

// Add lesson content
async function addLessonContent(lessonId) {
  const client = await pool.connect();
  try {
    console.log('\n=== Adding New Lesson Content ===\n');
    
    const contentType = await question('Content Type (header/paragraph/tip): ');
    const contentOrder = await question('Content Order (number): ');
    const title = await question('Title (optional): ');
    const content = await question('Content: ');
    
    await client.query(
      `INSERT INTO lesson_content (lesson_id, content_type, content_order, title, content)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        parseInt(lessonId),
        contentType.trim(),
        parseInt(contentOrder),
        title.trim() || null,
        content.trim()
      ]
    );
    
    console.log('\n✓ Lesson content added successfully!\n');
  } finally {
    client.release();
  }
}

// Edit lesson content
async function editLessonContent(id) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM lesson_content WHERE id = $1', [id]);
    const item = result.rows[0];
    
    if (!item) {
      console.log(`\nLesson content with id ${id} not found.`);
      return;
    }
    
    console.log(`\n=== Editing Lesson Content (id: ${id}) ===`);
    console.log(`Current values:\n`);
    console.log(`Lesson ID: ${item.lesson_id}`);
    console.log(`Type: ${item.content_type}`);
    console.log(`Order: ${item.content_order}`);
    console.log(`Title: ${item.title || '(none)'}`);
    console.log(`Content: ${item.content.substring(0, 200)}${item.content.length > 200 ? '...' : ''}`);
    console.log('\nEnter new values (press Enter to keep current value):\n');
    
    const newLessonId = await question(`Lesson ID [${item.lesson_id}]: `);
    const newContentType = await question(`Content Type [${item.content_type}]: `);
    const newContentOrder = await question(`Content Order [${item.content_order}]: `);
    const newTitle = await question(`Title [${item.title || ''}]: `);
    const newContent = await question(`Content: `);
    
    await client.query(
      `UPDATE lesson_content 
       SET lesson_id = $1,
           content_type = $2,
           content_order = $3,
           title = $4,
           content = $5
       WHERE id = $6`,
      [
        newLessonId.trim() ? parseInt(newLessonId) : item.lesson_id,
        newContentType.trim() || item.content_type,
        newContentOrder.trim() ? parseInt(newContentOrder) : item.content_order,
        newTitle.trim() || item.title,
        newContent.trim() || item.content,
        id
      ]
    );
    
    console.log(`\n✓ Lesson content ${id} updated successfully!\n`);
  } finally {
    client.release();
  }
}

// Delete lesson content
async function deleteLessonContent(id) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM lesson_content WHERE id = $1', [id]);
    const item = result.rows[0];
    
    if (!item) {
      console.log(`\nLesson content with id ${id} not found.`);
      return;
    }
    
    console.log(`\n=== Deleting Lesson Content (id: ${id}) ===`);
    console.log(`Title: ${item.title || '(none)'}`);
    console.log(`Lesson ID: ${item.lesson_id}\n`);
    
    const confirm = await question('Are you sure you want to delete this content? (yes/no): ');
    
    if (confirm.toLowerCase() === 'yes') {
      await client.query('DELETE FROM lesson_content WHERE id = $1', [id]);
      console.log(`\n✓ Lesson content ${id} deleted successfully!\n`);
    } else {
      console.log('\nDeletion cancelled.\n');
    }
  } finally {
    client.release();
  }
}

// ==================== QUESTION FUNCTIONS ====================

// View questions
async function viewQuestions(modulePattern = null) {
  const client = await pool.connect();
  try {
    let query = 'SELECT id, * FROM questions';
    let params = [];
    
    if (modulePattern) {
      query += ' WHERE module = $1';
      params.push(modulePattern);
    }
    
    query += ' ORDER BY module, id';
    
    const result = await client.query(query, params);
    const questions = result.rows;
    
    if (questions.length === 0) {
      console.log('\nNo questions found.');
      if (modulePattern) {
        console.log(`Module pattern: ${modulePattern}`);
      }
      return questions;
    }
    
    console.log(`\n=== Found ${questions.length} question(s) ===\n`);
    
    questions.forEach((q, index) => {
      console.log(`--- Question ${index + 1} (id: ${q.id}) ---`);
      console.log(`Module: ${q.module}`);
      console.log(`Type: ${q.type}`);
      console.log(`Text: ${q.text}`);
      if (q.answers) {
        const answersStr = typeof q.answers === 'string' ? q.answers : JSON.stringify(q.answers);
        console.log(`Answers: ${answersStr}`);
      }
      console.log(`Correct Answer: ${q.correct_answer}`);
      if (q.comments) {
        console.log(`Comments: ${q.comments}`);
      }
      if (q.source) {
        console.log(`Source: ${q.source}`);
      }
      console.log('');
    });
    
    return questions;
  } finally {
    client.release();
  }
}

// Edit a question
async function editQuestion(id) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM questions WHERE id = $1', [id]);
    const q = result.rows[0];
    
    if (!q) {
      console.log(`\nQuestion with id ${id} not found.`);
      return;
    }
    
    console.log(`\n=== Editing Question (id: ${id}) ===`);
    console.log(`Current values:\n`);
    console.log(`Module: ${q.module}`);
    console.log(`Type: ${q.type}`);
    console.log(`Text: ${q.text}`);
    const answersStr = q.answers ? (typeof q.answers === 'string' ? q.answers : JSON.stringify(q.answers)) : '(none)';
    console.log(`Answers: ${answersStr}`);
    console.log(`Correct Answer: ${q.correct_answer || '(none)'}`);
    console.log(`Comments: ${q.comments || '(none)'}`);
    console.log(`Source: ${q.source || '(none)'}`);
    console.log(`Difficulty: ${q.difficulty || '(none)'}`);
    console.log(`Location Tag: ${q.location_tag || '(none)'}`);
    
    console.log('\nEnter new values (press Enter to keep current value):\n');
    
    const newModule = await question(`Module [${q.module}]: `);
    const newType = await question(`Type [${q.type}]: `);
    const newText = await question(`Text [${q.text}]: `);
    const newAnswers = await question(`Answers (JSON array, e.g., ["option1","option2"]) [${answersStr}]: `);
    const newCorrectAnswer = await question(`Correct Answer [${q.correct_answer || ''}]: `);
    const newComments = await question(`Comments [${q.comments || ''}]: `);
    const newSource = await question(`Source [${q.source || ''}]: `);
    const newDifficulty = await question(`Difficulty [${q.difficulty || ''}]: `);
    const newLocationTag = await question(`Location Tag [${q.location_tag || ''}]: `);
    
    // Parse answers JSON if provided
    let answersJson = q.answers;
    if (newAnswers.trim()) {
      try {
        answersJson = JSON.parse(newAnswers.trim());
      } catch (e) {
        console.error(`\nError: Invalid JSON format for answers: ${e.message}`);
        console.log('Keeping current answers value.');
      }
    }
    
    await client.query(
      `UPDATE questions 
       SET module = $1,
           type = $2,
           text = $3,
           answers = $4::jsonb,
           correct_answer = $5,
           comments = $6,
           source = $7,
           difficulty = $8,
           location_tag = $9
       WHERE id = $10`,
      [
        newModule.trim() || q.module,
        newType.trim() || q.type,
        newText.trim() || q.text,
        answersJson !== null ? JSON.stringify(answersJson) : null,
        newCorrectAnswer.trim() || q.correct_answer,
        newComments.trim() || q.comments,
        newSource.trim() || q.source,
        newDifficulty.trim() || q.difficulty,
        newLocationTag.trim() || q.location_tag,
        id
      ]
    );
    
    console.log(`\n✓ Question ${id} updated successfully!\n`);
  } finally {
    client.release();
  }
}

// Add a new question
async function addQuestion() {
  const client = await pool.connect();
  try {
    console.log('\n=== Adding New Question ===\n');
    
    const module = await question('Module (e.g., 1-a-1): ');
    const type = await question('Type (e.g., multiple_choice, true_false, fill_blank, select_all): ');
    const text = await question('Question Text: ');
    const answers = await question('Answers (JSON array, e.g., ["option1","option2"]) or leave empty: ');
    const correctAnswer = await question('Correct Answer: ');
    const comments = await question('Comments/Explanation (optional): ');
    const source = await question('Source (optional): ');
    const difficulty = await question('Difficulty (optional): ');
    const locationTag = await question('Location Tag (optional): ');
    
    // Parse answers JSON if provided
    let answersJson = null;
    if (answers.trim()) {
      try {
        answersJson = JSON.parse(answers.trim());
      } catch (e) {
        console.error(`\nError: Invalid JSON format: ${e.message}`);
        console.log('Question will be added without answers.');
      }
    }
    
    await client.query(
      `INSERT INTO questions (module, type, text, answers, correct_answer, comments, source, difficulty, location_tag)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9)`,
      [
        module.trim(),
        type.trim(),
        text.trim(),
        answersJson !== null ? JSON.stringify(answersJson) : null,
        correctAnswer.trim() || null,
        comments.trim() || null,
        source.trim() || null,
        difficulty.trim() || null,
        locationTag.trim() || null
      ]
    );
    
    console.log('\n✓ Question added successfully!\n');
  } finally {
    client.release();
  }
}

// Delete a question
async function deleteQuestion(id) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM questions WHERE id = $1', [id]);
    const q = result.rows[0];
    
    if (!q) {
      console.log(`\nQuestion with id ${id} not found.`);
      return;
    }
    
    console.log(`\n=== Deleting Question (id: ${id}) ===`);
    console.log(`Text: ${q.text}`);
    console.log(`Module: ${q.module}\n`);
    
    const confirm = await question('Are you sure you want to delete this question? (yes/no): ');
    
    if (confirm.toLowerCase() === 'yes') {
      await client.query('DELETE FROM questions WHERE id = $1', [id]);
      console.log(`\n✓ Question ${id} deleted successfully!\n`);
    } else {
      console.log('\nDeletion cancelled.\n');
    }
  } finally {
    client.release();
  }
}

// ==================== MAIN FUNCTION ====================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
Usage:
  node manage-content.js [resource] [action] [options]

Resources:
  content       Manage lesson content
  questions     Manage questions

Actions:
  view          View items (default)
  add           Add a new item
  edit          Edit an item (requires --id)
  delete        Delete an item (requires --id)

Options:
  --lesson-id <id>    Filter lesson content by lesson ID
  --module <pattern>  Filter questions by module (e.g., 1-a-1)
  --id <id>           Specify item ID for edit/delete operations

Examples:
  # Lesson Content
  node manage-content.js content view
  node manage-content.js content view --lesson-id 1
  node manage-content.js content add --lesson-id 1
  node manage-content.js content edit --id 1
  node manage-content.js content delete --id 1
  
  # Questions
  node manage-content.js questions view
  node manage-content.js questions view --module 1-a-1
  node manage-content.js questions add
  node manage-content.js questions edit --id 1
  node manage-content.js questions delete --id 1
    `);
    rl.close();
    await pool.end();
    return;
  }
  
  const resource = args[0]; // 'content' or 'questions'
  const action = args.find(arg => ['view', 'add', 'edit', 'delete'].includes(arg)) || 'view';
  
  // Extract options
  const getOption = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 && args[index + 1] ? args[index + 1] : null;
  };
  
  const lessonId = getOption('--lesson-id');
  const modulePattern = getOption('--module');
  const id = getOption('--id');
  
  try {
    if (resource === 'content') {
      switch (action) {
        case 'view':
          await viewLessonContent(lessonId ? parseInt(lessonId) : null);
          break;
        case 'add':
          if (!lessonId) {
            console.log('Error: --lesson-id is required for add action');
            console.log('Use: node manage-content.js content add --lesson-id <id>');
            break;
          }
          await addLessonContent(lessonId);
          break;
        case 'edit':
          if (!id) {
            console.log('Error: --id is required for edit action');
            console.log('Use: node manage-content.js content edit --id <id>');
            break;
          }
          await editLessonContent(parseInt(id));
          break;
        case 'delete':
          if (!id) {
            console.log('Error: --id is required for delete action');
            console.log('Use: node manage-content.js content delete --id <id>');
            break;
          }
          await deleteLessonContent(parseInt(id));
          break;
      }
    } else if (resource === 'questions') {
      switch (action) {
        case 'view':
          await viewQuestions(modulePattern);
          break;
        case 'add':
          await addQuestion();
          break;
        case 'edit':
          if (!id) {
            console.log('Error: --id is required for edit action');
            console.log('Use: node manage-content.js questions edit --id <id>');
            break;
          }
          await editQuestion(parseInt(id));
          break;
        case 'delete':
          if (!id) {
            console.log('Error: --id is required for delete action');
            console.log('Use: node manage-content.js questions delete --id <id>');
            break;
          }
          await deleteQuestion(parseInt(id));
          break;
      }
    } else {
      console.log(`Unknown resource: ${resource}`);
      console.log('Use --help for usage information');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

// Run main function
main().catch(console.error);
