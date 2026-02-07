// Configuration globale
let buyChart, sellChart, combinedChart;
let chartData = {
    buy: [],
    sell: []
};
let previousData = null;

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
            },
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                        speed: 0.1
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'xy'
                },
                pan: {
                    enabled: true,
                    mode: 'xy'
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
    };

    // Graphique d'achat (vert)
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

    // Graphique de vente (rouge)
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

    // Graphique combiné
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
                    padding: 12
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy'
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy'
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
    // Conversion des données en format chandelier
    const buyCandles = data.buy.rates.map((rate, index) => ({
        x: index + 1,
        o: rate.price,
        h: rate.price * 1.001,
        l: rate.price * 0.999,
        c: rate.price
    }));

    const sellCandles = data.sell.rates.map((rate, index) => ({
        x: index + 1,
        o: rate.price,
        h: rate.price * 1.001,
        l: rate.price * 0.999,
        c: rate.price
    }));

    // Mise à jour graphique d'achat
    buyChart.data.datasets[0].data = buyCandles;
    buyChart.update('none');

    // Mise à jour graphique de vente
    sellChart.data.datasets[0].data = sellCandles;
    sellChart.update('none');

    // Mise à jour graphique combiné
    const labels = data.buy.rates.map((_, i) => `Offre ${i + 1}`);
    const buyPrices = data.buy.rates.map(r => r.price);
    const sellPrices = data.sell.rates.map(r => r.price);

    combinedChart.data.labels = labels;
    combinedChart.data.datasets[0].data = buyPrices;
    combinedChart.data.datasets[1].data = sellPrices;
    combinedChart.update('none');
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
