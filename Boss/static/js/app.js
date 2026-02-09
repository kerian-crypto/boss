// Configuration globale
// Configuration globale
let buyChart, sellChart, combinedChart;
let globalData = null; // Stocke toutes les données (30 annonces)
let previousData = null;

// Variables de pagination


// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    loadData();
    
    // Actualisation automatique toutes les 30 secondes
    setInterval(loadData, 30000);
    
    // Bouton d'actualisation
    document.getElementById('refreshBtn').addEventListener('click', function() {
        loadData();
    });
});

// Initialisation des graphiques
// Initialisation des graphiques
function initCharts() {
    Chart.defaults.color = '#8b93a7';
    Chart.defaults.borderColor = '#252d3d';
    Chart.defaults.font.family = "'IBM Plex Mono', monospace";
    
    // Configuration commune pour les graphiques en chandelier
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#1a2332',
                borderColor: '#252d3d',
                borderWidth: 1,
                titleColor: '#e8ecf5',
                bodyColor: '#8b93a7',
                padding: 12,
                displayColors: false,
                callbacks: {
                    title: function(context) {
                        return 'Offre #' + (context[0].dataIndex + 1);
                    },
                    label: function(context) {
                        const data = context.raw;
                        return [
                            'Ouverture: ' + data.o.toFixed(2) + ' XAF',
                            'Plus haut: ' + data.h.toFixed(2) + ' XAF',
                            'Plus bas: ' + data.l.toFixed(2) + ' XAF',
                            'Clôture: ' + data.c.toFixed(2) + ' XAF'
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Offre P2P',
                    color: '#8b93a7'
                },
                grid: {
                    color: '#252d3d'
                },
                ticks: {
                    color: '#8b93a7',
                    callback: function(value, index, values) {
                        return '#' + (index + 1);
                    }
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Prix (XAF)',
                    color: '#8b93a7'
                },
                grid: {
                    color: '#252d3d'
                },
                ticks: {
                    color: '#8b93a7',
                    callback: function(value) {
                        return value.toFixed(0) + ' XAF';
                    }
                },
                beginAtZero: false // Important: ne pas commencer à 0
            }
        }
    };

    // Graphique d'achat (vert) - CHANDELIER
    const buyCtx = document.getElementById('buyChart').getContext('2d');
    buyChart = new Chart(buyCtx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: 'Taux d\'Achat',
                data: [],
                color: {
                    up: '#16c784',
                    down: '#ea3943',
                    unchanged: '#8b93a7'
                },
                borderColor: {
                    up: '#16c784',
                    down: '#ea3943',
                    unchanged: '#8b93a7'
                }
            }]
        },
        options: commonOptions
    });

    // Graphique de vente (rouge) - CHANDELIER
    const sellCtx = document.getElementById('sellChart').getContext('2d');
    sellChart = new Chart(sellCtx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: 'Taux de Vente',
                data: [],
                color: {
                    up: '#16c784',
                    down: '#ea3943',
                    unchanged: '#8b93a7'
                },
                borderColor: {
                    up: '#16c784',
                    down: '#ea3943',
                    unchanged: '#8b93a7'
                }
            }]
        },
        options: commonOptions
    });

    // Graphique combiné - GARDER EN LIGNE (comme avant)
    const combinedCtx = document.getElementById('combinedChart').getContext('2d');
    combinedChart = new Chart(combinedCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Achat (BUY)',
                    data: [],
                    borderColor: '#16c784',
                    backgroundColor: 'rgba(22, 199, 132, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#16c784',
                    pointBorderColor: '#0a0e17',
                    pointBorderWidth: 2
                },
                {
                    label: 'Vente (SELL)',
                    data: [],
                    borderColor: '#ea3943',
                    backgroundColor: 'rgba(234, 57, 67, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#ea3943',
                    pointBorderColor: '#0a0e17',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#e8ecf5',
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: '#1a2332',
                    borderColor: '#252d3d',
                    borderWidth: 1,
                    titleColor: '#e8ecf5',
                    bodyColor: '#8b93a7',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)} XAF`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#252d3d'
                    },
                    ticks: {
                        color: '#8b93a7'
                    }
                },
                y: {
                    beginAtZero: false, // IMPORTANT: ne pas commencer à 0
                    grid: {
                        color: '#252d3d'
                    },
                    ticks: {
                        color: '#8b93a7',
                        callback: function(value) {
                            return value.toFixed(0) + ' XAF';
                        }
                    }
                }
            }
        }
    });
}
// Chargement des données depuis l'API
async function loadData() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/rates');
        const data = await response.json();
        
        if (data.success) {
            updateCharts(data);
            updateStats(data);
            updateTables(data);
            updateTimestamp(data.timestamp);
            previousData = data;
        } else {
            console.error('Erreur:', data.error);
            alert('Erreur lors du chargement des données: ' + data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    } finally {
        showLoading(false);
    }
}

// Mise à jour des graphiques
function updateCharts(data) {
    console.log('Données reçues pour graphiques:', data);
    
    // Vérifier si les graphiques sont initialisés
    if (!buyChart || !sellChart || !combinedChart) {
        console.error('Graphiques non initialisés');
        return;
    }
    
    // Vérifier si les données existent
    if (!data.buy || !data.sell) {
        console.error('Données manquantes pour les graphiques');
        return;
    }
    
    // 1. Graphique d'achat (BUY) - Chandelier
    if (data.buy.rates && data.buy.rates.length > 0) {
        // Créer un chandelier par offre
        const buyCandles = data.buy.rates.map((rate, index) => {
            // Pour un chandelier, nous avons besoin de O, H, L, C
            // Pour simuler un chandelier, nous utilisons le même prix avec une petite variation
            const price = rate.price;
            return {
                x: index, // Position
                o: price * 0.998,  // Ouverture: légèrement inférieur
                h: price * 1.002,  // Plus haut
                l: price * 0.995,  // Plus bas
                c: price * 1.001   // Clôture: légèrement supérieur
            };
        });
        
        console.log('Chandeliers Achat:', buyCandles);
        buyChart.data.datasets[0].data = buyCandles;
        buyChart.update('none');
    }
    
    // 2. Graphique de vente (SELL) - Chandelier
    if (data.sell.rates && data.sell.rates.length > 0) {
        const sellCandles = data.sell.rates.map((rate, index) => {
            const price = rate.price;
            return {
                x: index,
                o: price * 0.998,
                h: price * 1.002,
                l: price * 0.995,
                c: price * 1.001
            };
        });
        
        console.log('Chandeliers Vente:', sellCandles);
        sellChart.data.datasets[0].data = sellCandles;
        sellChart.update('none');
    }
    
    // 3. Graphique combiné - Garder en ligne comme avant
    if (data.buy.rates && data.sell.rates) {
        const labels = data.buy.rates.map((_, i) => `Offre ${i + 1}`);
        const buyPrices = data.buy.rates.map(r => r.price);
        const sellPrices = data.sell.rates.map(r => r.price);
        
        combinedChart.data.labels = labels;
        combinedChart.data.datasets[0].data = buyPrices;
        combinedChart.data.datasets[1].data = sellPrices;
        combinedChart.update('none');
        console.log('Graphique combiné mis à jour');
    }
}
// Mise à jour des statistiques
function updateStats(data) {
    const buyPrices = data.buy.rates.map(r => r.price);
    const sellPrices = data.sell.rates.map(r => r.price);
    
    const avgBuy = buyPrices.reduce((a, b) => a + b, 0) / buyPrices.length;
    const avgSell = sellPrices.reduce((a, b) => a + b, 0) / sellPrices.length;
    const spread = avgSell - avgBuy;
    const spreadPercent = (spread / avgBuy) * 100;
    
    const totalVolume = data.buy.rates.reduce((sum, r) => sum + r.volume, 0) +
                        data.sell.rates.reduce((sum, r) => sum + r.volume, 0);

    // Calcul des changements
    let buyChange = 0;
    let sellChange = 0;
    
    if (previousData) {
        const prevAvgBuy = previousData.buy.rates.reduce((sum, r) => sum + r.price, 0) / previousData.buy.rates.length;
        const prevAvgSell = previousData.sell.rates.reduce((sum, r) => sum + r.price, 0) / previousData.sell.rates.length;
        
        buyChange = ((avgBuy - prevAvgBuy) / prevAvgBuy) * 100;
        sellChange = ((avgSell - prevAvgSell) / prevAvgSell) * 100;
    }

    // Mise à jour de l'affichage
    document.getElementById('avgBuyPrice').textContent = avgBuy.toFixed(2) + ' XAF';
    document.getElementById('avgSellPrice').textContent = avgSell.toFixed(2) + ' XAF';
    document.getElementById('spreadValue').textContent = spread.toFixed(2) + ' XAF';
    document.getElementById('spreadPercent').textContent = spreadPercent.toFixed(2) + '%';
    document.getElementById('totalVolume').textContent = totalVolume.toFixed(2);

    // Mise à jour des changements avec couleurs
    updateChangeElement('buyChange', buyChange);
    updateChangeElement('sellChange', sellChange);
}

// Mise à jour d'un élément de changement
function updateChangeElement(elementId, change) {
    const element = document.getElementById(elementId);
    const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';
    const color = change > 0 ? '#16c784' : change < 0 ? '#ea3943' : '#8b93a7';
    
    element.textContent = arrow + ' ' + Math.abs(change).toFixed(2) + '%';
    element.style.color = color;
}

// Mise à jour des tableaux
function updateTables(data) {
    updateTable('buyTableBody', data.buy.rates, 'buy');
    updateTable('sellTableBody', data.sell.rates, 'sell');
}

function updateTable(tableId, rates, type) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = '';
    
    rates.forEach((rate, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="price-${type}">${rate.price.toFixed(2)}</td>
            <td>${rate.volume.toFixed(2)}</td>
            <td>${rate.min.toFixed(0)} - ${rate.max.toFixed(0)}</td>
        `;
        
        // Animation d'apparition
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 30);
    });
}

// Mise à jour du timestamp
function updateTimestamp(timestamp) {
    const date = new Date(timestamp);
    const timeString = date.toLocaleTimeString('fr-FR');
    document.getElementById('lastUpdate').textContent = timeString;
}

// Affichage/masquage du loader
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

// Reset du zoom
function resetZoom(chartName) {
    switch(chartName) {
        case 'buyChart':
            buyChart.resetZoom();
            break;
        case 'sellChart':
            sellChart.resetZoom();
            break;
        case 'combinedChart':
            combinedChart.resetZoom();
            break;
    }
}

// Fonction pour vérifier si les éléments existent
function checkElements() {
    console.log('buyChart élément:', document.getElementById('buyChart'));
    console.log('sellChart élément:', document.getElementById('sellChart'));
    console.log('combinedChart élément:', document.getElementById('combinedChart'));
    
    // Vérifier si Chart est défini
    console.log('Chart global:', typeof Chart);
    
    // Vérifier si le plugin candlestick est disponible
    console.log('Candlestick disponible:', Chart.controllers.candlestick ? 'Oui' : 'Non');
}




// Variables de pagination
let currentBuyPage = 1;
let currentSellPage = 1;
const itemsPerPage = 10; // 10 annonces par page

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    
    // Pagination - Boutons Achat
    document.getElementById('prevBuyBtn').addEventListener('click', function() {
        if (currentBuyPage > 1) {
            currentBuyPage--;
            updateTables();
        }
    });
    
    document.getElementById('nextBuyBtn').addEventListener('click', function() {
        if (currentBuyPage < 3) { // 30 annonces / 10 par page = 3 pages
            currentBuyPage++;
            updateTables();
        }
    });
    
    // Pagination - Boutons Vente
    document.getElementById('prevSellBtn').addEventListener('click', function() {
        if (currentSellPage > 1) {
            currentSellPage--;
            updateTables();
        }
    });
    
    document.getElementById('nextSellBtn').addEventListener('click', function() {
        if (currentSellPage < 3) {
            currentSellPage++;
            updateTables();
        }
    });
    
    // Actualisation automatique toutes les 30 secondes
    setInterval(loadData, 30000);
});

// Mise à jour des graphiques pour 30 annonces
function updateCharts(data) {
    console.log('Données reçues pour graphiques:', data);
    
    // Vérifier si les graphiques sont initialisés
    if (!buyChart || !sellChart || !combinedChart) {
        console.error('Graphiques non initialisés');
        return;
    }
    
    // Vérifier si les données existent
    if (!data.buy || !data.sell) {
        console.error('Données manquantes pour les graphiques');
        return;
    }
    
    // 1. Graphique d'achat (BUY) - Chandelier avec 30 annonces
    if (data.buy.rates && data.buy.rates.length > 0) {
        // Créer un chandelier par offre (sur les 30 annonces)
        const buyCandles = data.buy.rates.map((rate, index) => {
            const price = rate.price;
            return {
                x: index + 1, // Position 1 à 30
                o: price * 0.999,  // Ouverture
                h: price * 1.001,  // Plus haut
                l: price * 0.998,  // Plus bas
                c: price           // Clôture
            };
        });
        
        console.log('Chandeliers Achat (30):', buyCandles);
        buyChart.data.datasets[0].data = buyCandles;
        buyChart.update('none');
    }
    
    // 2. Graphique de vente (SELL) - Chandelier avec 30 annonces
    if (data.sell.rates && data.sell.rates.length > 0) {
        const sellCandles = data.sell.rates.map((rate, index) => {
            const price = rate.price;
            return {
                x: index + 1,
                o: price * 0.999,
                h: price * 1.001,
                l: price * 0.998,
                c: price
            };
        });
        
        console.log('Chandeliers Vente (30):', sellCandles);
        sellChart.data.datasets[0].data = sellCandles;
        sellChart.update('none');
    }
    
    // 3. Graphique combiné - Afficher les 30 annonces
    if (data.buy.rates && data.sell.rates) {
        const labels = data.buy.rates.map((_, i) => `A${i + 1}`);
        const buyPrices = data.buy.rates.map(r => r.price);
        const sellPrices = data.sell.rates.map(r => r.price);
        
        combinedChart.data.labels = labels;
        combinedChart.data.datasets[0].data = buyPrices;
        combinedChart.data.datasets[1].data = sellPrices;
        combinedChart.update('none');
        console.log('Graphique combiné mis à jour avec 30 annonces');
    }
}

// Mise à jour des tableaux avec pagination
function updateTables() {
    if (!globalData) return;
    
    updateTable('buyTableBody', globalData.buy.rates, 'buy', currentBuyPage);
    updateTable('sellTableBody', globalData.sell.rates, 'sell', currentSellPage);
    
    // Mettre à jour les informations de page
    document.getElementById('buyPageInfo').textContent = 
        `Page ${currentBuyPage}/3`;
    document.getElementById('sellPageInfo').textContent = 
        `Page ${currentSellPage}/3`;
}

function updateTable(tableId, rates, type, page) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = '';
    
    // Calculer les indices pour la pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageRates = rates.slice(startIndex, endIndex);
    
    pageRates.forEach((rate, index) => {
        const globalIndex = startIndex + index;
        const row = tbody.insertRow();
        
        // Formater les méthodes de paiement
        const paymentsHtml = rate.payments && rate.payments.length > 0 
            ? rate.payments.map(p => `<span class="payment-method">${p}</span>`).join(', ')
            : 'N/A';
        
        row.innerHTML = `
            <td>${globalIndex + 1}</td>
            <td class="price-${type}">${rate.price.toFixed(2)}</td>
            <td>${rate.volume.toFixed(2)}</td>
            <td>${rate.min.toFixed(0)} - ${rate.max.toFixed(0)}</td>
            <td class="payments">${paymentsHtml}</td>
        `;
        
        // Animation d'apparition
        row.style.opacity = '0';
        row.style.transform = 'translateY(10px)';
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 20);
    });
}

// Chargement des données depuis l'API
async function loadData() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/rates');
        const data = await response.json();
        
        if (data.success) {
            // Sauvegarder les données globalement
            globalData = data;
            
            updateCharts(data);
            updateStats(data);
            updateTables(); // Utilise la pagination
            updateTimestamp(data.timestamp);
            previousData = data;
        } else {
            console.error('Erreur:', data.error);
            alert('Erreur lors du chargement des données: ' + data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    } finally {
        showLoading(false);
    }
}