// Tent Builder Logic - Enhanced version

// Configuration data
const builderData = {
    experience: null,
    tentSize: null,
    medium: null,
    mediumDetails: {
        soilBrand: null,
        customSoil: null,
        cocoRatio: null,
        customCoco: null,
        hydroType: null,
        customHydro: null
    },
    potType: null,
    potSize: null,
    plantCount: null,
    nutrients: {
        line: null,
        customNutrient: null,
        gaiaProducts: [],
        supplements: null
    },
    plantType: null,
    strainType: null
};

// Validation rules
const tentCapacity = {
    '2x2': { maxPlants: 2, recommended: 1 },
    '3x3': { maxPlants: 4, recommended: 3 },
    '4x4': { maxPlants: 6, recommended: 4 },
    '5x5': { maxPlants: 9, recommended: 6 }
};

// Current step tracker
let currentStep = 1;
const totalSteps = 8;

// Initialize the builder
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateNavigationButtons();
});

function setupEventListeners() {
    // Option card selections
    document.querySelectorAll('.option-card[data-value]').forEach(card => {
        card.addEventListener('click', function() {
            handleCardSelection(this);
        });
    });

    // Medium detail dropdowns
    document.getElementById('soil-brand')?.addEventListener('change', handleSoilSelection);
    document.getElementById('coco-ratio')?.addEventListener('change', handleCocoSelection);
    document.getElementById('hydro-type')?.addEventListener('change', handleHydroSelection);

    // Container selections
    document.getElementById('pot-type')?.addEventListener('change', savePotType);
    document.getElementById('pot-size')?.addEventListener('change', savePotSize);

    // Plant count
    document.getElementById('plant-count')?.addEventListener('change', validatePlantSetup);

    // Nutrient selections
    document.getElementById('nutrient-line')?.addEventListener('change', handleNutrientSelection);
    
    // Genetics
    document.getElementById('plant-type')?.addEventListener('change', saveGeneticsData);
    document.getElementById('strain-type')?.addEventListener('change', saveGeneticsData);

    // Navigation buttons
    document.getElementById('btn-next')?.addEventListener('click', goToNextStep);
    document.getElementById('btn-back')?.addEventListener('click', goToPreviousStep);
    
    // Generate PDF button
    document.getElementById('generate-pdf')?.addEventListener('click', generatePDF);
}

function handleCardSelection(card) {
    const step = card.closest('.step-content').id;
    const value = card.getAttribute('data-value');
    
    // Remove selection from siblings
    card.parentElement.querySelectorAll('.option-card').forEach(c => {
        c.classList.remove('selected');
    });
    
    // Add selection to clicked card
    card.classList.add('selected');
    
    // Save data based on step
    switch(step) {
        case 'step-1':
            builderData.experience = value;
            break;
        case 'step-2':
            builderData.tentSize = value;
            break;
        case 'step-3':
            builderData.medium = value;
            showMediumWarning(value);
            showMediumDetails(value);
            break;
    }
    
    // Enable next button
    document.getElementById('btn-next').disabled = false;
}

function showMediumWarning(medium) {
    if (medium === 'hydro' && builderData.experience === 'beginner') {
        alert('Note: Hydroponics can be challenging for beginners. Consider starting with soil or coco coir for your first grow.');
    }
}

function showMediumDetails(medium) {
    // Show the medium details container
    const mediumDetails = document.getElementById('medium-details');
    mediumDetails.style.display = 'block';
    
    // Hide all specific sections
    document.getElementById('soil-details').style.display = 'none';
    document.getElementById('coco-details').style.display = 'none';
    document.getElementById('hydro-details').style.display = 'none';
    
    // Show the relevant section
    if (medium === 'soil') {
        document.getElementById('soil-details').style.display = 'block';
    } else if (medium === 'coco') {
        document.getElementById('coco-details').style.display = 'block';
    } else if (medium === 'hydro') {
        document.getElementById('hydro-details').style.display = 'block';
    }
}

function handleSoilSelection() {
    const soilBrand = document.getElementById('soil-brand').value;
    builderData.mediumDetails.soilBrand = soilBrand;
    
    const customGroup = document.getElementById('custom-soil-group');
    if (soilBrand === 'custom') {
        customGroup.style.display = 'block';
        document.getElementById('custom-soil').addEventListener('input', function() {
            builderData.mediumDetails.customSoil = this.value;
        });
    } else {
        customGroup.style.display = 'none';
    }
}

function handleCocoSelection() {
    const cocoRatio = document.getElementById('coco-ratio').value;
    builderData.mediumDetails.cocoRatio = cocoRatio;
    
    const customGroup = document.getElementById('custom-coco-group');
    if (cocoRatio === 'custom') {
        customGroup.style.display = 'block';
        document.getElementById('custom-coco').addEventListener('input', function() {
            builderData.mediumDetails.customCoco = this.value;
        });
    } else {
        customGroup.style.display = 'none';
    }
}

function handleHydroSelection() {
    const hydroType = document.getElementById('hydro-type').value;
    builderData.mediumDetails.hydroType = hydroType;
    
    const customGroup = document.getElementById('custom-hydro-group');
    if (hydroType === 'custom') {
        customGroup.style.display = 'block';
        document.getElementById('custom-hydro').addEventListener('input', function() {
            builderData.mediumDetails.customHydro = this.value;
        });
    } else {
        customGroup.style.display = 'none';
    }
}

function savePotType() {
    builderData.potType = document.getElementById('pot-type').value;
    checkStepCompletion();
}

function savePotSize() {
    builderData.potSize = parseInt(document.getElementById('pot-size').value);
    checkStepCompletion();
}

function handleNutrientSelection() {
    const nutrientLine = document.getElementById('nutrient-line').value;
    builderData.nutrients.line = nutrientLine;
    
    // Show/hide custom input
    const customGroup = document.getElementById('custom-nutrient-group');
    if (nutrientLine === 'custom') {
        customGroup.style.display = 'block';
        document.getElementById('custom-nutrient').addEventListener('input', function() {
            builderData.nutrients.customNutrient = this.value;
        });
    } else {
        customGroup.style.display = 'none';
    }
    
    // Show/hide Gaia Green products
    const gaiaProducts = document.getElementById('gaia-green-products');
    if (nutrientLine === 'gaia-green') {
        gaiaProducts.style.display = 'block';
        
        // Setup checkbox listeners
        document.querySelectorAll('input[name="gaia-product"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                builderData.nutrients.gaiaProducts = Array.from(
                    document.querySelectorAll('input[name="gaia-product"]:checked')
                ).map(cb => cb.value);
            });
        });
        
        // Initialize with checked items
        builderData.nutrients.gaiaProducts = Array.from(
            document.querySelectorAll('input[name="gaia-product"]:checked')
        ).map(cb => cb.value);
    } else {
        gaiaProducts.style.display = 'none';
    }
    
    // Save supplements
    document.getElementById('supplements').addEventListener('input', function() {
        builderData.nutrients.supplements = this.value;
    });
    
    checkStepCompletion();
}

function validatePlantSetup() {
    const plantCount = parseInt(document.getElementById('plant-count').value);
    
    if (!plantCount) return;
    
    builderData.plantCount = plantCount;
    
    const validation = document.getElementById('space-validation');
    const tentData = tentCapacity[builderData.tentSize];
    const potSize = builderData.potSize || 5; // Default to 5 gallon if not set yet
    
    if (!tentData) {
        validation.innerHTML = '<strong>⚠️ Please select a tent size first</strong>';
        validation.className = 'validation-message warning';
        document.getElementById('btn-next').disabled = true;
        return;
    }
    
    // Calculate space requirements
    const spacePerPlant = potSize >= 5 ? 1.5 : 1; // sq ft per plant
    const tentSizeNum = parseInt(builderData.tentSize);
    const totalSpace = tentSizeNum * tentSizeNum;
    const requiredSpace = plantCount * spacePerPlant;
    
    if (plantCount > tentData.maxPlants) {
        validation.innerHTML = `<strong>❌ Too many plants!</strong><br>
            Your ${builderData.tentSize} tent can fit a maximum of ${tentData.maxPlants} plants with ${potSize}-gallon pots.<br>
            We recommend ${tentData.recommended} plants for optimal growth.`;
        validation.className = 'validation-message error';
        document.getElementById('btn-next').disabled = true;
    } else if (requiredSpace > totalSpace * 0.8) {
        validation.innerHTML = `<strong>⚠️ Tight fit!</strong><br>
            This setup will work but plants may be crowded. Consider reducing plant count or pot size for better results.`;
        validation.className = 'validation-message warning';
        document.getElementById('btn-next').disabled = false;
    } else {
        validation.innerHTML = `<strong>✅ Perfect fit!</strong><br>
            Your ${plantCount} plants in ${potSize}-gallon pots will have plenty of room to thrive in your ${builderData.tentSize} tent.`;
        validation.className = 'validation-message success';
        document.getElementById('btn-next').disabled = false;
    }
}

function saveGeneticsData() {
    builderData.plantType = document.getElementById('plant-type').value;
    builderData.strainType = document.getElementById('strain-type').value;
    
    if (builderData.plantType && builderData.strainType) {
        document.getElementById('btn-next').disabled = false;
    }
}

function goToNextStep() {
    if (currentStep < totalSteps) {
        // Hide current step
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('completed');
        
        // Show next step
        currentStep++;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');
        
        // If we're on the review step, populate the summary
        if (currentStep === totalSteps) {
            populateReview();
        }
        
        updateNavigationButtons();
    }
}

function goToPreviousStep() {
    if (currentStep > 1) {
        // Hide current step
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');
        
        // Show previous step
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    const btnBack = document.getElementById('btn-back');
    const btnNext = document.getElementById('btn-next');
    
    // Back button
    btnBack.disabled = currentStep === 1;
    
    // Next button
    if (currentStep === totalSteps) {
        btnNext.style.display = 'none';
    } else {
        btnNext.style.display = 'block';
        // Check if current step has required selections
        checkStepCompletion();
    }
}

function checkStepCompletion() {
    const btnNext = document.getElementById('btn-next');
    let isComplete = false;
    
    switch(currentStep) {
        case 1:
            isComplete = builderData.experience !== null;
            break;
        case 2:
            isComplete = builderData.tentSize !== null;
            break;
        case 3:
            isComplete = builderData.medium !== null;
            break;
        case 4:
            isComplete = builderData.potType && builderData.potSize;
            break;
        case 5:
            isComplete = builderData.plantCount;
            break;
        case 6:
            isComplete = builderData.nutrients.line;
            break;
        case 7:
            isComplete = builderData.plantType && builderData.strainType;
            break;
        default:
            isComplete = true;
    }
    
    btnNext.disabled = !isComplete;
}

function populateReview() {
    const summary = document.getElementById('review-summary');
    
    const experienceLabels = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced'
    };
    
    const mediumLabels = {
        'soil': 'Soil',
        'coco': 'Coco Coir',
        'hydro': 'Hydroponics'
    };
    
    const potTypeLabels = {
        'fabric': 'Fabric Pots',
        'plastic': 'Plastic Pots',
        'air': 'Air Pots',
        'smart': 'Smart Pots',
        'hydro-net': 'Net Pots',
        'nursery': 'Nursery Pots'
    };
    
    const plantTypeLabels = {
        'auto': 'Autoflower',
        'photo': 'Photoperiod'
    };
    
    const strainLabels = {
        'indica': 'Indica',
        'sativa': 'Sativa',
        'hybrid': 'Hybrid'
    };
    
    // Build medium details string
    let mediumDetail = mediumLabels[builderData.medium];
    if (builderData.medium === 'soil' && builderData.mediumDetails.soilBrand) {
        const soilBrand = builderData.mediumDetails.soilBrand === 'custom' 
            ? builderData.mediumDetails.customSoil 
            : builderData.mediumDetails.soilBrand;
        mediumDetail += ` (${soilBrand})`;
    } else if (builderData.medium === 'coco' && builderData.mediumDetails.cocoRatio) {
        const cocoRatio = builderData.mediumDetails.cocoRatio === 'custom'
            ? builderData.mediumDetails.customCoco
            : builderData.mediumDetails.cocoRatio.replace('-', '% Coco / ') + '% Perlite';
        mediumDetail += ` (${cocoRatio})`;
    } else if (builderData.medium === 'hydro' && builderData.mediumDetails.hydroType) {
        const hydroType = builderData.mediumDetails.hydroType === 'custom'
            ? builderData.mediumDetails.customHydro
            : builderData.mediumDetails.hydroType.toUpperCase();
        mediumDetail += ` (${hydroType})`;
    }
    
    // Build nutrient string
    let nutrientDetail = 'Not specified';
    if (builderData.nutrients.line) {
        nutrientDetail = builderData.nutrients.line === 'custom'
            ? builderData.nutrients.customNutrient
            : builderData.nutrients.line.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        if (builderData.nutrients.line === 'gaia-green' && builderData.nutrients.gaiaProducts.length > 0) {
            nutrientDetail += ' (' + builderData.nutrients.gaiaProducts.length + ' products selected)';
        }
    }
    
    summary.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Experience Level:</span>
            <span class="summary-value">${experienceLabels[builderData.experience]}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Tent Size:</span>
            <span class="summary-value">${builderData.tentSize.toUpperCase()}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Growing Medium:</span>
            <span class="summary-value">${mediumDetail}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Container Type:</span>
            <span class="summary-value">${potTypeLabels[builderData.potType]}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Pot Size:</span>
            <span class="summary-value">${builderData.potSize} gallons</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Number of Plants:</span>
            <span class="summary-value">${builderData.plantCount}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Nutrient Line:</span>
            <span class="summary-value">${nutrientDetail}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Plant Type:</span>
            <span class="summary-value">${plantTypeLabels[builderData.plantType]}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Strain Type:</span>
            <span class="summary-value">${strainLabels[builderData.strainType]}</span>
        </div>
    `;
    
    // Calculate estimated budget
    const budgetEstimate = calculateBudget();
    document.getElementById('budget-estimate').innerHTML = `
        <h3>Estimated Equipment Budget</h3>
        <div class="price">$${budgetEstimate.min} - $${budgetEstimate.max}</div>
        <p style="font-size: 0.9rem; margin-top: 10px;">Based on quality equipment for your setup</p>
    `;
}

function calculateBudget() {
    let min = 0;
    let max = 0;
    
    // Tent costs
    const tentCosts = {
        '2x2': [80, 150],
        '3x3': [120, 220],
        '4x4': [150, 300],
        '5x5': [200, 400]
    };
    
    const tentCost = tentCosts[builderData.tentSize];
    min += tentCost[0];
    max += tentCost[1];
    
    // Lighting (rough estimates)
    const lightCosts = {
        '2x2': [100, 200],
        '3x3': [150, 300],
        '4x4': [200, 450],
        '5x5': [300, 600]
    };
    
    const lightCost = lightCosts[builderData.tentSize];
    min += lightCost[0];
    max += lightCost[1];
    
    // Medium costs
    const mediumCosts = {
        'soil': [30, 80],
        'coco': [40, 100],
        'hydro': [150, 400]
    };
    
    const medCost = mediumCosts[builderData.medium];
    min += medCost[0];
    max += medCost[1];
    
    // Ventilation, fans, misc
    min += 150;
    max += 350;
    
    // Nutrients and pots
    min += builderData.plantCount * 20;
    max += builderData.plantCount * 50;
    
    return { min, max };
}

function generatePDF() {
    // Access jsPDF from global scope
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(76, 175, 80);
    doc.text('Your Custom Grow Tent Setup Guide', 20, 20);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 28);
    
    // Setup Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Setup Summary', 20, 45);
    
    doc.setFontSize(11);
    let yPos = 55;
    
    const summaryData = [
        ['Experience Level:', builderData.experience.charAt(0).toUpperCase() + builderData.experience.slice(1)],
        ['Tent Size:', builderData.tentSize.toUpperCase()],
        ['Growing Medium:', builderData.medium.charAt(0).toUpperCase() + builderData.medium.slice(1)],
        ['Number of Plants:', builderData.plantCount.toString()],
        ['Pot Size:', `${builderData.potSize} gallons`],
        ['Plant Type:', builderData.plantType === 'auto' ? 'Autoflower' : 'Photoperiod'],
        ['Strain Type:', builderData.strainType.charAt(0).toUpperCase() + builderData.strainType.slice(1)]
    ];
    
    summaryData.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(label, 20, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(value, 80, yPos);
        yPos += 8;
    });
    
    // Equipment Checklist
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Equipment Checklist', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    const equipment = [
        `☐ Grow Tent (${builderData.tentSize})`,
        `☐ LED Grow Light (appropriate for ${builderData.tentSize} space)`,
        `☐ Inline Exhaust Fan with Carbon Filter`,
        `☐ Oscillating Circulation Fans (2)`,
        `☐ ${builderData.plantCount}x ${builderData.potSize}-gallon pots`,
        `☐ ${builderData.medium === 'soil' ? 'Quality potting soil' : builderData.medium === 'coco' ? 'Coco coir medium' : 'Hydroponic system'}`,
        `☐ Nutrients (appropriate for ${builderData.medium})`,
        `☐ pH Testing Kit`,
        `☐ Thermometer/Hygrometer`,
        `☐ Timer for lights`,
        `☐ Pruning scissors`,
        `☐ Watering can or pump`
    ];
    
    equipment.forEach(item => {
        doc.text(item, 25, yPos);
        yPos += 7;
    });
    
    // New page for instructions
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Setup Instructions', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    const instructions = [
        '1. Assemble your grow tent in your chosen location',
        '2. Install the exhaust fan and carbon filter at the top',
        '3. Hang your grow light at appropriate height',
        '4. Position circulation fans for airflow',
        '5. Place pots with your growing medium inside',
        '6. Set up light timer (18/6 for veg, 12/12 for flower)',
        '7. Calibrate pH testing equipment',
        '8. Plant your seeds/seedlings',
        '9. Monitor temperature (70-85°F) and humidity (40-70%)',
        '10. Follow feeding schedule for your chosen medium'
    ];
    
    instructions.forEach(instruction => {
        const lines = doc.splitTextToSize(instruction, 170);
        lines.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 7;
        });
        yPos += 3;
    });
    
    // Tips section
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Tips for ${builderData.experience.charAt(0).toUpperCase() + builderData.experience.slice(1)} Growers`, 20, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    const tips = getTipsForExperience();
    tips.forEach(tip => {
        const lines = doc.splitTextToSize(`• ${tip}`, 170);
        lines.forEach(line => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(line, 20, yPos);
            yPos += 7;
        });
    });
    
    // Save the PDF
    doc.save('grow-tent-setup-guide.pdf');
    
    // Show success message
    alert('Your custom grow guide has been generated! Check your downloads folder.');
}

function getTipsForExperience() {
    const allTips = {
        beginner: [
            'Start with quality soil - it\'s the most forgiving growing medium',
            'Don\'t overwater! Let soil dry between waterings',
            'Keep a grow journal to track your progress',
            'Start with autoflower seeds for easier timing',
            'Invest in a good pH meter - pH issues cause most problems',
            'Be patient - cannabis takes time to grow properly'
        ],
        intermediate: [
            'Experiment with LST (Low Stress Training) techniques',
            'Consider adding CO2 supplementation for bigger yields',
            'Fine-tune your nutrient feeding schedule',
            'Try different training methods like SCROG or topping',
            'Monitor your VPD (Vapor Pressure Deficit)',
            'Keep detailed notes on each strain\'s performance'
        ],
        advanced: [
            'Dial in your environment for maximum terpene production',
            'Experiment with UV supplementation during flower',
            'Try living soil or organic super soil methods',
            'Consider breeding your own genetics',
            'Implement IPM (Integrated Pest Management) protocols',
            'Fine-tune light spectrum for each growth stage'
        ]
    };
    
    return allTips[builderData.experience] || allTips.beginner;
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(amount);
}
