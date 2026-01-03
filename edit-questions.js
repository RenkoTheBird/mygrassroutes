#!/usr/bin/env node

/**
 * Script to view and edit questions in the database
 * Usage: 
 *   node edit-questions.js                          # View all questions
 *   node edit-questions.js --module 1-a-1           # View questions for a specific module
 *   node edit-questions.js --help                   # Show help
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const db = new Database(path.join(__dirname, 'src', 'database', 'questions.db'));

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// View questions for a module
function viewQuestions(modulePattern = null) {
  let query = 'SELECT rowid, * FROM questions';
  let params = [];
  
  if (modulePattern) {
    query += ' WHERE module = ?';
    params.push(modulePattern);
  }
  
  query += ' ORDER BY module, rowid';
  
  const questions = db.prepare(query).all(...params);
  
  if (questions.length === 0) {
    console.log('\nNo questions found.');
    if (modulePattern) {
      console.log(`Module pattern: ${modulePattern}`);
    }
    return questions;
  }
  
  console.log(`\n=== Found ${questions.length} question(s) ===\n`);
  
  questions.forEach((q, index) => {
    console.log(`--- Question ${index + 1} (rowid: ${q.rowid}) ---`);
    console.log(`Module: ${q.module}`);
    console.log(`Type: ${q.type}`);
    console.log(`Text: ${q.text}`);
    if (q.answers) {
      console.log(`Answers: ${q.answers}`);
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
}

// Edit a question by rowid
async function editQuestion(rowid) {
  const q = db.prepare('SELECT * FROM questions WHERE rowid = ?').get(rowid);
  
  if (!q) {
    console.log(`\nQuestion with rowid ${rowid} not found.`);
    return;
  }
  
  console.log(`\n=== Editing Question (rowid: ${rowid}) ===`);
  console.log(`Current values:\n`);
  console.log(`Module: ${q.module}`);
  console.log(`Type: ${q.type}`);
  console.log(`Text: ${q.text}`);
  console.log(`Answers: ${q.answers || '(none)'}`);
  console.log(`Correct Answer: ${q.correct_answer || '(none)'}`);
  console.log(`Comments: ${q.comments || '(none)'}`);
  console.log(`Source: ${q.source || '(none)'}`);
  console.log(`Difficulty: ${q.difficulty || '(none)'}`);
  console.log(`Location Tag: ${q.location_tag || '(none)'}`);
  
  console.log('\nEnter new values (press Enter to keep current value):\n');
  
  const newModule = await question(`Module [${q.module}]: `);
  const newType = await question(`Type [${q.type}]: `);
  const newText = await question(`Text [${q.text}]: `);
  const newAnswers = await question(`Answers (JSON array, e.g., ["option1","option2"]) [${q.answers || ''}]: `);
  const newCorrectAnswer = await question(`Correct Answer [${q.correct_answer || ''}]: `);
  const newComments = await question(`Comments [${q.comments || ''}]: `);
  const newSource = await question(`Source [${q.source || ''}]: `);
  const newDifficulty = await question(`Difficulty [${q.difficulty || ''}]: `);
  const newLocationTag = await question(`Location Tag [${q.location_tag || ''}]: `);
  
  const updateStmt = db.prepare(`
    UPDATE questions 
    SET module = ?,
        type = ?,
        text = ?,
        answers = ?,
        correct_answer = ?,
        comments = ?,
        source = ?,
        difficulty = ?,
        location_tag = ?
    WHERE rowid = ?
  `);
  
  updateStmt.run(
    newModule.trim() || q.module,
    newType.trim() || q.type,
    newText.trim() || q.text,
    newAnswers.trim() || q.answers,
    newCorrectAnswer.trim() || q.correct_answer,
    newComments.trim() || q.comments,
    newSource.trim() || q.source,
    newDifficulty.trim() || q.difficulty,
    newLocationTag.trim() || q.location_tag,
    rowid
  );
  
  console.log(`\n✓ Question ${rowid} updated successfully!\n`);
}

// Add a new question
async function addQuestion() {
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
  
  const insertStmt = db.prepare(`
    INSERT INTO questions (module, type, text, answers, correct_answer, comments, source, difficulty, location_tag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertStmt.run(
    module.trim(),
    type.trim(),
    text.trim(),
    answers.trim() || null,
    correctAnswer.trim() || null,
    comments.trim() || null,
    source.trim() || null,
    difficulty.trim() || null,
    locationTag.trim() || null
  );
  
  console.log('\n✓ Question added successfully!\n');
}

// Delete a question
async function deleteQuestion(rowid) {
  const q = db.prepare('SELECT * FROM questions WHERE rowid = ?').get(rowid);
  
  if (!q) {
    console.log(`\nQuestion with rowid ${rowid} not found.`);
    return;
  }
  
  console.log(`\n=== Deleting Question (rowid: ${rowid}) ===`);
  console.log(`Text: ${q.text}`);
  console.log(`Module: ${q.module}\n`);
  
  const confirm = await question('Are you sure you want to delete this question? (yes/no): ');
  
  if (confirm.toLowerCase() === 'yes') {
    db.prepare('DELETE FROM questions WHERE rowid = ?').run(rowid);
    console.log(`\n✓ Question ${rowid} deleted successfully!\n`);
  } else {
    console.log('\nDeletion cancelled.\n');
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  node edit-questions.js [options] [action]

Options:
  --module <pattern>    Filter by module (e.g., 1-a-1)
  --rowid <id>          Specify question rowid for edit/delete

Actions:
  view                  View questions (default)
  edit                  Edit a question (requires --rowid)
  add                   Add a new question
  delete                Delete a question (requires --rowid)

Examples:
  node edit-questions.js
  node edit-questions.js --module 1-a-1
  node edit-questions.js edit --rowid 1
  node edit-questions.js add
  node edit-questions.js delete --rowid 1
    `);
    rl.close();
    db.close();
    return;
  }
  
  // Define valid actions
  const validActions = ['view', 'edit', 'add', 'delete'];
  
  // Find the action (must be a known action, not just any non-flag)
  const action = args.find(arg => validActions.includes(arg)) || 'view';
  
  // Extract flags and their values
  const moduleIndex = args.indexOf('--module');
  const rowidIndex = args.indexOf('--rowid');
  const modulePattern = moduleIndex !== -1 && args[moduleIndex + 1] ? args[moduleIndex + 1] : null;
  const rowid = rowidIndex !== -1 && args[rowidIndex + 1] ? parseInt(args[rowidIndex + 1]) : null;
  
  try {
    switch (action) {
      case 'view':
        viewQuestions(modulePattern);
        break;
      case 'edit':
        if (!rowid) {
          console.log('Error: --rowid is required for edit action');
          console.log('Use: node edit-questions.js edit --rowid <id>');
          break;
        }
        await editQuestion(rowid);
        break;
      case 'add':
        await addQuestion();
        break;
      case 'delete':
        if (!rowid) {
          console.log('Error: --rowid is required for delete action');
          console.log('Use: node edit-questions.js delete --rowid <id>');
          break;
        }
        await deleteQuestion(rowid);
        break;
      default:
        console.log(`Unknown action: ${action}`);
        console.log('Use --help for usage information');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    db.close();
  }
}

// Run main function
main().catch(console.error);
