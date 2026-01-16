/**
 * Performance Optimization Utilities
 * Targets Core Web Vitals: LCP <2.5s, INP <200ms
 */

// ============================================
// Memory-Cached LocalStorage (reduces disk I/O)
// ============================================
const StorageCache = {
  _cache: new Map(),
  _dirty: new Set(),
  _flushTimeout: null,

  /**
   * Get item from cache (falls back to localStorage)
   */
  get(key) {
    if (this._cache.has(key)) {
      return this._cache.get(key);
    }
    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        const parsed = JSON.parse(value);
        this._cache.set(key, parsed);
        return parsed;
      }
    } catch (e) {
      // Return raw value if not JSON
      try {
        const raw = localStorage.getItem(key);
        this._cache.set(key, raw);
        return raw;
      } catch (e2) {}
    }
    return null;
  },

  /**
   * Set item in cache (batched write to localStorage)
   */
  set(key, value) {
    this._cache.set(key, value);
    this._dirty.add(key);
    this._scheduleFlush();
  },

  /**
   * Remove item from cache and storage
   */
  remove(key) {
    this._cache.delete(key);
    this._dirty.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  },

  /**
   * Schedule batched flush to localStorage
   */
  _scheduleFlush() {
    if (this._flushTimeout) return;
    this._flushTimeout = setTimeout(() => {
      this._flush();
    }, 100); // Batch writes every 100ms
  },

  /**
   * Flush dirty items to localStorage
   */
  _flush() {
    this._flushTimeout = null;
    for (const key of this._dirty) {
      try {
        const value = this._cache.get(key);
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('StorageCache flush failed for', key);
      }
    }
    this._dirty.clear();
  },

  /**
   * Force immediate flush
   */
  flushNow() {
    if (this._flushTimeout) {
      clearTimeout(this._flushTimeout);
    }
    this._flush();
  }
};

// ============================================
// Lazy Loading with Intersection Observer
// ============================================
const LazyLoader = {
  _observer: null,

  /**
   * Initialize lazy loading for images
   */
  init() {
    if (!('IntersectionObserver' in window)) return;

    this._observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.dataset.src) {
            el.src = el.dataset.src;
            el.removeAttribute('data-src');
          }
          if (el.dataset.srcset) {
            el.srcset = el.dataset.srcset;
            el.removeAttribute('data-srcset');
          }
          this._observer.unobserve(el);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('[data-src], [loading="lazy"]').forEach(el => {
      this._observer.observe(el);
    });
  },

  /**
   * Observe a new element for lazy loading
   */
  observe(element) {
    if (this._observer && element) {
      this._observer.observe(element);
    }
  }
};

// ============================================
// Idle Callback Scheduler (non-blocking tasks)
// ============================================
const IdleScheduler = {
  _queue: [],
  _running: false,

  /**
   * Schedule a task to run when browser is idle
   */
  schedule(task, priority = 'low') {
    this._queue.push({ task, priority });
    this._processQueue();
  },

  /**
   * Process queue during idle time
   */
  _processQueue() {
    if (this._running || this._queue.length === 0) return;
    this._running = true;

    const callback = (deadline) => {
      while (this._queue.length > 0 && deadline.timeRemaining() > 5) {
        const { task } = this._queue.shift();
        try {
          task();
        } catch (e) {
          console.error('IdleScheduler task failed:', e);
        }
      }
      this._running = false;
      if (this._queue.length > 0) {
        this._processQueue();
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 2000 });
    } else {
      // Fallback for Safari
      setTimeout(() => callback({ timeRemaining: () => 50 }), 1);
    }
  }
};

// ============================================
// DOM Batch Updates (reduces layout thrashing)
// ============================================
const DOMBatcher = {
  _reads: [],
  _writes: [],
  _scheduled: false,

  /**
   * Schedule a DOM read operation
   */
  read(fn) {
    this._reads.push(fn);
    this._schedule();
  },

  /**
   * Schedule a DOM write operation
   */
  write(fn) {
    this._writes.push(fn);
    this._schedule();
  },

  /**
   * Schedule batch processing
   */
  _schedule() {
    if (this._scheduled) return;
    this._scheduled = true;
    requestAnimationFrame(() => this._flush());
  },

  /**
   * Process all batched operations
   */
  _flush() {
    this._scheduled = false;
    // Execute all reads first
    const reads = this._reads.splice(0);
    reads.forEach(fn => {
      try { fn(); } catch (e) {}
    });
    // Then execute all writes
    const writes = this._writes.splice(0);
    writes.forEach(fn => {
      try { fn(); } catch (e) {}
    });
  }
};

// ============================================
// Performance Metrics Reporter
// ============================================
const PerfMetrics = {
  /**
   * Measure and report Core Web Vitals
   */
  report() {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint (LCP)
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('[Perf] LCP:', Math.round(lastEntry.startTime), 'ms',
          lastEntry.startTime < 2500 ? '✓' : '✗');
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}

    // First Input Delay / Interaction to Next Paint (INP)
    try {
      new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.processingStart) {
            const delay = entry.processingStart - entry.startTime;
            console.log('[Perf] INP:', Math.round(delay), 'ms',
              delay < 200 ? '✓' : '✗');
          }
        });
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
    } catch (e) {}

    // Cumulative Layout Shift (CLS)
    try {
      let clsScore = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        console.log('[Perf] CLS:', clsScore.toFixed(3),
          clsScore < 0.1 ? '✓' : '✗');
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  }
};

// ============================================
// Object Pool for Reducing GC Pressure
// ============================================
class ObjectPool {
  constructor(factory, reset, initialSize = 10) {
    this._factory = factory;
    this._reset = reset;
    this._pool = [];
    for (let i = 0; i < initialSize; i++) {
      this._pool.push(factory());
    }
  }

  acquire() {
    return this._pool.length > 0 ? this._pool.pop() : this._factory();
  }

  release(obj) {
    this._reset(obj);
    if (this._pool.length < 50) {
      this._pool.push(obj);
    }
  }
}

// ============================================
// Initialize Performance Optimizations
// ============================================
function initPerformance() {
  // Initialize lazy loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LazyLoader.init());
  } else {
    LazyLoader.init();
  }

  // Report metrics in development
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    PerfMetrics.report();
  }

  // Flush storage cache before unload
  window.addEventListener('beforeunload', () => {
    StorageCache.flushNow();
  });

  console.log('[Perf] Performance optimizations initialized');
}

// Auto-initialize
initPerformance();

// Export for use in app.js
window.StorageCache = StorageCache;
window.LazyLoader = LazyLoader;
window.IdleScheduler = IdleScheduler;
window.DOMBatcher = DOMBatcher;
window.PerfMetrics = PerfMetrics;
window.ObjectPool = ObjectPool;
