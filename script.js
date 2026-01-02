// ============================================
// $LATE WEBSITE - SCRIPT
// ============================================

// Configuration
const CONFIG = {
  DEXSCREENER_API: 'https://api.dexscreener.com/latest/dex/pairs/solana/33g47ycaz7la3dnw9spf19jggrycgmvak5pwvruqrr4j',
  UPDATE_INTERVAL: 30000, // 30 seconds
  CONTRACT_ADDRESS: '6sf6zf7UpkqPEz3byHpK5mvPUr9xBCf8FaXSuTUkpump',
  TOTAL_SUPPLY: 1000000000
};

// Carousel state
let carouselState = {
  isPaused: false,
  speed: 'normal' // 'slow', 'normal', 'fast'
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 $LATE Website Initializing...');
  
  // Initialize components
  initCopyButton();
  animateSupplyCount();
  initCarousel();
  setupImageHandling();
  
  // Load crypto data
  loadCryptoData();
  
  // Auto-refresh data
  setInterval(loadCryptoData, CONFIG.UPDATE_INTERVAL);
  
  console.log('✅ $LATE Website Ready!');
});

// ========== CONTRACT COPY ==========
function copyContract() {
  const text = CONFIG.CONTRACT_ADDRESS;
  const copyButton = document.querySelector('.copy-btn');
  
  if (!copyButton) return;
  
  // Modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyFeedback(copyButton, true);
    }).catch(err => {
      console.error('Clipboard error:', err);
      fallbackCopyText(text, copyButton);
    });
  } else {
    fallbackCopyText(text, copyButton);
  }
}

function fallbackCopyText(text, button) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    showCopyFeedback(button, successful);
  } catch (err) {
    console.error('Fallback copy failed:', err);
    showCopyFeedback(button, false);
  }
  
  document.body.removeChild(textArea);
}

function showCopyFeedback(button, success) {
  const originalText = button.textContent;
  
  if (success) {
    button.textContent = '✅ Copied!';
    button.style.background = 'rgba(0, 255, 204, 0.3)';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 2000);
  } else {
    button.textContent = '❌ Failed';
    button.style.background = 'rgba(255, 68, 68, 0.3)';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 2000);
  }
}

function initCopyButton() {
  const copyButton = document.querySelector('.copy-btn');
  if (copyButton) {
    copyButton.onclick = null;
    copyButton.addEventListener('click', copyContract);
  }
}

// ========== SUPPLY ANIMATION ==========
function animateSupplyCount() {
  const supplyElement = document.getElementById('supplyCount');
  if (!supplyElement) return;
  
  const finalNumber = CONFIG.TOTAL_SUPPLY;
  let current = 0;
  const increment = finalNumber / 100;
  const stepTime = 20;
  
  function updateCount() {
    current += increment;
    if (current >= finalNumber) {
      supplyElement.textContent = formatNumber(finalNumber);
      return;
    }
    
    supplyElement.textContent = formatNumber(Math.floor(current));
    setTimeout(updateCount, stepTime);
  }
  
  setTimeout(updateCount, 500);
}

// ========== DEXSCREENER API ==========
async function loadCryptoData() {
  try {
    // Show loading
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
  }
}

async function fetchDexScreenerData() {
  try {
    const response = await fetch(CONFIG.DEXSCREENER_API, {
      cache: 'no-cache'
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
  if (document.getElementById('marketCap') && pairData.marketCap) {
    const marketCap = parseFloat(pairData.marketCap) || 0;
    document.getElementById('marketCap').textContent = formatCurrency(marketCap);
  }
  
  // 24h Volume
  if (document.getElementById('volume') && pairData.volume) {
    const volume = parseFloat(pairData.volume.h24) || 0;
    document.getElementById('volume').textContent = formatCurrency(volume);
  }
  
  // Price
  if (document.getElementById('price') && pairData.priceUsd) {
    const price = parseFloat(pairData.priceUsd);
    const change = pairData.priceChange ? parseFloat(pairData.priceChange.h24) : 0;
    const changeColor = change >= 0 ? '#00ff00' : '#ff4444';
    const changeSymbol = change >= 0 ? '↗' : '↘';
    
    let priceHTML = `$${price.toFixed(8)}`;
    
    if (!isNaN(change)) {
      priceHTML += ` <span style="color:${changeColor}; font-size:0.85em">${changeSymbol} ${Math.abs(change).toFixed(2)}%</span>`;
    }
    
    document.getElementById('price').innerHTML = priceHTML;
  }
  
  // Liquidity
  if (document.getElementById('liquidity') && pairData.liquidity && pairData.liquidity.usd) {
    const liquidity = parseFloat(pairData.liquidity.usd) || 0;
    document.getElementById('liquidity').textContent = formatCurrency(liquidity);
  }
}

function useMockData() {
  console.log('Using mock data as fallback');
  
  const mockData = {
    marketCap: 500000 + Math.random() * 1500000,
    volume: 100000 + Math.random() * 400000,
    price: 0.00001 + Math.random() * 0.00009,
    liquidity: 50000 + Math.random() * 150000
  };
  
  if (document.getElementById('marketCap')) {
    document.getElementById('marketCap').textContent = formatCurrency(mockData.marketCap);
  }
  
  if (document.getElementById('volume')) {
    document.getElementById('volume').textContent = formatCurrency(mockData.volume);
  }
  
  if (document.getElementById('price')) {
    document.getElementById('price').textContent = `$${mockData.price.toFixed(8)}`;
  }
  
  if (document.getElementById('liquidity')) {
    document.getElementById('liquidity').textContent = formatCurrency(mockData.liquidity);
  }
  
  if (document.getElementById('lastUpdate')) {
    document.getElementById('lastUpdate').textContent = '⚠️ Using demo data';
  }
}

function updateLoadingState(isLoading) {
  // Optional: Add loading indicators
}

function updateLastUpdateTime() {
  const element = document.getElementById('lastUpdate');
  if (!element) return;
  
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
  
  element.textContent = `🔄 Updated: ${timeString}`;
}

// ========== MEME CAROUSEL ==========
function initCarousel() {
  const carousel = document.querySelector('.meme-carousel-container');
  const track = document.querySelector('.meme-track');
  
  if (!carousel || !track) return;
  
  // Pause on hover
  carousel.addEventListener('mouseenter', function() {
    if (!carouselState.isPaused) {
      track.classList.add('paused');
    }
  });
  
  carousel.addEventListener('mouseleave', function() {
    if (!carouselState.isPaused) {
      track.classList.remove('paused');
    }
  });
  
  // Preload images
  preloadCarouselImages();
}

function pauseCarousel() {
  const track = document.querySelector('.meme-track');
  if (track) {
    track.classList.add('paused');
    carouselState.isPaused = true;
    showCarouselNotification('Carousel paused ⏸️');
  }
}

function playCarousel() {
  const track = document.querySelector('.meme-track');
  if (track) {
    track.classList.remove('paused');
    carouselState.isPaused = false;
    showCarouselNotification('Carousel playing ▶️');
  }
}

function speedUpCarousel() {
  const track = document.querySelector('.meme-track');
  if (track) {
    track.classList.remove('slow');
    track.classList.add('fast');
    carouselState.speed = 'fast';
    showCarouselNotification('Speed: Fast ⚡');
  }
}

function slowDownCarousel() {
  const track = document.querySelector('.meme-track');
  if (track) {
    track.classList.remove('fast');
    track.classList.add('slow');
    carouselState.speed = 'slow';
    showCarouselNotification('Speed: Slow 🐢');
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

function showCarouselNotification(message) {
  // Create and show notification
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 255, 204, 0.9);
    color: #000;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: bold;
    z-index: 1000;
    animation: fadeInOut 2s ease;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0%, 100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
      10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
}

// ========== IMAGE HANDLING ==========
function setupImageHandling() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    img.addEventListener('error', function() {
      console.warn(`Failed to load image: ${this.src}`);
      this.style.opacity = '0.5';
      this.style.filter = 'grayscale(100%)';
    });
  });
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

// Export for debugging
if (typeof window !== 'undefined') {
  window.$LATE = {
    copyContract,
    loadCryptoData,
    pauseCarousel,
    playCarousel,
    speedUpCarousel,
    slowDownCarousel
  };
}