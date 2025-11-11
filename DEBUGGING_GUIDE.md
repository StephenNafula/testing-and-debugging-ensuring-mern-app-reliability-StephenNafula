# Debugging Guide: Common Issues & Solutions

This guide covers common issues you might encounter when developing or testing a MERN application and how to debug them.

## Server-Side Issues

### Issue 1: API Endpoint Returns 500 Error

**Symptoms:** Request to `/api/posts` returns 500 Internal Server Error

**Debugging Steps:**

1. **Check the error logs:**
   ```bash
   # Look at server console output for stack trace
   # Error handler middleware will log errors
   ```

2. **Add console logging:**
   ```javascript
   // In your route handler
   app.get('/api/posts', async (req, res, next) => {
     try {
       console.log('Fetching posts...');
       const posts = await Post.find();
       console.log(`Found ${posts.length} posts`);
       res.json(posts);
     } catch (error) {
       console.error('Error fetching posts:', error);
       next(error);
     }
   });
   ```

3. **Test the endpoint with curl:**
   ```bash
   curl -X GET http://localhost:3000/api/posts \
     -H "Authorization: Bearer your-token-here" \
     -H "Content-Type: application/json"
   ```

4. **Check MongoDB connection:**
   ```javascript
   // Verify mongoose is connected
   console.log('MongoDB connection state:', mongoose.connection.readyState);
   // 0 = disconnected, 1 = connected
   ```

**Solution Example:**
```javascript
// Add robust error handling
app.get('/api/posts', async (req, res, next) => {
  try {
    if (!mongoose.connection.readyState) {
      const error = new Error('Database not connected');
      error.status = 503;
      throw error;
    }
    
    const posts = await Post.find().limit(10);
    res.json(posts);
  } catch (error) {
    next(error); // Passes to errorHandler middleware
  }
});
```

---

### Issue 2: Authorization Header Not Working

**Symptoms:** Protected routes return 401 "Missing or invalid authorization header"

**Debugging Steps:**

1. **Verify token is being sent:**
   ```javascript
   // Browser DevTools > Network > Request Headers
   // Look for: Authorization: Bearer eyJhbGciOiJIUzI1NiI...
   ```

2. **Check token format:**
   ```bash
   # Token should have 3 parts separated by dots
   curl -X GET http://localhost:3000/api/posts/protected \
     -H "Authorization: Bearer your.jwt.token"
   ```

3. **Verify token is valid:**
   ```javascript
   const { verifyToken } = require('./utils/auth');
   const token = 'your-token-here';
   const decoded = verifyToken(token);
   console.log('Decoded token:', decoded);
   // Should print user info, not null
   ```

4. **Check auth middleware:**
   ```javascript
   // Ensure middleware is applied to routes
   app.use('/api/protected', authMiddleware, protectedRoutes);
   ```

**Solution Example:**
```javascript
// Debug auth middleware
function authMiddleware(req, res, next) {
  console.log('Auth header:', req.headers.authorization);
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn('No auth header provided');
      return res.status(401).json({ error: 'No auth header' });
    }
    
    const token = authHeader.slice(7);
    console.log('Token:', token);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.warn('Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
```

---

## Client-Side Issues

### Issue 3: API Request Fails with CORS Error

**Symptoms:** Browser console shows `CORS error` or `blocked by CORS policy`

**Debugging Steps:**

1. **Check browser console:**
   ```
   Access to XMLHttpRequest at 'http://localhost:5000/api/posts' from origin 
   'http://localhost:3000' has been blocked by CORS policy
   ```

2. **Verify API URL:**
   ```javascript
   // client/src/utils/api.js
   console.log('API Call to:', url);
   console.log('Headers:', config.headers);
   ```

3. **Check server CORS setup:**
   ```javascript
   // server/src/app.js
   const cors = require('cors');
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```

**Solution Example:**
```javascript
// Add CORS middleware to Express
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### Issue 4: Form Submission Hangs or Shows Old Data

**Symptoms:** Form seems stuck or displays cached data

**Debugging Steps:**

1. **Check `useForm` hook state:**
   ```javascript
   const { values, isSubmitting, errors } = useForm(initialValues, handleSubmit);
   console.log('Form values:', values);
   console.log('Is submitting:', isSubmitting);
   console.log('Errors:', errors);
   ```

2. **Verify API is being called:**
   ```javascript
   // In DevTools Network tab
   // Look for POST request to your endpoint
   // Check response status and data
   ```

3. **Check cache:**
   ```javascript
   // Browsers cache GET requests. Disable in development:
   // In DevTools Settings > Network > disable cache (while DevTools open)
   ```

**Solution Example:**
```javascript
// Debug useForm submission
const handleSubmit = async (values) => {
  console.log('Form submitted with values:', values);
  
  try {
    const response = await postRequest('/api/posts', values);
    console.log('Post created:', response);
    // Reset form or navigate
  } catch (error) {
    console.error('Submission error:', error);
    throw error; // useForm will catch and display
  }
};

const form = useForm(initialValues, handleSubmit);
console.log('Form state:', form);
```

---

### Issue 5: Component Not Re-rendering After State Change

**Symptoms:** State updates but UI doesn't reflect the change

**Debugging Steps:**

1. **Use React DevTools Profiler:**
   - Open React DevTools in browser
   - Go to Profiler tab
   - Record user interaction
   - Check if component is being updated

2. **Add console logs:**
   ```javascript
   useEffect(() => {
     console.log('Component rendered with value:', value);
   }, [value]);
   ```

3. **Check dependency arrays:**
   ```javascript
   // WRONG: Missing dependency
   useEffect(() => {
     console.log(count); // count is not in dependency array
   }, []); // Will never re-run when count changes
   
   // CORRECT: Include dependencies
   useEffect(() => {
     console.log(count);
   }, [count]); // Re-runs when count changes
   ```

**Solution Example:**
```javascript
import { useState, useEffect } from 'react';

function PostList() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    console.log('Fetching posts...');
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    try {
      const data = await getRequest('/api/posts');
      console.log('Posts fetched:', data);
      setPosts(data);
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  };
  
  return (
    <div>
      {posts.length > 0 ? (
        posts.map(post => <PostCard key={post._id} post={post} />)
      ) : (
        <p>No posts found</p>
      )}
    </div>
  );
}
```

---

## Test Debugging

### Issue 6: Test Passes Locally but Fails in CI

**Symptoms:** Test works on your machine but fails in GitHub Actions / CI pipeline

**Debugging Steps:**

1. **Check environment variables:**
   ```bash
   # CI might not have your .env file
   # Print environment in test:
   console.log('NODE_ENV:', process.env.NODE_ENV);
   console.log('API_URL:', process.env.API_URL);
   ```

2. **Check timing issues:**
   ```javascript
   // Asyncs operations may be too slow in CI
   // Use longer timeout or wait for element
   cy.get('[data-testid=element]', { timeout: 10000 });
   ```

3. **Check dependencies:**
   ```bash
   # Ensure all devDependencies are listed in package.json
   npm install --save-dev [missing-package]
   ```

**Solution Example:**
```javascript
// Add timeout and retry logic to flaky tests
describe('Flaky E2E Test', () => {
  it('should handle slow API response', { retries: 2 }, () => {
    cy.login('user@example.com', 'password');
    cy.visit('/posts');
    cy.get('[data-testid=posts-list]', { timeout: 15000 })
      .should('have.length.greaterThan', 0);
  });
});
```

---

### Issue 7: Jest Test Timeout

**Symptoms:** `Jest: Timeout` error

**Debugging Steps:**

1. **Increase timeout in test:**
   ```javascript
   it('should perform async operation', async () => {
     // Default timeout is 5000ms (5 seconds)
     // Increase to 10 seconds:
   }, 10000);
   ```

2. **Check for unresolved promises:**
   ```javascript
   it('should resolve all promises', async () => {
     const result = await someAsyncFunction();
     expect(result).toBeDefined();
     // Make sure to await all async operations
   });
   ```

3. **Mock slow dependencies:**
   ```javascript
   jest.mock('../api', () => ({
     getRequest: jest.fn().mockResolvedValue({ data: 'mocked' })
   }));
   ```

**Solution Example:**
```javascript
describe('Async Operations', () => {
  jest.setTimeout(10000); // Set for all tests in suite
  
  it('should handle slow API call', async () => {
    const promise = new Promise(resolve => {
      setTimeout(() => resolve({ data: 'test' }), 3000);
    });
    
    const result = await promise;
    expect(result.data).toBe('test');
  });
});
```

---

## Performance Debugging

### Issue 8: App Feels Slow

**Symptoms:** Long page load times, sluggish interactions

**Debugging Steps:**

1. **Use Chrome DevTools Performance tab:**
   - Press Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac)
   - Select "Performance: Record"
   - Interact with app
   - Stop recording and analyze

2. **Check Network tab:**
   - Look for slow API requests
   - Check bundle size
   - Enable throttling to simulate slow network

3. **Check React Profiler:**
   ```bash
   npm install react-profiler
   ```

4. **Add timing logs:**
   ```javascript
   const start = performance.now();
   // ... do work ...
   const end = performance.now();
   console.log(`Operation took ${end - start}ms`);
   ```

**Solution Example:**
```javascript
// Optimize with lazy loading
const PostList = React.lazy(() => import('./PostList'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostList />
    </Suspense>
  );
}

// Memoize components to prevent unnecessary re-renders
const PostCard = React.memo(({ post }) => (
  <div>{post.title}</div>
));
```

---

## Using Error Boundaries for Debugging

```javascript
// Add this Error Boundary to catch and log errors
class DebugErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Send to error tracking service (e.g., Sentry)
    // Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', border: '1px solid red' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DebugErrorBoundary;
```

---

## Quick Debugging Checklist

- [ ] Check browser console for errors
- [ ] Check server console/logs
- [ ] Verify network requests in DevTools
- [ ] Check authorization headers
- [ ] Verify environment variables
- [ ] Check dependencies are installed
- [ ] Look for typos in URLs/variable names
- [ ] Verify database connection
- [ ] Check async/await usage
- [ ] Review error boundaries
- [ ] Use React DevTools and Profiler
- [ ] Enable network throttling to simulate slow connections
- [ ] Check test timeout settings
- [ ] Review error handler middleware
- [ ] Add console.log strategically (not excessively)

---

## Resources

- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react-devtools-tutorial.vercel.app/)
- [Jest Debugging](https://jestjs.io/docs/troubleshooting)
- [Cypress Debugging](https://docs.cypress.io/guides/guides/debugging)
- [MDN Web Docs](https://developer.mozilla.org/en-US/)

