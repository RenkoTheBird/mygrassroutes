# Lesson Content Management

This is a simple system for managing lesson paragraphs and content in your mygrassroutes application.

## How It Works

1. **Database**: Content is stored in the `lesson_content` table in your SQLite database
2. **API**: The server provides `/api/lesson-content/:lessonId` endpoint to fetch content
3. **Frontend**: The ReadButton component displays this content in a modal

## Adding Content

### Method 1: Using the Script (Recommended)

Simply run the script to add content:

```bash
node add-lesson-content.js
```

This will:
- Clear any existing content
- Add sample content for lessons 1, 2, and 3
- Show you how to add more content

### Method 2: Direct Database Access

You can add content directly to the database:

```sql
INSERT INTO lesson_content (lesson_id, content_type, content_order, title, content)
VALUES (1, 'paragraph', 1, 'Your Title', 'Your content here...');
```

## Content Types

- `header`: Main lesson title (large, bold)
- `paragraph`: Regular text content
- `tip`: Highlighted advice (blue box)

## Viewing Content

1. Start your server: `npm start`
2. Go to any lesson (e.g., `/questions?lesson=1`)
3. Click the "Read" button to see the content

## Adding More Content

To add content for more lessons, edit `add-lesson-content.js`:

1. Add your lesson content to the `sampleLessons` object
2. Run `node add-lesson-content.js` again

Example:
```javascript
const sampleLessons = {
  1: [ /* existing content */ ],
  4: [ // New lesson
    {
      content_type: 'header',
      content_order: 1,
      title: 'Your Lesson Title',
      content: 'Your lesson description...'
    },
    {
      content_type: 'paragraph',
      content_order: 2,
      title: 'Key Concepts',
      content: 'Your detailed content here...'
    }
  ]
};
```

That's it! The system is designed to be simple and focused on your main goal: creating lesson text content.
