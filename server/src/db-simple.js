// Simple in-memory database alternative
let users = new Map();
let posts = [];
let interactions = [];
let events = [];
let nextPostId = 1;
let nextInteractionId = 1;
let nextEventId = 1;

export function initSchema() {
  // Initialize with some sample data
  users.set('0x742d35Cc6635C0532FED36077723295bb9c3DDDD', {
    address: '0x742d35Cc6635C0532FED36077723295bb9c3DDDD',
    username: 'Deborah',
    created_at: Math.floor(Date.now() / 1000)
  });
}

// Users
export const upsertUser = {
  run: (address, username) => {
    users.set(address, {
      address,
      username,
      created_at: Math.floor(Date.now() / 1000)
    });
    return { changes: 1 };
  }
};

export const getUser = {
  get: (address) => users.get(address) || null
};

// Posts
export const insertPost = {
  run: (author, content, ipfs_cid) => {
    const post = {
      id: nextPostId++,
      author,
      content,
      ipfs_cid,
      created_at: Math.floor(Date.now() / 1000)
    };
    posts.unshift(post);
    return { lastInsertRowid: post.id, changes: 1 };
  }
};

export const updatePost = {
  run: (content, ipfs_cid, id) => {
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex !== -1) {
      posts[postIndex] = { ...posts[postIndex], content, ipfs_cid };
      return { changes: 1 };
    }
    return { changes: 0 };
  }
};

export const deletePost = {
  run: (id) => {
    const initialLength = posts.length;
    posts = posts.filter(p => p.id !== id);
    return { changes: initialLength - posts.length };
  }
};

export const getPostById = {
  get: (id) => posts.find(p => p.id === id) || null
};

export const listPosts = {
  all: (limit, offset) => {
    return posts.slice(offset, offset + limit);
  }
};

// Interactions
export const insertInteraction = {
  run: (post_id, user, type, comment_text) => {
    const interaction = {
      id: nextInteractionId++,
      post_id,
      user,
      type,
      comment_text,
      created_at: Math.floor(Date.now() / 1000)
    };
    interactions.push(interaction);
    return { lastInsertRowid: interaction.id, changes: 1 };
  }
};

export const listInteractionsByPost = {
  all: (post_id) => {
    return interactions.filter(i => i.post_id === post_id).sort((a, b) => b.id - a.id);
  }
};

// Events
export const insertEvent = {
  run: (event_name, tx_hash, block_number, data) => {
    // Check if event already exists
    const existing = events.find(e => e.tx_hash === tx_hash && e.event_name === event_name);
    if (existing) return { changes: 0 };

    const event = {
      id: nextEventId++,
      event_name,
      tx_hash,
      block_number,
      data,
      created_at: Math.floor(Date.now() / 1000)
    };
    events.push(event);
    return { lastInsertRowid: event.id, changes: 1 };
  }
};

export const listEvents = {
  all: (limit, offset) => {
    return events.sort((a, b) => b.id - a.id).slice(offset, offset + limit);
  }
};

// Initialize schema
initSchema();