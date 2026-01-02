// ============================================
// $LATE WEBSITE - FINAL SCRIPT
// ============================================

// Configuration
const CONFIG = {
  DEXSCREENER_API: 'https://api.dexscreener.com/latest/dex/pairs/solana/33g47ycaz7la3dnw9spf19jggrycgmvak5pwvruqrr4j',
  UPDATE_INTERVAL: 30000,
  CONTRACT_ADDRESS: '6sf6zf7UpkqPEz3byHpK5mvPUr9xBCf8FaXSuTUkpump',
  TOTAL_SUPPLY: 1000000000,
  IS_MOBILE: window.innerWidth <= 768
};

// State
let appState = {
  carouselPaused: false,
  carouselSpeed: 'normal',
  lastDataUpdate: null
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 $LATE Website Initializing...');
  
  // Mobile detection
  detectMobile();
  
  // Initialize all components
  initComponents();
  
  // Load initial data
  loadCryptoData();
  
  // Setup auto-refresh (slower on mobile)
  const refreshInterval = CONFIG.IS_MOBILE ? 60000 : CONFIG.UPDATE_INTERVAL;
  setInterval(loadCryptoData, refreshInterval);
  
  console.log('✅ $LATE Website Ready!');
});

// ========== MOBILE DETECTION ==========
function detectMobile() {
  CONFIG.IS_MOBILE = window.innerWidth <= 768;
  
  // Toggle carousel/grid based on screen size
  const carousel = document.querySelector('.meme-carousel-container');
  const mobileGrid = document.querySelector('.mobile-meme-grid');
  
  if (CONFIG.IS_MOBILE) {
    if (carousel) carousel.style.display = 'none';
    if (mobileGrid) mobileGrid.style.display = 'grid';
  } else {
    if (carousel) carousel.style.display = 'block';
    if (mobileGrid) mobileGrid.style.display = 'none';
  }
}

// Listen for resize
window.addEventListener('resize', detectMobile);

// ========== INITIALIZE COMPONENTS ==========
function initComponents() {
  initCopyButton();
  initCarouselControls();
  animateSupplyCount();
  setupImageHandling();
}

// ========== COPY CONTRACT FUNCTION ==========
function initCopyButton() {
  const copyButton = document.getElementById('copyButton');
  if (!copyButton) return;
  
  copyButton.addEventListener('click', copyContract);
}

function copyContract() {
  const text = CONFIG.CONTRACT_ADDRESS;
  
  // Modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyFeedback(true);
    }).catch(err => {
      console.error('Clipboard error:', err);
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    showCopyFeedback(successful);
  } catch (err) {
    console.error('Fallback copy failed:', err);
    showCopyFeedback(false);
  }
  
  document.body.removeChild(textArea);
}

function showCopyFeedback(success) {
  const button = document.getElementById('copyButton');
  if (!button) return;
  
  const originalText = button.textContent;
  const originalBg = button.style.background;
  
  if (success) {
    button.textContent = '✅ Copied!';
    button.style.background = 'rgba(0, 255, 204, 0.3)';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = originalBg;
    }, 2000);
  } else {
    button.textContent = '❌ Failed';
    button.style.background = 'rgba(255, 68, 68, 0.3)';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = originalBg;
    }, 2000);
  }
}

// ========== SUPPLY COUNT ANIMATION ==========
function animateSupplyCount() {
  const supplyElement = document.getElementById('supplyCount');
  if (!supplyElement) return;
  
  const finalNumber = CONFIG.TOTAL_SUPPLY;
  let current = 0;
  const increment = finalNumber / 50;
  const stepTime = CONFIG.IS_MOBILE ? 30 : 20;
  
  function updateCount() {
    current += increment;
    if (current >= finalNumber) {
      supplyElement.textContent = formatNumber(finalNumber);
      return;
    }
    
    supplyElement.textContent = formatNumber(Math.floor(current));
    setTimeout(updateCount, stepTime);
  }
  
  // Start after a short delay
  setTimeout(updateCount, 500);
}

// ========== DEXSCREENER API ==========
async function loadCryptoData() {
  try {
    updateLoadingState(true);
    
    const data = await fetchDexScreenerData();
    
    if (data) {
      updateUIWithRealData(data);
    } else {
      useMockData();
    }
    
    updateLastUpdateTime();
  } catch (error) {
    console.error('Error loading crypto data:', error);
    useMockData();
  } finally {
    updateLoadingState(false);
  }
}

async function fetchDexScreenerData() {
  try {
    const response = await fetch(CONFIG.DEXSCREENER_API, {
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.pairs && result.pairs.length > 0) {
      return result.pairs[0];
    }
    
    return null;
  } catch (error) {
    console.error('DexScreener API error:', error);
    return null;
  }
}

function updateUIWithRealData(pairData) {
  // Market Cap
  updateDataElement('marketCap', pairData.marketCap, true);
  
  // 24h Volume
  updateDataElement('volume', pairData.volume?.h24, true);
  
  // Price with change indicator
  if (pairData.priceUsd) {
    const price = parseFloat(pairData.priceUsd);
    const change = pairData.priceChange ? parseFloat(pairData.priceChange.h24) : 0;
    const changeColor = change >= 0 ? '#00ff00' : '#ff4444';
    const changeSymbol = change >= 0 ? '↗' : '↘';
    
    let priceHTML = `$${price.toFixed(8)}`;
    
    if (!isNaN(change)) {
      priceHTML += ` <span style="color:${changeColor}; font-size:0.85em">${changeSymbol} ${Math.abs(change).toFixed(2)}%</span>`;
    }
    
    const priceElement = document.getElementById('price');
    if (priceElement) {
      priceElement.innerHTML = priceHTML;
      priceElement.className = change >= 0 ? 'value up' : 'value down';
    }
  }
  
  // Liquidity
  updateDataElement('liquidity', pairData.liquidity?.usd, true);
}

function updateDataElement(elementId, value, isCurrency = false) {
  const element = document.getElementById(elementId);
  if (!element || value === undefined || value === null) return;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return;
  
  element.textContent = isCurrency ? formatCurrency(numValue) : formatNumber(numValue);
}

function useMockData() {
  console.log('Using mock data as fallback');
  
  const mockData = {
    marketCap: 500000 + Math.random() * 1500000,
    volume: 100000 + Math.random() * 400000,
    price: 0.00001 + Math.random() * 0.00009,
    liquidity: 50000 + Math.random() * 150000
  };
  
  updateDataElement('marketCap', mockData.marketCap, true);
  updateDataElement('volume', mockData.volume, true);
  updateDataElement('liquidity', mockData.liquidity, true);
  
  const priceElement = document.getElementById('price');
  if (priceElement) {
    priceElement.textContent = `$${mockData.price.toFixed(8)}`;
  }
  
  const updateElement = document.getElementById('lastUpdate');
  if (updateElement) {
    updateElement.textContent = '⚠️ Using demo data';
  }
}

function updateLoadingState(isLoading) {
  // Optional: Add loading indicators
  if (isLoading) {
    document.body.style.cursor = 'wait';
  } else {
    document.body.style.cursor = 'default';
  }
}

function updateLastUpdateTime() {
  const element = document.getElementById('lastUpdate');
  if (!element) return;
  
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
  
  appState.lastDataUpdate = now;
  element.textContent = `🔄 Updated: ${timeString}`;
}

// ========== CAROUSEL CONTROLS ==========
function initCarouselControls() {
  // Skip carousel on mobile
  if (CONFIG.IS_MOBILE) return;
  
  const pauseBtn = document.querySelector('.pause-btn');
  const playBtn = document.querySelector('.play-btn');
  const fastBtn = document.querySelector('.fast-btn');
  const slowBtn = document.querySelector('.slow-btn');
  const carousel = document.querySelector('.meme-carousel-container');
  const track = document.querySelector('.meme-track');
  
  if (!track) return;
  
  // Event Listeners
  if (pauseBtn) pauseBtn.addEventListener('click', pauseCarousel);
  if (playBtn) playBtn.addEventListener('click', playCarousel);
  if (fastBtn) fastBtn.addEventListener('click', speedUpCarousel);
  if (slowBtn) slowBtn.addEventListener('click', slowDownCarousel);
  
  // Pause on hover
  if (carousel) {
    carousel.addEventListener('mouseenter', () => {
      if (!appState.carouselPaused) {
        track.classList.add('paused');
      }
    });
    
    carousel.addEventListener('mouseleave', () => {
      if (!appState.carouselPaused) {
        track.classList.remove('paused');
      }
    });
  }
  
  // Preload images for better performance
  preloadCarouselImages();
}

function pauseCarousel() {
  const track = document.querySelector('.meme-track');
  if (track) {
    track.classList.add('paused');
    appState.carouselPaused = true;
    showNotification('Carousel paused ⏸️');
  }
}

function playCarousel() {
  const track = document.querySelector('.meme-track');
  if (track) {
    track.classList.remove('paused');
    appState.carouselPaused = false;
    showNotification('Carousel playing ▶️');
  }
}

function speedUpCarousel() {
  const track = document.querySelector('.meme-track');
  if (track) {
    track.classList.remove('slow');
    track.classList.add('fast');
    appState.carouselSpeed = 'fast';
    showNotification('Speed: Fast ⚡');
  }
}

function slowDownCarousel() {
  const track = document.querySelector('.meme-track');
  if (track) {
    track.classList.remove('fast');
    track.classList.add('slow');
    appState.carouselSpeed = 'slow';
    showNotification('Speed: Slow 🐢');
  }
}

function preloadCarouselImages() {
  const images = document.querySelectorAll('.meme-img');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src) {
      const image = new Image();
      image.src = src;
    }
  });
}

// ========== IMAGE HANDLING ==========
function setupImageHandling() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Error handling
    img.addEventListener('error', function() {
      console.warn(`Failed to load image: ${this.src}`);
      this.style.opacity = '0.5';
      this.style.filter = 'grayscale(100%)';
      
      // Add alt text as fallback
      if (this.alt) {
        const fallback = document.createElement('div');
        fallback.className = 'image-fallback';
        fallback.textContent = this.alt;
        fallback.style.cssText = `
          background: rgba(0,255,204,0.1);
          padding: 10px;
          border-radius: 8px;
          margin-top: 5px;
          font-size: 0.9em;
        `;
        this.parentNode.insertBefore(fallback, this.nextSibling);
      }
    });
    
    // Add loading animation
    img.addEventListener('load', function() {
      this.style.animation = 'fadeIn 0.5s forwards';
    });
  });
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message) {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  // Create new notification
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 255, 204, 0.9);
    color: #000;
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 1000;
    animation: fadeInOut 2s ease;
    font-size: 0.9rem;
    box-shadow: 0 5px 15px rgba(0, 255, 204, 0.3);
  `;
  
  // Add animation style if not exists
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes fadeInOut {
        0%, 100% { 
          opacity: 0; 
          transform: translateX(-50%) translateY(20px); 
        }
        10%, 90% { 
          opacity: 1; 
          transform: translateX(-50%) translateY(0); 
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Remove after 2 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 2000);
}

// ========== HELPER FUNCTIONS ==========
function formatCurrency(value) {
  if (isNaN(value) || value === 0) return '$0';
  
  if (value >= 1000000000) {
    return '$' + (value / 1000000000).toFixed(2) + 'B';
  } else if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(2) + 'M';
  } else if (value >= 1000) {
    return '$' + (value / 1000).toFixed(2) + 'K';
  }
  
  return '$' + value.toFixed(2);
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ========== EXPORT FOR DEBUGGING ==========
if (typeof window !== 'undefined') {
  window.$LATE = {
    copyContract,
    loadCryptoData,
    pauseCarousel,
    playCarousel,
    speedUpCarousel,
    slowDownCarousel,
    refreshData: loadCryptoData
  };
}