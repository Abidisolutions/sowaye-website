// Scroll-triggered fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (nav) {
    if (window.scrollY > 60) {
      nav.style.background = 'rgba(8,10,20,0.95)';
      nav.style.boxShadow = '0 2px 30px rgba(0,0,0,0.4)';
    } else {
      nav.style.background = 'rgba(13,16,32,0.7)';
      nav.style.boxShadow = 'none';
    }
  }
});

// Staggered feature card animations
const featureCards = document.querySelectorAll('.feature-card');
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, (Array.from(featureCards).indexOf(entry.target)) * 80);
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

featureCards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(24px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  cardObserver.observe(card);
});

// Animated counter
function animateCounter(el, target, suffix='') {
  let start = 0;
  const duration = 1800;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-number');
      nums.forEach(n => {
        const text = n.textContent;
        if (text.includes('k')) animateCounter(n, 10, 'k+');
        else if (text.includes('%') && text.includes('98')) animateCounter(n, 98, '%');
        else if (text.includes('%')) animateCounter(n, 60, '%');
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);

(async function() {
    try {
        // IP-API se location fetch karna
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Asia ke countries ki list ya continent check
        const isAsia = data.continent_code === 'AS'; 
        
        const priceStarter = document.getElementById('price-starter');
        const pricePro = document.getElementById('price-pro');

        if (isAsia) {
            // Asia ke liye prices ($15 for Pro)
            priceStarter.innerText = priceStarter.getAttribute('data-asia');
            pricePro.innerText = pricePro.getAttribute('data-asia');
        } else {
            // USA/Global ke liye prices ($30 for Pro)
            priceStarter.innerText = priceStarter.getAttribute('data-global');
            pricePro.innerText = pricePro.getAttribute('data-global');
        }
    } catch (error) {
        console.log("Location detection failed, keeping default prices.");
    }
})();
// 1. Pricing Database
const regionDatabase = {
    "PK": { 
        name: "Pakistan", 
        currency: "Rs.", 
        starter: 2500, 
        pro: 8500, 
        format: "Rs. {price}" 
    },
    "AE": { 
        name: "UAE", 
        currency: "AED", 
        starter: 75, 
        pro: 150, 
        format: "{price} AED" 
    },
    "US": { 
        name: "Global", 
        currency: "$", 
        starter: 20, 
        pro: 35, 
        format: "${price}" 
    },
    "DEFAULT": { 
        name: "International", 
        currency: "$", 
        starter: 20, 
        pro: 35, 
        format: "${price}" 
    }
};
// 2. Main Logic Function
function updateSowayePricing(countryCode) {
    // Check if country exists in our database, else use default
    const data = regionDatabase[countryCode] || regionDatabase["DEFAULT"];

    // A. Format Prices (e.g., adding currency symbol)
    const starterFormatted = data.format.replace("{price}", data.starter);
    const proFormatted = data.format.replace("{price}", data.pro);

    // B. Update HTML Elements
    // Ham target karenge un IDs ko jo aapne pehle code mein di hain
    const elements = {
        'starter-price': starterFormatted,
        'pro-price': proFormatted,
        'comp-starter-price': starterFormatted,
        'comp-pro-price': proFormatted
    };

    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) el.innerText = elements[id];
    }

    // C. Update Region Badge
    const badge = document.getElementById('location-badge');
    if (badge) {
        badge.innerText = `${data.name} Region Active`;
    }

    // D. Update Checkout Buttons (Dynamic Links)
    // Taaki payment page par sahi price pass ho
    updateLinks(data, countryCode);
}
function updateLinks(data, region) {
    const buttons = [
        { id: 'starter-btn', plan: 'starter', price: data.starter },
        { id: 'pro-btn', plan: 'professional', price: data.pro }
    ];

    buttons.forEach(btn => {
        const el = document.getElementById(btn.id);
        if (el) {
            el.href = `checkout.html?plan=${btn.plan}&price=${btn.price}&currency=${data.currency}&region=${region}`;
        }
    });
}
// Jab user dropdown se khud change kare
function manualRegionChange(selectedVal) {
    updateSowayePricing(selectedVal);
}

// Jab page load ho aur IP detect ho
async function initPricing() {
    try {
        const res = await fetch('http://ip-api.com/json/');
        const ipData = await res.json();
        
        // Agar VPN on hai ya dropdown pehle se manually set hai
        updateSowayePricing(ipData.countryCode);
    } catch (e) {
        updateSowayePricing("DEFAULT");
    }
}

function toggleComparisonTable() {
    const comparisonContent = document.getElementById('comparisonContent');
    const toggleBtn = document.getElementById('toggleBtn');
    if (!comparisonContent || !toggleBtn) return;

    const isOpen = comparisonContent.classList.toggle('open');
    toggleBtn.innerHTML = isOpen
        ? 'Hide Comparison Table <span id="arrow">▾</span>'
        : 'Show Comparison Table <span id="arrow">▸</span>';
}

function setupComparisonRows() {
    const comparisonRows = document.querySelectorAll('.comparison-row');
    comparisonRows.forEach(row => {
        row.addEventListener('click', () => {
            row.classList.toggle('open');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initPricing();
    setupComparisonRows();
});
